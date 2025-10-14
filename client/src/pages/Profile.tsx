import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import WeightProjection from "@/components/WeightProjection";
import {
  Calculator,
  Save,
  Target,
  TrendingDown,
  Scale,
  Loader2,
} from "lucide-react";
import {
  useUser,
  useUpdateUser,
  useFoodLogsRange,
  useExercisesRange,
} from "@/lib/hooks";
import { useToast } from "@/hooks/use-toast";
import {
  calculateTDEE,
  calculateDailyStats,
  calculateBMR,
} from "@/lib/calculations";
import { subDays, eachDayOfInterval, format } from "date-fns";

export default function Profile() {
  const { data: user, isLoading } = useUser();
  const updateUser = useUpdateUser();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    age: 0,
    sex: "",
    weight: 0,
    height: 0,
    goal: "",
    activityLevel: "",
  });

  const [avgDailySurplus, setAvgDailySurplus] = useState(0);
  const [weeklyWeightChange, setWeeklyWeightChange] = useState(0);

  // --- Busca de dados para as projeções ---
  const today = new Date();
  const sevenDaysAgo = subDays(today, 6);
  const { data: foodLogs, isLoading: foodLoading } = useFoodLogsRange(
    sevenDaysAgo,
    today
  );
  const { data: exercises, isLoading: exercisesLoading } = useExercisesRange(
    sevenDaysAgo,
    today
  );

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        age: user.age,
        sex: user.sex,
        weight: user.weight,
        height: user.height,
        goal: user.goal,
        activityLevel: user.activityLevel,
      });
    }
  }, [user]);

  // --- Efeito para calcular as estimativas dinâmicas ---
  useEffect(() => {
    if (user && foodLogs && exercises) {
      const tdee = calculateTDEE(user);
      const dateRange = eachDayOfInterval({ start: sevenDaysAgo, end: today });

      let totalNetCalories = 0;
      let daysWithData = 0;

      dateRange.forEach((date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        const dailyLogs = foodLogs[dateStr] || [];
        const dailyExercises = exercises[dateStr] || [];

        if (dailyLogs.length > 0 || dailyExercises.length > 0) {
          daysWithData++;
          const stats = calculateDailyStats(dailyLogs, dailyExercises);
          totalNetCalories += stats.consumed - stats.burned;
        }
      });

      if (daysWithData > 0) {
        const avgDailyNetCalories = totalNetCalories / daysWithData;
        const surplus = avgDailyNetCalories - tdee;
        const weeklyChange = (surplus * 7) / 7700;

        setAvgDailySurplus(surplus);
        setWeeklyWeightChange(weeklyChange);
      } else {
        setAvgDailySurplus(0);
        setWeeklyWeightChange(0);
      }
    }
  }, [user, foodLogs, exercises, sevenDaysAgo, today]);

  const handleSave = async () => {
    try {
      await updateUser.mutateAsync(formData);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar seu perfil",
        variant: "destructive",
      });
    }
  };

  const getTargetCalories = () => {
    const tdee = calculateTDEE(formData);
    if (formData.goal === "perder") return tdee - 500;
    if (formData.goal === "ganhar") return tdee + 300;
    return tdee;
  };

  const mockWeightData = [
    { day: "Seg", weight: formData.weight },
    { day: "Ter", weight: formData.weight - 0.3 },
    { day: "Qua", weight: formData.weight - 0.5 },
    { day: "Qui", weight: formData.weight - 0.7 },
    { day: "Sex", weight: formData.weight - 1 },
    { day: "Sáb", weight: formData.weight - 1.2 },
    { day: "Dom", weight: formData.weight - 1.5 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Perfil e Métricas
        </h1>
        <p className="text-muted-foreground">
          Acompanhe seu peso, metas e projeções
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Dados Corporais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Peso Atual (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      weight: parseFloat(e.target.value) || 0,
                    })
                  }
                  data-testid="input-weight"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      height: parseInt(e.target.value) || 0,
                    })
                  }
                  data-testid="input-height"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Idade</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      age: parseInt(e.target.value) || 0,
                    })
                  }
                  data-testid="input-age"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sex">Sexo</Label>
                <Select
                  value={formData.sex}
                  onValueChange={(value) =>
                    setFormData({ ...formData, sex: value })
                  }
                >
                  <SelectTrigger id="sex" data-testid="select-sex">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Target className="h-5 w-5" />
              Objetivos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal">Meta Principal</Label>
              <Select
                value={formData.goal}
                onValueChange={(value) =>
                  setFormData({ ...formData, goal: value })
                }
              >
                <SelectTrigger id="goal" data-testid="select-goal">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="perder">Perder Gordura</SelectItem>
                  <SelectItem value="manter">Manter Peso</SelectItem>
                  <SelectItem value="ganhar">Ganhar Massa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity">Nível de Atividade</Label>
              <Select
                value={formData.activityLevel}
                onValueChange={(value) =>
                  setFormData({ ...formData, activityLevel: value })
                }
              >
                <SelectTrigger id="activity" data-testid="select-activity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentario">Sedentário</SelectItem>
                  <SelectItem value="leve">Levemente Ativo</SelectItem>
                  <SelectItem value="moderado">Moderadamente Ativo</SelectItem>
                  <SelectItem value="intenso">Muito Ativo</SelectItem>
                  <SelectItem value="muito_intenso">
                    Extremamente Ativo
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSave}
              className="w-full"
              disabled={updateUser.isPending}
              data-testid="button-save-profile"
            >
              {updateUser.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Cálculos Metabólicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Taxa Metabólica Basal
              </p>
              <p className="text-2xl font-bold font-mono text-foreground">
                {calculateBMR(formData).toFixed(0)}{" "}
                <span className="text-base font-normal text-muted-foreground">
                  kcal/dia
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                BMR (Mifflin-St Jeor)
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Gasto Energético Total
              </p>
              <p className="text-2xl font-bold font-mono text-foreground">
                {calculateTDEE(formData).toFixed(0)}{" "}
                <span className="text-base font-normal text-muted-foreground">
                  kcal/dia
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                TDEE (com atividade)
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Meta Calórica Diária
              </p>
              <p className="text-2xl font-bold font-mono text-primary">
                {getTargetCalories().toFixed(0)}{" "}
                <span className="text-base font-normal text-muted-foreground">
                  kcal/dia
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Para{" "}
                {formData.goal === "perder"
                  ? "perder gordura"
                  : formData.goal === "ganhar"
                  ? "ganhar massa"
                  : "manter peso"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <WeightProjection
        currentWeight={formData.weight}
        projectedWeight={formData.weight + weeklyWeightChange}
        weeklyData={mockWeightData}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Estimativas de Progresso (Baseado nos últimos 7 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">
                Excedente/Défice Calórico Diário
              </p>
              <p className="text-xl font-bold font-mono text-foreground">
                {foodLoading || exercisesLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  `${avgDailySurplus > 0 ? "+" : ""}${avgDailySurplus.toFixed(
                    0
                  )} kcal`
                )}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">
                Estimativa de Mudança Semanal
              </p>
              <p className="text-xl font-bold font-mono text-foreground">
                {foodLoading || exercisesLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  `${
                    weeklyWeightChange > 0 ? "+" : ""
                  }${weeklyWeightChange.toFixed(2)} kg`
                )}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            * Estimativas baseadas na sua média de consumo e treino dos últimos
            7 dias. Resultados podem variar.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
