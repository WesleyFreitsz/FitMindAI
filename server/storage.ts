import {
  type User,
  type InsertUser,
  type Food,
  type FoodLog,
  type InsertFoodLog,
  type Exercise,
  type InsertExercise,
  users,
  foods,
  foodLogs,
  exercises,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export interface Alarm {
  id: string;
  userId: string;
  time: string;
  label: string;
  enabled: boolean;
}

// Interface para o usuário sem a senha, para ser usado externamente
export type SafeUser = Omit<User, "password">;

export interface IStorage {
  // Métodos de Usuário
  getUser(id: string): Promise<SafeUser | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(
    id: string,
    data: Partial<InsertUser>
  ): Promise<SafeUser | undefined>;

  // Métodos de Alimentos
  getFoods(): Promise<Food[]>;
  getFoodById(id: string): Promise<Food | undefined>;
  searchFoods(query: string): Promise<Food[]>;
  createFood(food: Omit<Food, "id">): Promise<Food>;

  // Métodos de Log de Alimentos
  getFoodLogs(userId: string, date?: Date): Promise<FoodLog[]>;
  createFoodLog(log: InsertFoodLog): Promise<FoodLog>;
  deleteFoodLog(id: string): Promise<boolean>;

  // Métodos de Exercícios
  getExercises(userId: string, date?: Date): Promise<Exercise[]>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  deleteExercise(id: string): Promise<boolean>;

  // Métodos de Alarmes
  getAlarms(userId: string): Promise<Alarm[]>;
  createAlarm(alarm: Omit<Alarm, "id">): Promise<Alarm>;
  updateAlarm(
    id: string,
    data: Partial<Omit<Alarm, "id">>
  ): Promise<Alarm | undefined>;
  deleteAlarm(id: string): Promise<boolean>;
}

class DrizzleStorage implements IStorage {
  private db;

  constructor() {
    const client = postgres(process.env.DATABASE_URL!);
    this.db = drizzle(client);
  }

  // --- Métodos de Usuário ---
  async getUser(id: string): Promise<SafeUser | undefined> {
    const user = await this.db.select().from(users).where(eq(users.id, id));
    if (user.length > 0) {
      const { password, ...userWithoutPassword } = user[0];
      return userWithoutPassword;
    }
    return undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const user = await this.db.select().from(users).where(eq(users.id, id));
    return user[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const newUser = await this.db.insert(users).values(insertUser).returning();
    return newUser[0];
  }

  async updateUser(
    id: string,
    data: Partial<InsertUser>
  ): Promise<SafeUser | undefined> {
    const updatedUser = await this.db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    if (updatedUser.length > 0) {
      const { password, ...safeUser } = updatedUser[0];
      return safeUser;
    }
    return undefined;
  }
  // --- Métodos de Alimentos ---
  async getFoods(): Promise<Food[]> {
    return this.db.select().from(foods);
  }

  async getFoodById(id: string): Promise<Food | undefined> {
    const food = await this.db.select().from(foods).where(eq(foods.id, id));
    return food[0];
  }

  async searchFoods(query: string): Promise<Food[]> {
    return this.db
      .select()
      .from(foods)
      .where(sql`LOWER(${foods.name}) LIKE ${"%" + query.toLowerCase() + "%"}`);
  }

  async createFood(food: Omit<Food, "id">): Promise<Food> {
    const newFood = await this.db.insert(foods).values(food).returning();
    return newFood[0];
  }

  // --- Métodos de Log de Alimentos ---
  async getFoodLogs(userId: string, date?: Date): Promise<FoodLog[]> {
    if (date) {
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const day = date.getUTCDate();
      const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

      return this.db
        .select()
        .from(foodLogs)
        .where(
          and(
            eq(foodLogs.userId, userId),
            gte(foodLogs.timestamp, startOfDay),
            lte(foodLogs.timestamp, endOfDay)
          )
        );
    }
    return this.db.select().from(foodLogs).where(eq(foodLogs.userId, userId));
  }

  async createFoodLog(log: InsertFoodLog): Promise<FoodLog> {
    const newLog = await this.db.insert(foodLogs).values(log).returning();
    return newLog[0];
  }

  async deleteFoodLog(id: string): Promise<boolean> {
    const result = await this.db
      .delete(foodLogs)
      .where(eq(foodLogs.id, id))
      .returning({ id: foodLogs.id });
    return result.length > 0;
  }

  // --- Métodos de Exercícios ---
  async getExercises(userId: string, date?: Date): Promise<Exercise[]> {
    if (date) {
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const day = date.getUTCDate();
      const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

      return this.db
        .select()
        .from(exercises)
        .where(
          and(
            eq(exercises.userId, userId),
            gte(exercises.timestamp, startOfDay),
            lte(exercises.timestamp, endOfDay)
          )
        );
    }
    return this.db.select().from(exercises).where(eq(exercises.userId, userId));
  }

  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const newExercise = await this.db
      .insert(exercises)
      .values(exercise)
      .returning();
    return newExercise[0];
  }

  async deleteExercise(id: string): Promise<boolean> {
    const result = await this.db
      .delete(exercises)
      .where(eq(exercises.id, id))
      .returning({ id: exercises.id });
    return result.length > 0;
  }

  // --- Métodos de Alarmes ---
  private alarms: Map<string, Alarm> = new Map();

  async getAlarms(userId: string): Promise<Alarm[]> {
    return Array.from(this.alarms.values()).filter(
      (alarm) => alarm.userId === userId
    );
  }

  async createAlarm(alarm: Omit<Alarm, "id">): Promise<Alarm> {
    const id = randomUUID();
    const newAlarm: Alarm = { ...alarm, id };
    this.alarms.set(id, newAlarm);
    return newAlarm;
  }

  async updateAlarm(
    id: string,
    data: Partial<Omit<Alarm, "id">>
  ): Promise<Alarm | undefined> {
    const alarm = this.alarms.get(id);
    if (!alarm) return undefined;
    const updated = { ...alarm, ...data };
    this.alarms.set(id, updated);
    return updated;
  }

  async deleteAlarm(id: string): Promise<boolean> {
    return this.alarms.delete(id);
  }
}

export const storage = new DrizzleStorage();
