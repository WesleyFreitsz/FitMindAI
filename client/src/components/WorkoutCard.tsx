import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dumbbell, Clock, Flame, Trash2 } from 'lucide-react';

interface WorkoutCardProps {
  type: string;
  duration: number;
  intensity: number;
  caloriesBurned: number;
  time: string;
  onDelete?: () => void;
}

export default function WorkoutCard({
  type,
  duration,
  intensity,
  caloriesBurned,
  time,
  onDelete,
}: WorkoutCardProps) {
  const getIntensityLabel = (level: number) => {
    if (level <= 2) return 'Leve';
    if (level <= 4) return 'Moderado';
    return 'Intenso';
  };

  return (
    <Card className="p-4 hover-elevate active-elevate-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            <h4 className="font-semibold text-foreground">{type}</h4>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{duration} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame className="h-4 w-4" />
              <span className="font-mono font-semibold">{caloriesBurned} kcal</span>
            </div>
          </div>
          <Badge variant="secondary" className="mt-2 text-xs">
            {getIntensityLabel(intensity)}
          </Badge>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">{time}</span>
          {onDelete && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onDelete}
              data-testid="button-delete-workout"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
