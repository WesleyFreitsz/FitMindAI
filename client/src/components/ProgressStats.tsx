import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, Calendar, Flame } from 'lucide-react';

export default function ProgressStats() {
  const weekData = [
    { day: 'Seg', calories: 2100, target: 2200 },
    { day: 'Ter', calories: 2050, target: 2200 },
    { day: 'Qua', calories: 2300, target: 2200 },
    { day: 'Qui', calories: 1950, target: 2200 },
    { day: 'Sex', calories: 2150, target: 2200 },
    { day: 'Sáb', calories: 2000, target: 2200 },
    { day: 'Dom', calories: 2100, target: 2200 },
  ];

  const monthData = [
    { week: 'Sem 1', avg: 2100 },
    { week: 'Sem 2', avg: 2050 },
    { week: 'Sem 3', avg: 2150 },
    { week: 'Sem 4', avg: 2080 },
  ];

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
            <TabsTrigger value="week" data-testid="tab-week">Semana</TabsTrigger>
            <TabsTrigger value="month" data-testid="tab-month">Mês</TabsTrigger>
          </TabsList>
          <TabsContent value="week" className="mt-4">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekData}>
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
                  <Bar dataKey="calories" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="month" className="mt-4">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="week" 
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
                    dataKey="avg" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
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
