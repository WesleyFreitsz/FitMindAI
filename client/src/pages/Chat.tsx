import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ChatInterface from '@/components/ChatInterface';
import CalorieRing from '@/components/CalorieRing';
import MacroBar from '@/components/MacroBar';
import MealSummary from '@/components/MealSummary';
import { useFoodLogs, useUser, useExercises } from '@/lib/hooks';
import { Activity, Loader2 } from 'lucide-react';

export default function Chat() {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: foodLogs, isLoading: logsLoading } = useFoodLogs();
  const { data: exercises, isLoading: exercisesLoading } = useExercises();

  if (userLoading || logsLoading || exercisesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate BMR and TDEE
  const calculateBMR = () => {
    if (!user) return 0;
    const { weight, height, age, sex } = user;
    if (sex === 'masculino') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  };

  const activityMultipliers: Record<string, number> = {
    sedentario: 1.2,
    leve: 1.375,
    moderado: 1.55,
    intenso: 1.725,
    extremo: 1.9,
  };

  const bmr = calculateBMR();
  const tdee = bmr * (user ? activityMultipliers[user.activityLevel] || 1.55 : 1.55);
  const calorieGoal = user?.goal === 'ganhar' ? tdee + 300 : user?.goal === 'perder' ? tdee - 500 : tdee;

  // Calculate totals from food logs
  const foodTotals = (foodLogs || []).reduce(
    (acc, log) => {
      if (log.food) {
        const multiplier = log.portion / log.food.servingSize;
        return {
          calories: acc.calories + log.food.calories * multiplier,
          protein: acc.protein + log.food.protein * multiplier,
          carbs: acc.carbs + log.food.carbs * multiplier,
          fat: acc.fat + log.food.fat * multiplier,
        };
      }
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Calculate calories burned from exercises
  const exerciseCalories = (exercises || []).reduce((acc, ex) => acc + ex.caloriesBurned, 0);

  // Group foods by meal
  const groupByMeal = (meal: string) => {
    return (foodLogs || [])
      .filter(log => log.meal === meal && log.food)
      .map(log => {
        const multiplier = log.portion / (log.food?.servingSize || 1);
        return {
          name: log.food!.name,
          calories: log.food!.calories * multiplier,
          protein: log.food!.protein * multiplier,
          carbs: log.food!.carbs * multiplier,
          fat: log.food!.fat * multiplier,
        };
      });
  };

  const proteinGoal = Math.round(user?.weight ? user.weight * 2 : 150);
  const carbsGoal = Math.round((calorieGoal * 0.4) / 4);
  const fatGoal = Math.round((calorieGoal * 0.3) / 9);

  return (
    <div className="grid gap-6 lg:grid-cols-3 h-full">
      <div className="lg:col-span-2 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Chat com IA</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            <ChatInterface />
          </CardContent>
        </Card>
      </div>

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
                consumed={Math.round(foodTotals.calories)}
                target={Math.round(calorieGoal)}
                burned={exerciseCalories}
              />
            </div>
            <div className="space-y-3">
              <MacroBar
                label="Proteína"
                current={Math.round(foodTotals.protein)}
                target={proteinGoal}
                color="hsl(var(--chart-2))"
              />
              <MacroBar
                label="Carboidratos"
                current={Math.round(foodTotals.carbs)}
                target={carbsGoal}
                color="hsl(var(--chart-3))"
              />
              <MacroBar
                label="Gordura"
                current={Math.round(foodTotals.fat)}
                target={fatGoal}
                color="hsl(var(--chart-4))"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Refeições de Hoje</h3>
          <MealSummary meal="cafe" foods={groupByMeal('café')} />
          <MealSummary meal="almoco" foods={groupByMeal('almoço')} />
          <MealSummary meal="jantar" foods={groupByMeal('jantar')} />
          <MealSummary meal="lanches" foods={groupByMeal('lanches')} />
        </div>
      </div>
    </div>
  );
}
