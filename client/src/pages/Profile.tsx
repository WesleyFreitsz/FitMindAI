import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import WeightProjection from '@/components/WeightProjection';
import { Calculator, Save, Target, TrendingDown, Scale } from 'lucide-react';

export default function Profile() {
  //todo: remove mock functionality
  const [formData, setFormData] = useState({
    name: 'João Silva',
    age: 28,
    sex: 'masculino',
    weight: 78.5,
    height: 175,
    goal: 'perder',
    activityLevel: 'moderado',
  });

  const calculateBMR = () => {
    const { weight, height, age, sex } = formData;
    if (sex === 'masculino') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  };

  const calculateTDEE = () => {
    const bmr = calculateBMR();
    const multipliers = {
      sedentario: 1.2,
      leve: 1.375,
      moderado: 1.55,
      intenso: 1.725,
      muito_intenso: 1.9,
    };
    return bmr * (multipliers[formData.activityLevel as keyof typeof multipliers] || 1.55);
  };

  const getTargetCalories = () => {
    const tdee = calculateTDEE();
    if (formData.goal === 'perder') return tdee - 500;
    if (formData.goal === 'ganhar') return tdee + 300;
    return tdee;
  };

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
        <h1 className="text-3xl font-bold text-foreground">Perfil e Métricas</h1>
        <p className="text-muted-foreground">Acompanhe seu peso, metas e projeções</p>
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
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                  data-testid="input-weight"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
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
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                  data-testid="input-age"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sex">Sexo</Label>
                <Select value={formData.sex} onValueChange={(value) => setFormData({ ...formData, sex: value })}>
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
              <Select value={formData.goal} onValueChange={(value) => setFormData({ ...formData, goal: value })}>
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
              <Select value={formData.activityLevel} onValueChange={(value) => setFormData({ ...formData, activityLevel: value })}>
                <SelectTrigger id="activity" data-testid="select-activity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentario">Sedentário</SelectItem>
                  <SelectItem value="leve">Levemente Ativo</SelectItem>
                  <SelectItem value="moderado">Moderadamente Ativo</SelectItem>
                  <SelectItem value="intenso">Muito Ativo</SelectItem>
                  <SelectItem value="muito_intenso">Extremamente Ativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => console.log('Saving profile')} className="w-full" data-testid="button-save-profile">
              <Save className="h-4 w-4 mr-2" />
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
              <p className="text-sm text-muted-foreground">Taxa Metabólica Basal</p>
              <p className="text-2xl font-bold font-mono text-foreground">
                {calculateBMR().toFixed(0)} <span className="text-base font-normal text-muted-foreground">kcal/dia</span>
              </p>
              <p className="text-xs text-muted-foreground">BMR (Mifflin-St Jeor)</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Gasto Energético Total</p>
              <p className="text-2xl font-bold font-mono text-foreground">
                {calculateTDEE().toFixed(0)} <span className="text-base font-normal text-muted-foreground">kcal/dia</span>
              </p>
              <p className="text-xs text-muted-foreground">TDEE (com atividade)</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Meta Calórica Diária</p>
              <p className="text-2xl font-bold font-mono text-primary">
                {getTargetCalories().toFixed(0)} <span className="text-base font-normal text-muted-foreground">kcal/dia</span>
              </p>
              <p className="text-xs text-muted-foreground">Para {formData.goal === 'perder' ? 'perder gordura' : formData.goal === 'ganhar' ? 'ganhar massa' : 'manter peso'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <WeightProjection
        currentWeight={formData.weight}
        projectedWeight={77.0}
        weeklyData={mockWeightData}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Estimativas de Progresso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Déficit Calórico Diário</p>
              <p className="text-xl font-bold font-mono text-foreground">
                {formData.goal === 'perder' ? '-500' : formData.goal === 'ganhar' ? '+300' : '0'} kcal
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Estimativa de Mudança Semanal</p>
              <p className="text-xl font-bold font-mono text-foreground">
                {formData.goal === 'perder' ? '-0.5' : formData.goal === 'ganhar' ? '+0.3' : '0'} kg
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            * Estimativas baseadas em 1kg ≈ 7700 kcal. Resultados podem variar.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
