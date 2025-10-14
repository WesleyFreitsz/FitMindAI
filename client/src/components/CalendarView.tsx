import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useFoodLogsRange, useExercisesRange, useUser } from "@/lib/hooks";
import { calculateCalorieGoal, calculateDailyStats } from "@/lib/calculations";
import { format, startOfMonth, endOfMonth } from "date-fns";
import DaySummaryModal from "./DaySummaryModal"; // Importar o novo modal

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [modalDate, setModalDate] = useState<Date | null>(null); // Estado para controlar o modal

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const { data: userProfile } = useUser();
  const { data: foodLogs = {} } = useFoodLogsRange(monthStart, monthEnd);
  const { data: exercises = {} } = useExercisesRange(monthStart, monthEnd);

  const calorieTarget = userProfile
    ? calculateCalorieGoal(userProfile).target
    : 2200;

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
    const dateStr = format(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day),
      "yyyy-MM-dd"
    );
    const logs = foodLogs[dateStr] || [];
    const dayExercises = exercises[dateStr] || [];

    if (logs.length === 0 && dayExercises.length === 0) return null;

    const stats = calculateDailyStats(logs, dayExercises);
    const difference = stats.consumed - calorieTarget;

    if (Math.abs(difference) <= 100) return "success";
    if (difference < -100) return "warning";
    return "danger";
  };

  const handleDayClick = (day: number) => {
    const selectedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    setModalDate(selectedDate); // Abre o modal com a data selecionada
  };

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <>
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
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1
                    )
                  )
                }
                data-testid="button-prev-month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1
                    )
                  )
                }
                data-testid="button-next-month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground p-2"
              >
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
              const isToday =
                day === new Date().getDate() &&
                currentMonth.getMonth() === new Date().getMonth() &&
                currentMonth.getFullYear() === new Date().getFullYear();

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square p-1 rounded-md text-sm hover-elevate active-elevate-2 ${
                    isToday ? "ring-2 ring-primary" : ""
                  } ${
                    status === "success"
                      ? "bg-chart-1/20"
                      : status === "warning"
                      ? "bg-chart-3/20"
                      : status === "danger"
                      ? "bg-destructive/20"
                      : ""
                  }`}
                  data-testid={`calendar-day-${day}`}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-foreground">{day}</span>
                    {status && (
                      <div
                        className={`w-1 h-1 rounded-full mt-1 ${
                          status === "success"
                            ? "bg-chart-1"
                            : status === "warning"
                            ? "bg-chart-3"
                            : "bg-destructive"
                        }`}
                      />
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
      {modalDate && (
        <DaySummaryModal
          date={modalDate}
          open={!!modalDate}
          onOpenChange={(open) => !open && setModalDate(null)}
        />
      )}
    </>
  );
}
