import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { parseFoodInput, estimateFoodNutrition, chatWithAI } from "./ai";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a default user for MVP
  const defaultUser = await storage.getUserByEmail("demo@fitmind.ai");
  let userId: string;
  
  if (!defaultUser) {
    const newUser = await storage.createUser({
      name: "João Silva",
      email: "demo@fitmind.ai",
      age: 28,
      sex: "masculino",
      weight: 78.5,
      height: 175,
      goal: "perder",
      activityLevel: "moderado"
    });
    userId = newUser.id;
  } else {
    userId = defaultUser.id;
  }

  // User routes
  app.get("/api/user", async (req, res) => {
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  });

  app.put("/api/user", async (req, res) => {
    const updated = await storage.updateUser(userId, req.body);
    res.json(updated);
  });

  // Food routes
  app.get("/api/foods", async (req, res) => {
    const query = req.query.q as string;
    const foods = query 
      ? await storage.searchFoods(query)
      : await storage.getFoods();
    res.json(foods);
  });

  app.post("/api/foods/parse", async (req, res) => {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const parsedFoods = await parseFoodInput(text);
    const results = [];

    for (const parsed of parsedFoods) {
      // Try to find in database first
      const dbFoods = await storage.searchFoods(parsed.name);
      let foodData;

      if (dbFoods.length > 0) {
        const dbFood = dbFoods[0];
        const portionMultiplier = parsed.portion / dbFood.servingSize;
        foodData = {
          ...dbFood,
          portion: parsed.portion,
          unit: parsed.unit,
          calories: dbFood.calories * portionMultiplier,
          protein: dbFood.protein * portionMultiplier,
          carbs: dbFood.carbs * portionMultiplier,
          fat: dbFood.fat * portionMultiplier,
        };
      } else {
        // Use AI to estimate nutrition
        const nutrition = await estimateFoodNutrition(parsed.name, parsed.portion, parsed.unit);
        if (nutrition) {
          // Create new food in database
          const newFood = await storage.createFood({
            name: nutrition.name,
            calories: nutrition.calories,
            protein: nutrition.protein,
            carbs: nutrition.carbs,
            fat: nutrition.fat,
            servingSize: nutrition.portion,
            servingUnit: nutrition.unit,
          });
          foodData = { ...newFood, portion: parsed.portion, unit: parsed.unit };
        }
      }

      if (foodData) {
        results.push(foodData);
      }
    }

    res.json(results);
  });

  // Food log routes
  app.get("/api/food-logs", async (req, res) => {
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const logs = await storage.getFoodLogs(userId, date);
    
    // Enrich with food data
    const enrichedLogs = await Promise.all(
      logs.map(async (log) => {
        const foods = await storage.getFoods();
        const food = foods.find(f => f.id === log.foodId);
        return { ...log, food };
      })
    );
    
    res.json(enrichedLogs);
  });

  app.post("/api/food-logs", async (req, res) => {
    const schema = z.object({
      foodId: z.string(),
      portion: z.number(),
      meal: z.string(),
    });

    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const log = await storage.createFoodLog({
      userId,
      ...result.data,
    });
    
    res.json(log);
  });

  app.delete("/api/food-logs/:id", async (req, res) => {
    const success = await storage.deleteFoodLog(req.params.id);
    res.json({ success });
  });

  // Exercise routes
  app.get("/api/exercises", async (req, res) => {
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const exercises = await storage.getExercises(userId, date);
    res.json(exercises);
  });

  app.post("/api/exercises", async (req, res) => {
    const schema = z.object({
      type: z.string(),
      duration: z.number(),
      intensity: z.number(),
      caloriesBurned: z.number(),
    });

    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const exercise = await storage.createExercise({
      userId,
      ...result.data,
    });
    
    res.json(exercise);
  });

  app.delete("/api/exercises/:id", async (req, res) => {
    const success = await storage.deleteExercise(req.params.id);
    res.json({ success });
  });

  // Alarm routes
  app.get("/api/alarms", async (req, res) => {
    const alarms = await storage.getAlarms(userId);
    res.json(alarms);
  });

  app.post("/api/alarms", async (req, res) => {
    const schema = z.object({
      time: z.string(),
      label: z.string(),
      enabled: z.boolean().default(true),
    });

    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const alarm = await storage.createAlarm({
      userId,
      ...result.data,
    });
    
    res.json(alarm);
  });

  app.put("/api/alarms/:id", async (req, res) => {
    const updated = await storage.updateAlarm(req.params.id, req.body);
    res.json(updated);
  });

  app.delete("/api/alarms/:id", async (req, res) => {
    const success = await storage.deleteAlarm(req.params.id);
    res.json({ success });
  });

  // Chat with AI
  app.post("/api/chat", async (req, res) => {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const response = await chatWithAI(messages);
    res.json({ message: response });
  });

  const httpServer = createServer(app);
  return httpServer;
}
