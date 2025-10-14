import {
  type User,
  type InsertUser,
  type Food,
  type FoodLog,
  type InsertFoodLog,
  type Exercise,
  type InsertExercise,
} from "@shared/schema";
import { randomUUID } from "crypto";

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
  getUserById(id: string): Promise<User | undefined>; // Retorna usuário completo para auth
  getUserByEmail(email: string): Promise<User | undefined>; // Interno, retorna com senha
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

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private foods: Map<string, Food> = new Map();
  private foodLogs: Map<string, FoodLog> = new Map();
  private exercises: Map<string, Exercise> = new Map();
  private alarms: Map<string, Alarm> = new Map();

  constructor() {
    // A base de dados de alimentos pré-cadastrados foi removida.
  }

  // --- Métodos de Usuário ---
  async getUser(id: string): Promise<SafeUser | undefined> {
    const user = this.users.get(id);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(
    id: string,
    data: Partial<InsertUser>
  ): Promise<SafeUser | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    const { password, ...safeUser } = updatedUser;
    return safeUser;
  }

  // --- Métodos de Alimentos ---
  async getFoods(): Promise<Food[]> {
    return Array.from(this.foods.values());
  }

  async getFoodById(id: string): Promise<Food | undefined> {
    return this.foods.get(id);
  }

  async searchFoods(query: string): Promise<Food[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.foods.values()).filter(
      (food) =>
        food && food.name && food.name.toLowerCase().includes(lowerQuery)
    );
  }

  async createFood(food: Omit<Food, "id">): Promise<Food> {
    const id = randomUUID();
    const newFood: Food = { ...food, id };
    this.foods.set(id, newFood);
    return newFood;
  }

  // --- Métodos de Log de Alimentos ---
  async getFoodLogs(userId: string, date?: Date): Promise<FoodLog[]> {
    const logs = Array.from(this.foodLogs.values()).filter(
      (log) => log.userId === userId
    );
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      return logs.filter((log) => {
        const logDate = new Date(log.timestamp);
        return logDate >= startOfDay && logDate <= endOfDay;
      });
    }
    return logs;
  }

  async createFoodLog(log: InsertFoodLog): Promise<FoodLog> {
    const id = randomUUID();
    const newLog: FoodLog = { ...log, id, timestamp: new Date() };
    this.foodLogs.set(id, newLog);
    return newLog;
  }

  async deleteFoodLog(id: string): Promise<boolean> {
    return this.foodLogs.delete(id);
  }

  // --- Métodos de Exercícios ---
  async getExercises(userId: string, date?: Date): Promise<Exercise[]> {
    const exercises = Array.from(this.exercises.values()).filter(
      (ex) => ex.userId === userId
    );
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      return exercises.filter((ex) => {
        const exDate = new Date(ex.timestamp);
        return exDate >= startOfDay && exDate <= endOfDay;
      });
    }
    return exercises;
  }

  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const id = randomUUID();
    const newExercise: Exercise = { ...exercise, id, timestamp: new Date() };
    this.exercises.set(id, newExercise);
    return newExercise;
  }

  async deleteExercise(id: string): Promise<boolean> {
    return this.exercises.delete(id);
  }

  // --- Métodos de Alarmes ---
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

export const storage = new MemStorage();
