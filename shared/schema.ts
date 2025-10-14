import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  real,
  timestamp,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enum para tipo de refeição
export const mealEnum = pgEnum("meal_type", [
  "cafe",
  "almoco",
  "jantar",
  "lanches",
]);

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  age: integer("age").notNull(),
  sex: text("sex").notNull(),
  weight: real("weight").notNull(),
  height: real("height").notNull(),
  goal: text("goal").notNull(),
  activityLevel: text("activity_level").notNull(),
});

export const foods = pgTable("foods", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  calories: real("calories").notNull(),
  protein: real("protein").notNull(),
  carbs: real("carbs").notNull(),
  fat: real("fat").notNull(),
  servingSize: real("serving_size").notNull(),
  servingUnit: text("serving_unit").notNull(),
});

export const foodLogs = pgTable("food_logs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  foodId: varchar("food_id").notNull(),
  portion: real("portion").notNull(),
  meal: mealEnum("meal").notNull(), // ✅ enum padronizado
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const exercises = pgTable("exercises", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(),
  duration: integer("duration").notNull(),
  intensity: integer("intensity").notNull(),
  caloriesBurned: real("calories_burned").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const alarms = pgTable("alarms", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  time: text("time").notNull(),
  label: text("label").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  sound: text("sound").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertFoodSchema = createInsertSchema(foods).omit({ id: true });
export const insertFoodLogSchema = createInsertSchema(foodLogs).omit({
  id: true,
  timestamp: true,
});
export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
  timestamp: true,
});
export const insertAlarmSchema = createInsertSchema(alarms).omit({ id: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Food = typeof foods.$inferSelect;
export type InsertFood = z.infer<typeof insertFoodSchema>;
export type FoodLog = typeof foodLogs.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type InsertFoodLog = z.infer<typeof insertFoodLogSchema>;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Alarm = typeof alarms.$inferSelect;
export type InsertAlarm = z.infer<typeof insertAlarmSchema>;
