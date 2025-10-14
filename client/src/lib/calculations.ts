import type { User, FoodLog, Exercise } from "@shared/schema";

type UserDataForCalculations = Pick<
  User,
  "weight" | "height" | "age" | "sex" | "activityLevel" | "goal"
>;

export interface CalorieGoals {
  bmr: number;
  tdee: number;
  target: number;
}

export interface MacroGoals {
  protein: number;
  carbs: number;
  fat: number;
}

const activityFactors = {
  sedentario: 1.2,
  leve: 1.375,
  moderado: 1.55,
  intenso: 1.725,
  muito_intenso: 1.9,
};

export function calculateBMR(user: Partial<UserDataForCalculations>): number {
  const { weight, height, age, sex } = user;
  if (!weight || !height || !age || !sex) return 0;

  if (sex === "masculino") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

export function calculateTDEE(user: Partial<UserDataForCalculations>): number {
  const bmr = calculateBMR(user);
  const factor =
    activityFactors[user.activityLevel as keyof typeof activityFactors] || 1.2;
  return bmr * factor;
}

export function calculateCalorieGoal(
  user: UserDataForCalculations
): CalorieGoals {
  const bmr = calculateBMR(user);
  const tdee = calculateTDEE(user);

  let target = tdee;

  if (user.goal === "perder") {
    target = tdee - 500;
  } else if (user.goal === "ganhar") {
    target = tdee + 300;
  }

  return {
    bmr,
    tdee,
    target: Math.round(target),
  };
}

export function calculateMacroGoals(user: User): MacroGoals {
  const { target } = calculateCalorieGoal(user);

  let proteinMultiplier = 2.0;
  let fatPercent = 0.25;

  if (user.goal === "ganhar") {
    proteinMultiplier = 2.2;
    fatPercent = 0.3;
  } else if (user.goal === "perder") {
    proteinMultiplier = 2.4;
    fatPercent = 0.25;
  }

  const protein = Math.round(user.weight * proteinMultiplier);
  const fat = Math.round((target * fatPercent) / 9);
  const carbs = Math.round((target - (protein * 4 + fat * 9)) / 4);

  return {
    protein,
    carbs,
    fat,
  };
}

export function calculateDailyStats(
  logs: Array<{
    food?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      servingSize: number;
    };
    portion: number;
  }> = [], 
  exercises: Array<{ caloriesBurned: number }> = [] 
) {
  const totals = logs.reduce(
    (acc, log) => {
      if (!log.food) return acc;
      const multiplier = log.portion / log.food.servingSize;
      return {
        calories: acc.calories + log.food.calories * multiplier,
        protein: acc.protein + log.food.protein * multiplier,
        carbs: acc.carbs + log.food.carbs * multiplier,
        fat: acc.fat + log.food.fat * multiplier,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const caloriesBurned = exercises.reduce(
    (sum, ex) => sum + ex.caloriesBurned,
    0
  );

  return {
    consumed: Math.round(totals.calories),
    protein: Math.round(totals.protein),
    carbs: Math.round(totals.carbs),
    fat: Math.round(totals.fat),
    burned: Math.round(caloriesBurned),
  };
}
