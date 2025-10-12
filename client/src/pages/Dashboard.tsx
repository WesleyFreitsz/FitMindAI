import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CalorieRing from '@/components/CalorieRing';
import MacroBar from '@/components/MacroBar';
import FoodLogCard from '@/components/FoodLogCard';
import WorkoutCard from '@/components/WorkoutCard';
import AISuggestionCard from '@/components/AISuggestionCard';
import WeightProjection from '@/components/WeightProjection';
import QuickAddFood from '@/components/QuickAddFood';
import { Utensils, Dumbbell, TrendingDown } from 'lucide-react';

export default function Dashboard() {
  //todo: remove mock functionality
  const [mockCalories] = useState({
    consumed: 1850,
    target: 2200,
    burned: 350,
  });

  const [mockMacros] = useState({
    protein: { current: 120, target: 150 },
    carbs: { current: 200, target: 250 },
    fat: { current: 55, target: 70 },
  });

  const mockFoods = [
    {
      id: '1',
      foodName: 'Peito de Frango Grelhado',
      portion: '200g',
      calories: 330,
      protein: 62,
      carbs: 0,
      fat: 7,
      time: '12:30',
    },
    {
      id: '2',
      foodName: 'Arroz Integral',
      portion: '150g',
      calories: 195,
      protein: 4,
      carbs: 41,
      fat: 2,
      time: '12:35',
    },
  ];

  const mockWorkouts = [
    {
      id: '1',
      type: 'Musculação',
      duration: 60,
      intensity: 4,
      caloriesBurned: 350,
      time: '18:00',
    },
  ];

  const mockWeightData = [
    { day: 'Seg', weight: 78.5 },
    { day: 'Ter', weight: 78.2 },
    { day: 'Qua', weight: 78.0 },
    { day: 'Qui', weight: 77.8 },
    { day: 'Sex', weight: 77.5 },
    { day: 'Sáb', weight: 77.3 },
    { day: 'Dom', weight: 77.0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Acompanhe seu progresso diário</p>
      </div>

      <QuickAddFood onSubmit={(text) => console.log('Food added:', text)} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2 lg:col-span-1">
          <CardContent className="pt-6">
            <div className="h-[280px]">
              <CalorieRing
                consumed={mockCalories.consumed}
                target={mockCalories.target}
                burned={mockCalories.burned}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Macronutrientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <WeightProjection
          currentWeight={78.5}
          projectedWeight={77.0}
          weeklyData={mockWeightData}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-primary" />
              Sugestões da IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AISuggestionCard message="Faltam 30g de proteína para atingir sua meta diária. Que tal adicionar um shake proteico?" />
            <AISuggestionCard message="Seu déficit calórico está ideal para perder 0.5kg esta semana. Continue assim!" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Alimentação Recente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockFoods.map((food) => (
              <FoodLogCard
                key={food.id}
                {...food}
                onDelete={() => console.log('Delete food:', food.id)}
                onEdit={() => console.log('Edit food:', food.id)}
              />
            ))}
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
            {mockWorkouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                {...workout}
                onDelete={() => console.log('Delete workout:', workout.id)}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
