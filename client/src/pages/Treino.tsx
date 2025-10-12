import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import WorkoutCard from '@/components/WorkoutCard';
import { Plus, Dumbbell, Heart, Bike, Footprints } from 'lucide-react';

export default function Treino() {
  //todo: remove mock functionality
  const [exerciseType, setExerciseType] = useState('');
  const [duration, setDuration] = useState([30]);
  const [intensity, setIntensity] = useState([3]);

  const mockWorkouts = [
    {
      id: '1',
      type: 'Musculação',
      duration: 60,
      intensity: 4,
      caloriesBurned: 350,
      time: '18:00',
    },
    {
      id: '2',
      type: 'Corrida',
      duration: 30,
      intensity: 5,
      caloriesBurned: 300,
      time: '07:00',
    },
  ];

  const calculateCalories = () => {
    if (!exerciseType) return 0;
    const baseCalories = {
      'musculacao': 5,
      'corrida': 10,
      'ciclismo': 8,
      'caminhada': 4,
    }[exerciseType] || 5;
    
    return Math.round(duration[0] * baseCalories * (intensity[0] / 3));
  };

  const handleAddWorkout = () => {
    console.log('Adding workout:', {
      type: exerciseType,
      duration: duration[0],
      intensity: intensity[0],
      calories: calculateCalories(),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Treino</h1>
        <p className="text-muted-foreground">Registre seus exercícios do dia</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Treino
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="exercise-type">Tipo de Exercício</Label>
            <Select value={exerciseType} onValueChange={setExerciseType}>
              <SelectTrigger id="exercise-type" data-testid="select-exercise-type">
                <SelectValue placeholder="Selecione o tipo de exercício" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="musculacao">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4" />
                    Musculação
                  </div>
                </SelectItem>
                <SelectItem value="corrida">
                  <div className="flex items-center gap-2">
                    <Footprints className="h-4 w-4" />
                    Corrida
                  </div>
                </SelectItem>
                <SelectItem value="ciclismo">
                  <div className="flex items-center gap-2">
                    <Bike className="h-4 w-4" />
                    Ciclismo
                  </div>
                </SelectItem>
                <SelectItem value="caminhada">
                  <div className="flex items-center gap-2">
                    <Footprints className="h-4 w-4" />
                    Caminhada
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Duração: {duration[0]} minutos</Label>
            <Slider
              value={duration}
              onValueChange={setDuration}
              min={5}
              max={180}
              step={5}
              data-testid="slider-duration"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Intensidade: {intensity[0]} 
              <span className="text-muted-foreground ml-2">
                ({intensity[0] <= 2 ? 'Leve' : intensity[0] <= 4 ? 'Moderado' : 'Intenso'})
              </span>
            </Label>
            <Slider
              value={intensity}
              onValueChange={setIntensity}
              min={1}
              max={5}
              step={1}
              data-testid="slider-intensity"
            />
          </div>

          <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
            <Heart className="h-5 w-5 text-primary" />
            <span className="font-mono text-lg font-semibold">
              {calculateCalories()} kcal
            </span>
            <span className="text-sm text-muted-foreground">queimadas (estimativa)</span>
          </div>

          <Button 
            onClick={handleAddWorkout} 
            className="w-full" 
            disabled={!exerciseType}
            data-testid="button-add-workout"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Treino
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Treinos de Hoje</CardTitle>
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
  );
}
