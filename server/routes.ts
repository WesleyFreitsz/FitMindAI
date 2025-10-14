import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { parseUserInput, chatWithAI, estimateFoodNutrition } from "./ai";
import passport from "./auth";
import bcrypt from "bcrypt";
import { User as AppUser, Food, FoodLog } from "@shared/schema";
import { z } from "zod";

// Estende a interface global do Express para que o req.user seja tipado corretamente
declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends AppUser {}
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const authRouter = express.Router();
  const apiRouter = express.Router();

  // --- ROTAS DE AUTENTICAÇÃO (Públicas) ---
  authRouter.post("/register", async (req, res, next) => {
    try {
      const schema = z.object({
        name: z.string().min(2, "Nome é obrigatório"),
        email: z.string().email("Email inválido"),
        password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
        age: z.number().int().positive(),
        sex: z.string(),
        weight: z.number().positive(),
        height: z.number().positive(),
        goal: z.string(),
        activityLevel: z.string(),
      });
      const parsedBody = schema.parse(req.body);

      const existingUser = await storage.getUserByEmail(parsedBody.email);
      if (existingUser) {
        return res.status(400).json({ error: "Este e-mail já está em uso." });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(parsedBody.password, salt);

      const newUser = await storage.createUser({
        ...parsedBody,
        password: hashedPassword,
      });

      req.logIn(newUser, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.flatten() });
      }
      next(error);
    }
  });

  authRouter.post(
    "/login",
    passport.authenticate("local"),
    (req: Request, res: Response) => {
      const { password, ...safeUser } = req.user as AppUser;
      res.json(safeUser);
    }
  );

  authRouter.post(
    "/logout",
    (req: Request, res: Response, next: NextFunction) => {
      req.logout((err) => {
        if (err) return next(err);
        req.session.destroy(() => {
          res.clearCookie("connect.sid");
          res.status(200).json({ message: "Logout bem-sucedido." });
        });
      });
    }
  );

  authRouter.get("/me", (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      // Remove a senha antes de enviar a resposta
      const { password, ...safeUser } = req.user as AppUser;
      res.json(safeUser);
    } else {
      res.status(401).json(null); // Resposta esperada para usuário não logado
    }
  });

  // --- ROTAS DE API (Agora todas públicas por padrão) ---

  apiRouter.get("/user", (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      const { password, ...safeUser } = req.user as AppUser;
      res.json(safeUser);
    } else {
      res.json(null); // Retorna nulo se o usuário for convidado
    }
  });

  apiRouter.put("/user", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Não autorizado" });
    }
    const user = req.user as AppUser;
    const updated = await storage.updateUser(user.id, req.body);
    res.json(updated);
  });

  apiRouter.get("/foods", async (req: Request, res: Response) => {
    const query = req.query.q as string;
    const foods = query
      ? await storage.searchFoods(query)
      : await storage.getFoods();
    res.json(foods);
  });

  apiRouter.post("/foods/parse", async (req: Request, res: Response) => {
    let user: AppUser;
    if (req.isAuthenticated()) {
      user = req.user as AppUser;
    } else {
      // Cria um objeto de usuário convidado padrão para o contexto da IA
      user = {
        id: "guest",
        name: "Convidado",
        email: "",
        password: "",
        age: 25,
        sex: "masculino",
        weight: 70,
        height: 175,
        goal: "manter",
        activityLevel: "moderado",
      };
    }

    const { text } = req.body;
    const parsed = await parseUserInput(text, user);

    if (parsed.type === "food" && parsed.foods) {
      const detailedFoods = await Promise.all(
        parsed.foods.map(async (food) => {
          // Sempre estima com a IA
          return estimateFoodNutrition(food.name, food.portion, food.unit);
        })
      );
      // Retorna uma lista de comidas com todos os nutrientes calculados pela IA
      return res.json(detailedFoods.filter(Boolean));
    }

    // Retorna o resultado do parse se não for 'food' (ex: 'workout' ou 'question')
    res.json(parsed);
  });

  apiRouter.get("/food-logs", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.json([]); // Retorna array vazio para convidados
    }
    const user = req.user as AppUser;
    const date = req.query.date
      ? new Date(req.query.date as string)
      : new Date();
    const logs = await storage.getFoodLogs(user.id, date);

    const enrichedLogs = await Promise.all(
      logs.map(async (log: FoodLog) => {
        const food = await storage.getFoodById(log.foodId);
        return { ...log, food };
      })
    );
    res.json(enrichedLogs);
  });

  apiRouter.post("/food-logs", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Não autorizado" });
    }
    const user = req.user as AppUser;
    const { foodId, foodData, portion, meal } = req.body;

    let finalFoodId = foodId;

    // Se não houver ID, mas houver dados, cria um novo alimento
    if (!finalFoodId && foodData) {
      // Normaliza os dados da IA para uma porção de 100g antes de salvar
      const multiplier = 100 / (foodData.portion || 100);
      const normalizedFood = {
        name: foodData.name,
        calories: (foodData.calories || 0) * multiplier,
        protein: (foodData.protein || 0) * multiplier,
        carbs: (foodData.carbs || 0) * multiplier,
        fat: (foodData.fat || 0) * multiplier,
        servingSize: 100,
        servingUnit: "g",
      };
      const newFood = await storage.createFood(normalizedFood);
      finalFoodId = newFood.id;
    }

    if (!finalFoodId) {
      return res.status(400).json({ error: "foodId or foodData is required" });
    }

    const log = await storage.createFoodLog({
      userId: user.id,
      foodId: finalFoodId,
      portion,
      meal,
    });
    res.json(log);
  });

  apiRouter.delete("/food-logs/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Não autorizado" });
    }
    const { id } = req.params;
    const success = await storage.deleteFoodLog(id);
    if (success) {
      res.json({ message: "Log de alimento deletado com sucesso." });
    } else {
      res.status(404).json({ error: "Log de alimento não encontrado." });
    }
  });

  apiRouter.get("/exercises", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.json([]); // Retorna array vazio para convidados
    }
    const user = req.user as AppUser;
    const date = req.query.date
      ? new Date(req.query.date as string)
      : new Date();
    const exercises = await storage.getExercises(user.id, date);
    res.json(exercises);
  });

  apiRouter.post("/exercises", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Não autorizado" });
    }
    const user = req.user as AppUser;
    const exercise = await storage.createExercise({
      userId: user.id,
      ...req.body,
    });
    res.json(exercise);
  });

  apiRouter.post("/chat", async (req: Request, res: Response) => {
    let user: AppUser;
    if (req.isAuthenticated()) {
      user = req.user as AppUser;
    } else {
      // Cria um objeto de usuário convidado padrão para o contexto da IA
      user = {
        id: "guest",
        name: "Convidado",
        email: "",
        password: "",
        age: 25,
        sex: "masculino",
        weight: 70,
        height: 175,
        goal: "manter",
        activityLevel: "moderado",
      };
    }
    const { messages } = req.body;
    const response = await chatWithAI(messages, user);
    res.json({ message: response });
  });

  // Monta os routers nos caminhos corretos
  app.use("/api/auth", authRouter);
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
