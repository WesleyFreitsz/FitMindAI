import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CalorieRing from "@/components/CalorieRing";
import MacroBar from "@/components/MacroBar";
import MealSummary from "@/components/MealSummary";
import WorkoutCard from "@/components/WorkoutCard";
import AISuggestionCard from "@/components/AISuggestionCard";
import WeightProjection from "@/components/WeightProjection";
import {
  Utensils,
  Dumbbell,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import {
  useUser,
  useFoodLogs,
  useDeleteFoodLog,
  useExercises,
} from "@/lib/hooks";
import {
  calculateCalorieGoal,
  calculateMacroGoals,
  calculateDailyStats,
} from "@/lib/calculations";
import { format, addDays, subDays, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";
import { useLocation, useSearch } from "wouter";

export default function Dashboard() {
  const searchParams = new URLSearchParams(useSearch());
  const dateParam = searchParams.get("date");
  const [, setLocation] = useLocation();

  const [selectedDate, setSelectedDate] = useState(() => {
    if (dateParam) {
      try {
        return parse(dateParam, "yyyy-MM-dd", new Date());
      } catch {
        return new Date();
      }
    }
    return new Date();
  });

  useEffect(() => {
    if (dateParam) {
      try {
        const date = parse(dateParam, "yyyy-MM-dd", new Date());
        setSelectedDate(date);
      } catch {
        setSelectedDate(new Date());
      }
    }
  }, [dateParam]);
  const { user: authUser } = useAuth();
  const { data: userProfile } = useUser();
  const { data: foodLogs = [] } = useFoodLogs(selectedDate);
  const { data: exercises = [] } = useExercises(selectedDate);
  const deleteFoodLog = useDeleteFoodLog();

  const user = userProfile || authUser;

  const calorieGoals =
    user && !authUser?.isGuest
      ? calculateCalorieGoal(user)
      : { target: 2200, bmr: 1800, tdee: 2200 };
  const macroGoals =
    user && !authUser?.isGuest
      ? calculateMacroGoals(user)
      : { protein: 150, carbs: 250, fat: 70 };

  const dailyStats = calculateDailyStats(foodLogs, exercises);

  const groupedLogs = {
    cafe: foodLogs.filter((log) => log.meal === "cafe"),
    almoco: foodLogs.filter((log) => log.meal === "almoco"),
    jantar: foodLogs.filter((log) => log.meal === "jantar"),
    lanches: foodLogs.filter((log) => log.meal === "lanches"),
  };

  const handleDeleteLog = (logId: string) => {
    deleteFoodLog.mutate(logId);
  };

  const isToday =
    format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  const proteinPercent =
    macroGoals.protein > 0
      ? (dailyStats.protein / macroGoals.protein) * 100
      : 0;
  const carbsPercent =
    macroGoals.carbs > 0 ? (dailyStats.carbs / macroGoals.carbs) * 100 : 0;
  const fatPercent =
    macroGoals.fat > 0 ? (dailyStats.fat / macroGoals.fat) * 100 : 0;

  const proteinRemaining = Math.max(0, macroGoals.protein - dailyStats.protein);
  const calorieDeficit = calorieGoals.target - dailyStats.consumed;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Acompanhe seu progresso diário
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 min-w-[200px] justify-center">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {format(selectedDate, "d 'de' MMMM, yyyy", { locale: ptBR })}
            </span>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            disabled={
              format(selectedDate, "yyyy-MM-dd") >=
              format(new Date(), "yyyy-MM-dd")
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {!isToday && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
            >
              Hoje
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2 lg:col-span-1">
          <CardContent className="pt-6">
            <div className="h-[280px]">
              <CalorieRing
                consumed={dailyStats.consumed}
                target={calorieGoals.target}
                burned={dailyStats.burned}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Macronutrientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Refeições do Dia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <MealSummary
              meal="cafe"
              logs={groupedLogs.cafe}
              onDeleteLog={handleDeleteLog}
            />
            <MealSummary
              meal="almoco"
              logs={groupedLogs.almoco}
              onDeleteLog={handleDeleteLog}
            />
            <MealSummary
              meal="jantar"
              logs={groupedLogs.jantar}
              onDeleteLog={handleDeleteLog}
            />
            <MealSummary
              meal="lanches"
              logs={groupedLogs.lanches}
              onDeleteLog={handleDeleteLog}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Treinos de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {exercises.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum treino registrado hoje
              </p>
            ) : (
              exercises.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  type={workout.type}
                  duration={workout.duration}
                  intensity={workout.intensity}
                  caloriesBurned={workout.caloriesBurned}
                  time={format(new Date(workout.timestamp), "HH:mm")}
                  onDelete={() => console.log("Delete workout:", workout.id)}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {isToday && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-primary" />
              Sugestões da IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {proteinRemaining > 10 && (
              <AISuggestionCard
                message={`Faltam ${proteinRemaining.toFixed(
                  0
                )}g de proteína para atingir sua meta diária. Que tal adicionar um shake proteico ou peito de frango?`}
              />
            )}
            {calorieDeficit > 100 && (
              <AISuggestionCard
                message={`Você ainda tem ${calorieDeficit} kcal disponíveis hoje. Continue assim para atingir sua meta!`}
              />
            )}
            {calorieDeficit < -200 && (
              <AISuggestionCard
                message={`Você excedeu sua meta calórica em ${Math.abs(
                  calorieDeficit
                )} kcal. Considere um treino extra ou ajuste as próximas refeições.`}
              />
            )}
            {proteinPercent >= 90 && carbsPercent >= 90 && fatPercent >= 90 && (
              <AISuggestionCard
                message={`Parabéns! Você atingiu todas as suas metas de macronutrientes hoje! 💪`}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
