import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CalorieRing from "@/components/CalorieRing";
import MacroBar from "@/components/MacroBar";
import MealSummary from "@/components/MealSummary";
import {
  useFoodLogs,
  useUser,
  useExercises,
  useDeleteFoodLog,
} from "@/lib/hooks";
import { Activity, Loader2 } from "lucide-react";
import {
  calculateCalorieGoal,
  calculateMacroGoals,
  calculateDailyStats,
} from "@/lib/calculations";

export default function DailySummary() {
  const [today] = useState(new Date());

  const { data: user, isLoading: userLoading } = useUser();
  const { data: foodLogs = [], isLoading: logsLoading } = useFoodLogs(today);
  const { data: exercises = [], isLoading: exercisesLoading } =
    useExercises(today);
  const deleteFoodLogMutation = useDeleteFoodLog();

  const isLoading = userLoading || logsLoading || exercisesLoading;

  const handleDeleteLog = (id: string) => {
    deleteFoodLogMutation.mutate(id);
  };

  const calorieGoals = user
    ? calculateCalorieGoal(user)
    : { target: 2200, bmr: 1800, tdee: 2200 };
  const macroGoals = user
    ? calculateMacroGoals(user)
    : { protein: 150, carbs: 250, fat: 70 };
  const dailyStats = calculateDailyStats(foodLogs, exercises);

  const groupLogsByMeal = (meal: "cafe" | "almoco" | "jantar" | "lanches") => {
    return foodLogs.filter((log) => log.meal === meal && log.food);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Resumo do Dia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-[200px]">
            <CalorieRing
              consumed={dailyStats.consumed}
              target={Math.round(calorieGoals.target)}
              burned={dailyStats.burned}
            />
          </div>
          <div className="space-y-3">
            <MacroBar
              label="Proteína"
              current={dailyStats.protein}
              target={macroGoals.protein}
              color="hsl(var(--chart-2))"
            />
            <MacroBar
              label="Carboidratos"
              current={dailyStats.carbs}
              target={macroGoals.carbs}
              color="hsl(var(--chart-3))"
            />
            <MacroBar
              label="Gordura"
              current={dailyStats.fat}
              target={macroGoals.fat}
              color="hsl(var(--chart-4))"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          Refeições de Hoje
        </h3>
        <MealSummary
          meal="cafe"
          logs={groupLogsByMeal("cafe")}
          onDeleteLog={handleDeleteLog}
        />
        <MealSummary
          meal="almoco"
          logs={groupLogsByMeal("almoco")}
          onDeleteLog={handleDeleteLog}
        />
        <MealSummary
          meal="jantar"
          logs={groupLogsByMeal("jantar")}
          onDeleteLog={handleDeleteLog}
        />
        <MealSummary
          meal="lanches"
          logs={groupLogsByMeal("lanches")}
          onDeleteLog={handleDeleteLog}
        />
      </div>
    </div>
  );
}
