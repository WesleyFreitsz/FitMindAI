import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MealSummary from "@/components/MealSummary";
import { useFoodLogs, useDeleteFoodLog } from "@/lib/hooks";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";

interface DaySummaryModalProps {
  date: Date;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DaySummaryModal({
  date,
  open,
  onOpenChange,
}: DaySummaryModalProps) {
  const { data: foodLogs = [], isLoading } = useFoodLogs(date);
  const deleteFoodLogMutation = useDeleteFoodLog();

  const handleDeleteLog = (id: string) => {
    deleteFoodLogMutation.mutate(id);
  };

  const groupLogsByMeal = (meal: "cafe" | "almoco" | "jantar" | "lanches") => {
    return foodLogs.filter((log) => log.meal === meal && log.food);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Resumo de {format(date, "d 'de' MMMM, yyyy", { locale: ptBR })}
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            <MealSummary
              meal="cafe"
              logs={groupLogsByMeal("cafe")}
              onDeleteLog={handleDeleteLog}
            />
            <MealSummary
              meal="almoco"
              logs={groupLogsByMeal("almoco")}
              onDeleteLog={handleDeleteLog}
            />
            <MealSummary
              meal="jantar"
              logs={groupLogsByMeal("jantar")}
              onDeleteLog={handleDeleteLog}
            />
            <MealSummary
              meal="lanches"
              logs={groupLogsByMeal("lanches")}
              onDeleteLog={handleDeleteLog}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
