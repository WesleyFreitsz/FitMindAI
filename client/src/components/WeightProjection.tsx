import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface WeightProjectionProps {
  currentWeight: number;
  projectedWeight: number;
  weeklyData: Array<{ day: string; weight: number }>;
}

export default function WeightProjection({
  currentWeight,
  projectedWeight,
  weeklyData,
}: WeightProjectionProps) {
  const difference = projectedWeight - currentWeight;
  const isLosing = difference < 0;
  const isGaining = difference > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">Projeção de Peso</CardTitle>
        <div className="flex items-center gap-2">
          {isLosing && <TrendingDown className="h-4 w-4 text-chart-1" />}
          {isGaining && <TrendingUp className="h-4 w-4 text-destructive" />}
          {!isLosing && !isGaining && <Minus className="h-4 w-4 text-chart-3" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-foreground">
              {projectedWeight.toFixed(1)} kg
            </span>
            <span className="text-sm text-muted-foreground">em 1 semana</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Peso atual: {currentWeight.toFixed(1)} kg
            {difference !== 0 && (
              <span className={isLosing ? 'text-chart-1' : 'text-destructive'}>
                {' '}({difference > 0 ? '+' : ''}{difference.toFixed(1)} kg)
              </span>
            )}
          </p>
        </div>
        <div className="h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="day" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                stroke="hsl(var(--border))"
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                stroke="hsl(var(--border))"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.375rem',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
