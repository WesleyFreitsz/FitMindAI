import CalendarView from "@/components/CalendarView";
import ProgressStats from "@/components/ProgressStats";

export default function Calendar() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Calendário e Progresso
        </h1>
        <p className="text-muted-foreground">
          Acompanhe seu histórico e configure lembretes
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CalendarView />
        <ProgressStats />
      </div>
    </div>
  );
}
