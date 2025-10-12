import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Edit } from 'lucide-react';

interface FoodLogCardProps {
  foodName: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  onDelete?: () => void;
  onEdit?: () => void;
}

export default function FoodLogCard({
  foodName,
  portion,
  calories,
  protein,
  carbs,
  fat,
  time,
  onDelete,
  onEdit,
}: FoodLogCardProps) {
  return (
    <Card className="p-4 hover-elevate active-elevate-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate">{foodName}</h4>
          <p className="text-sm text-muted-foreground">{portion}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {calories} kcal
            </Badge>
            <Badge variant="outline" className="text-xs">
              P: {protein}g
            </Badge>
            <Badge variant="outline" className="text-xs">
              C: {carbs}g
            </Badge>
            <Badge variant="outline" className="text-xs">
              G: {fat}g
            </Badge>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">{time}</span>
          <div className="flex gap-1">
            {onEdit && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onEdit}
                data-testid="button-edit-food"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onDelete}
                data-testid="button-delete-food"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
