import { 
  type User, 
  type InsertUser, 
  type Food, 
  type FoodLog, 
  type InsertFoodLog, 
  type Exercise,
  type InsertExercise 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface Alarm {
  id: string;
  userId: string;
  time: string;
  label: string;
  enabled: boolean;
}

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  
  // Food methods
  getFoods(): Promise<Food[]>;
  searchFoods(query: string): Promise<Food[]>;
  createFood(food: Omit<Food, 'id'>): Promise<Food>;
  
  // Food log methods
  getFoodLogs(userId: string, date?: Date): Promise<FoodLog[]>;
  createFoodLog(log: InsertFoodLog): Promise<FoodLog>;
  deleteFoodLog(id: string): Promise<boolean>;
  
  // Exercise methods
  getExercises(userId: string, date?: Date): Promise<Exercise[]>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  deleteExercise(id: string): Promise<boolean>;
  
  // Alarm methods
  getAlarms(userId: string): Promise<Alarm[]>;
  createAlarm(alarm: Omit<Alarm, 'id'>): Promise<Alarm>;
  updateAlarm(id: string, data: Partial<Omit<Alarm, 'id'>>): Promise<Alarm | undefined>;
  deleteAlarm(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private foods: Map<string, Food>;
  private foodLogs: Map<string, FoodLog>;
  private exercises: Map<string, Exercise>;
  private alarms: Map<string, Alarm>;

  constructor() {
    this.users = new Map();
    this.foods = new Map();
    this.foodLogs = new Map();
    this.exercises = new Map();
    this.alarms = new Map();
    
    // Seed with common foods
    this.seedFoods();
  }

  private seedFoods() {
    const commonFoods: Omit<Food, 'id'>[] = [
      { name: 'Peito de Frango Grelhado', calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: 100, servingUnit: 'g' },
      { name: 'Arroz Integral', calories: 130, protein: 2.7, carbs: 27.3, fat: 1.1, servingSize: 100, servingUnit: 'g' },
      { name: 'Ovos', calories: 70, protein: 6, carbs: 0.6, fat: 5, servingSize: 1, servingUnit: 'unidade' },
      { name: 'Whey Protein', calories: 120, protein: 24, carbs: 3, fat: 1, servingSize: 30, servingUnit: 'g' },
      { name: 'Banana', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, servingSize: 100, servingUnit: 'g' },
      { name: 'Batata Doce', calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, servingSize: 100, servingUnit: 'g' },
      { name: 'Brócolis', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, servingSize: 100, servingUnit: 'g' },
      { name: 'Pão Integral', calories: 70, protein: 3, carbs: 12, fat: 1, servingSize: 1, servingUnit: 'fatia' },
    ];

    commonFoods.forEach(food => this.createFood(food));
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...data };
    this.users.set(id, updated);
    return updated;
  }

  // Food methods
  async getFoods(): Promise<Food[]> {
    return Array.from(this.foods.values());
  }

  async searchFoods(query: string): Promise<Food[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.foods.values()).filter(food =>
      food.name.toLowerCase().includes(lowerQuery)
    );
  }

  async createFood(food: Omit<Food, 'id'>): Promise<Food> {
    const id = randomUUID();
    const newFood: Food = { ...food, id };
    this.foods.set(id, newFood);
    return newFood;
  }

  // Food log methods
  async getFoodLogs(userId: string, date?: Date): Promise<FoodLog[]> {
    const logs = Array.from(this.foodLogs.values()).filter(log => log.userId === userId);
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      return logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= startOfDay && logDate <= endOfDay;
      });
    }
    
    return logs;
  }

  async createFoodLog(log: InsertFoodLog): Promise<FoodLog> {
    const id = randomUUID();
    const newLog: FoodLog = { 
      ...log, 
      id, 
      timestamp: new Date() 
    };
    this.foodLogs.set(id, newLog);
    return newLog;
  }

  async deleteFoodLog(id: string): Promise<boolean> {
    return this.foodLogs.delete(id);
  }

  // Exercise methods
  async getExercises(userId: string, date?: Date): Promise<Exercise[]> {
    const exercises = Array.from(this.exercises.values()).filter(ex => ex.userId === userId);
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      return exercises.filter(ex => {
        const exDate = new Date(ex.timestamp);
        return exDate >= startOfDay && exDate <= endOfDay;
      });
    }
    
    return exercises;
  }

  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const id = randomUUID();
    const newExercise: Exercise = { 
      ...exercise, 
      id, 
      timestamp: new Date() 
    };
    this.exercises.set(id, newExercise);
    return newExercise;
  }

  async deleteExercise(id: string): Promise<boolean> {
    return this.exercises.delete(id);
  }

  // Alarm methods
  async getAlarms(userId: string): Promise<Alarm[]> {
    return Array.from(this.alarms.values()).filter(alarm => alarm.userId === userId);
  }

  async createAlarm(alarm: Omit<Alarm, 'id'>): Promise<Alarm> {
    const id = randomUUID();
    const newAlarm: Alarm = { ...alarm, id };
    this.alarms.set(id, newAlarm);
    return newAlarm;
  }

  async updateAlarm(id: string, data: Partial<Omit<Alarm, 'id'>>): Promise<Alarm | undefined> {
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
