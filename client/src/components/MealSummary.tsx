import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coffee, Sun, Moon, Cookie } from 'lucide-react';

interface MealSummaryProps {
  meal: 'cafe' | 'almoco' | 'jantar' | 'lanches';
  foods: Array<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
}

const mealConfig = {
  cafe: { label: 'Café da Manhã', icon: Coffee },
  almoco: { label: 'Almoço', icon: Sun },
  jantar: { label: 'Jantar', icon: Moon },
  lanches: { label: 'Lanches', icon: Cookie },
};

export default function MealSummary({ meal, foods }: MealSummaryProps) {
  const config = mealConfig[meal];
  const Icon = config.icon;

  const totals = foods.reduce(
    (acc, food) => ({
      calories: acc.calories + food.calories,
      protein: acc.protein + food.protein,
      carbs: acc.carbs + food.carbs,
      fat: acc.fat + food.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {config.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {foods.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum alimento registrado</p>
        ) : (
          <>
            {foods.map((food, index) => (
              <div key={index} className="text-sm text-foreground">
                {food.name}
              </div>
            ))}
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <Badge variant="secondary" className="text-xs">
                {totals.calories} kcal
              </Badge>
              <Badge variant="outline" className="text-xs">
                P: {totals.protein}g
              </Badge>
              <Badge variant="outline" className="text-xs">
                C: {totals.carbs}g
              </Badge>
              <Badge variant="outline" className="text-xs">
                G: {totals.fat}g
              </Badge>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
