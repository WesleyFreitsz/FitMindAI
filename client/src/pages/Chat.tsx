import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ChatInterface from '@/components/ChatInterface';
import CalorieRing from '@/components/CalorieRing';
import MacroBar from '@/components/MacroBar';
import MealSummary from '@/components/MealSummary';
import { Activity } from 'lucide-react';

export default function Chat() {
  //todo: remove mock functionality
  const mockCalories = {
    consumed: 1850,
    target: 2200,
    burned: 350,
  };

  const mockMacros = {
    protein: { current: 120, target: 150 },
    carbs: { current: 200, target: 250 },
    fat: { current: 55, target: 70 },
  };

  const mockMeals = {
    cafe: [
      { name: 'Ovos Mexidos', calories: 210, protein: 18, carbs: 2, fat: 15 },
      { name: 'Pão Integral', calories: 140, protein: 6, carbs: 24, fat: 2 },
    ],
    almoco: [
      { name: 'Peito de Frango', calories: 330, protein: 62, carbs: 0, fat: 7 },
      { name: 'Arroz Integral', calories: 195, protein: 4, carbs: 41, fat: 2 },
    ],
    jantar: [],
    lanches: [
      { name: 'Whey Protein', calories: 120, protein: 24, carbs: 3, fat: 1 },
    ],
  };

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
                consumed={mockCalories.consumed}
                target={mockCalories.target}
                burned={mockCalories.burned}
              />
            </div>
            <div className="space-y-3">
              <MacroBar
                label="Proteína"
                current={mockMacros.protein.current}
                target={mockMacros.protein.target}
                color="hsl(var(--chart-2))"
              />
              <MacroBar
                label="Carboidratos"
                current={mockMacros.carbs.current}
                target={mockMacros.carbs.target}
                color="hsl(var(--chart-3))"
              />
              <MacroBar
                label="Gordura"
                current={mockMacros.fat.current}
                target={mockMacros.fat.target}
                color="hsl(var(--chart-4))"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Refeições de Hoje</h3>
          <MealSummary meal="cafe" foods={mockMeals.cafe} />
          <MealSummary meal="almoco" foods={mockMeals.almoco} />
          <MealSummary meal="jantar" foods={mockMeals.jantar} />
          <MealSummary meal="lanches" foods={mockMeals.lanches} />
        </div>
      </div>
    </div>
  );
}
