import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingDown, Calendar } from "lucide-react";
import { useFoodLogsRange, useExercisesRange, useUser } from "@/lib/hooks";
import { calculateCalorieGoal, calculateDailyStats } from "@/lib/calculations";
import {
  subDays,
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ProgressStats() {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const { data: userProfile } = useUser();
  const { data: weekFoodLogs = {} } = useFoodLogsRange(weekStart, weekEnd);
  const { data: weekExercises = {} } = useExercisesRange(weekStart, weekEnd);
  const { data: monthFoodLogs = {} } = useFoodLogsRange(monthStart, monthEnd);
  const { data: monthExercises = {} } = useExercisesRange(monthStart, monthEnd);

  const calorieGoal = userProfile
    ? calculateCalorieGoal(userProfile).target
    : 2200;

  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const weekData = weekDays.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const logs = weekFoodLogs[dateStr] || [];
    const exercises = weekExercises[dateStr] || [];
    const stats = calculateDailyStats(logs, exercises);

    return {
      day: format(day, "EEE", { locale: ptBR }),
      calories: stats.consumed,
      target: calorieGoal,
      burned: stats.burned,
    };
  });

  const weeks = eachWeekOfInterval(
    { start: monthStart, end: monthEnd },
    { weekStartsOn: 1 }
  );

  const monthData = weeks.map((weekStartDay, index) => {
    const weekEndDay = endOfWeek(weekStartDay, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({
      start: weekStartDay,
      end: weekEndDay > monthEnd ? monthEnd : weekEndDay,
    });

    const totalCalories = weekDays.reduce((sum, day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const logs = monthFoodLogs[dateStr] || [];
      const exercises = monthExercises[dateStr] || [];
      const stats = calculateDailyStats(logs, exercises);
      return sum + stats.consumed;
    }, 0);

    const avgCalories =
      weekDays.length > 0 ? Math.round(totalCalories / weekDays.length) : 0;

    const deficit = calorieGoal - avgCalories;
    const estimatedWeightChange = (deficit * 7) / 7700;
    const currentWeight = userProfile?.weight || 75;
    const estimatedWeight = currentWeight - estimatedWeightChange * (index + 1);

    return {
      week: `Sem ${index + 1}`,
      avg: avgCalories,
      weight: estimatedWeight,
      target: calorieGoal,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Progresso
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="week">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="week" data-testid="tab-week">
              Semana
            </TabsTrigger>
            <TabsTrigger value="month" data-testid="tab-month">
              Mês
            </TabsTrigger>
          </TabsList>
          <TabsContent value="week" className="mt-4">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="day"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    stroke="hsl(var(--border))"
                  />
                  <YAxis
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    stroke="hsl(var(--border))"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.375rem",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value: number, name: string) => {
                      const labels: Record<string, string> = {
                        calories: "Consumidas",
                        target: "Meta",
                        burned: "Queimadas",
                      };
                      return [`${value} kcal`, labels[name] || name];
                    }}
                  />
                  <Legend
                    formatter={(value: string) => {
                      const labels: Record<string, string> = {
                        calories: "Consumidas",
                        target: "Meta",
                        burned: "Queimadas",
                      };
                      return labels[value] || value;
                    }}
                  />
                  <Bar
                    dataKey="calories"
                    fill="hsl(var(--black))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="target"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="burned"
                    fill="hsl(var(--chart-2))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="month" className="mt-4">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="week"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    stroke="hsl(var(--border))"
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    stroke="hsl(var(--border))"
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    stroke="hsl(var(--border))"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.375rem",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === "weight")
                        return [`${value.toFixed(1)} kg`, "Peso Estimado"];
                      if (name === "avg")
                        return [`${value} kcal`, "Média Calorias"];
                      if (name === "target") return [`${value} kcal`, "Meta"];
                      return [value, name];
                    }}
                  />
                  <Legend
                    formatter={(value: string) => {
                      const labels: Record<string, string> = {
                        avg: "Média Calorias",
                        weight: "Peso Estimado",
                        target: "Meta Calórica",
                      };
                      return labels[value] || value;
                    }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="avg"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="target"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="weight"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-2))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
