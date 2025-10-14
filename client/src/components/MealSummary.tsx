import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Coffee, Sun, Moon, Cookie } from "lucide-react";
import type { Food, FoodLog } from "@shared/schema";

interface MealSummaryProps {
  meal: "cafe" | "almoco" | "jantar" | "lanches";
  logs: (FoodLog & { food?: Food })[];
  onDeleteLog: (logId: string) => void;
}

const mealConfig = {
  cafe: { label: "Café da Manhã", icon: Coffee },
  almoco: { label: "Almoço", icon: Sun },
  jantar: { label: "Jantar", icon: Moon },
  lanches: { label: "Lanches", icon: Cookie },
};

export default function MealSummary({
  meal,
  logs,
  onDeleteLog,
}: MealSummaryProps) {
  const config = mealConfig[meal];
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {config.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-2">
            Nenhum alimento registrado
          </p>
        ) : (
          logs.map((log) => {
            if (!log.food) return null;
            const multiplier = log.portion / log.food.servingSize;
            const calories = log.food.calories * multiplier;
            const protein = log.food.protein * multiplier;
            const carbs = log.food.carbs * multiplier;
            const fat = log.food.fat * multiplier;

            return (
              <div
                key={log.id}
                className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {log.food.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {log.portion}
                    {log.food.servingUnit}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {calories.toFixed(0)} kcal
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => onDeleteLog(log.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
