import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DayData {
  date: string;
  calories: number;
  target: number;
  workouts: number;
}

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Mock data para o calendário
  const mockDaysData: DayData[] = [
    { date: '2025-10-01', calories: 2100, target: 2200, workouts: 1 },
    { date: '2025-10-02', calories: 2050, target: 2200, workouts: 0 },
    { date: '2025-10-03', calories: 2300, target: 2200, workouts: 1 },
    { date: '2025-10-04', calories: 1950, target: 2200, workouts: 1 },
    { date: '2025-10-05', calories: 2150, target: 2200, workouts: 0 },
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const getDayStatus = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = mockDaysData.find(d => d.date === dateStr);
    
    if (!dayData) return null;
    
    const difference = dayData.calories - dayData.target;
    if (Math.abs(difference) <= 100) return 'success';
    if (difference < -100) return 'warning';
    return 'danger';
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              data-testid="button-prev-month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              data-testid="button-next-month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const status = getDayStatus(day);
            const isToday = day === new Date().getDate() && 
                           currentMonth.getMonth() === new Date().getMonth() &&
                           currentMonth.getFullYear() === new Date().getFullYear();
            
            return (
              <button
                key={day}
                className={`aspect-square p-1 rounded-md text-sm hover-elevate active-elevate-2 ${
                  isToday ? 'ring-2 ring-primary' : ''
                } ${
                  status === 'success' ? 'bg-chart-1/20' :
                  status === 'warning' ? 'bg-chart-3/20' :
                  status === 'danger' ? 'bg-destructive/20' : ''
                }`}
                data-testid={`calendar-day-${day}`}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="text-foreground">{day}</span>
                  {status && (
                    <div className={`w-1 h-1 rounded-full mt-1 ${
                      status === 'success' ? 'bg-chart-1' :
                      status === 'warning' ? 'bg-chart-3' :
                      'bg-destructive'
                    }`} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-chart-1" />
            <span className="text-muted-foreground">Meta atingida</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-chart-3" />
            <span className="text-muted-foreground">Déficit</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Excesso</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
