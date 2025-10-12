import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FoodLogCard from '@/components/FoodLogCard';
import QuickAddFood from '@/components/QuickAddFood';
import { Coffee, Sun, Moon, Cookie } from 'lucide-react';

export default function Alimentacao() {
  //todo: remove mock functionality
  const mockFoodsByMeal = {
    'cafe': [
      {
        id: '1',
        foodName: 'Ovos Mexidos',
        portion: '3 unidades',
        calories: 210,
        protein: 18,
        carbs: 2,
        fat: 15,
        time: '07:30',
      },
      {
        id: '2',
        foodName: 'Pão Integral',
        portion: '2 fatias',
        calories: 140,
        protein: 6,
        carbs: 24,
        fat: 2,
        time: '07:35',
      },
    ],
    'almoco': [
      {
        id: '3',
        foodName: 'Peito de Frango Grelhado',
        portion: '200g',
        calories: 330,
        protein: 62,
        carbs: 0,
        fat: 7,
        time: '12:30',
      },
      {
        id: '4',
        foodName: 'Arroz Integral',
        portion: '150g',
        calories: 195,
        protein: 4,
        carbs: 41,
        fat: 2,
        time: '12:35',
      },
      {
        id: '5',
        foodName: 'Brócolis',
        portion: '100g',
        calories: 34,
        protein: 3,
        carbs: 7,
        fat: 0,
        time: '12:35',
      },
    ],
    'jantar': [],
    'lanches': [
      {
        id: '6',
        foodName: 'Whey Protein',
        portion: '30g',
        calories: 120,
        protein: 24,
        carbs: 3,
        fat: 1,
        time: '15:00',
      },
    ],
  };

  const [selectedMeal, setSelectedMeal] = useState('cafe');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Alimentação</h1>
        <p className="text-muted-foreground">Registre suas refeições do dia</p>
      </div>

      <QuickAddFood onSubmit={(text) => console.log('Food added:', text)} />

      <Tabs value={selectedMeal} onValueChange={setSelectedMeal}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cafe" data-testid="tab-breakfast">
            <Coffee className="h-4 w-4 mr-2" />
            Café
          </TabsTrigger>
          <TabsTrigger value="almoco" data-testid="tab-lunch">
            <Sun className="h-4 w-4 mr-2" />
            Almoço
          </TabsTrigger>
          <TabsTrigger value="jantar" data-testid="tab-dinner">
            <Moon className="h-4 w-4 mr-2" />
            Jantar
          </TabsTrigger>
          <TabsTrigger value="lanches" data-testid="tab-snacks">
            <Cookie className="h-4 w-4 mr-2" />
            Lanches
          </TabsTrigger>
        </TabsList>

        {Object.entries(mockFoodsByMeal).map(([meal, foods]) => (
          <TabsContent key={meal} value={meal} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  {meal === 'cafe' && 'Café da Manhã'}
                  {meal === 'almoco' && 'Almoço'}
                  {meal === 'jantar' && 'Jantar'}
                  {meal === 'lanches' && 'Lanches'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {foods.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Nenhuma refeição registrada ainda.</p>
                    <p className="text-sm mt-2">Use o campo acima para adicionar alimentos.</p>
                  </div>
                ) : (
                  foods.map((food) => (
                    <FoodLogCard
                      key={food.id}
                      {...food}
                      onDelete={() => console.log('Delete food:', food.id)}
                      onEdit={() => console.log('Edit food:', food.id)}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
