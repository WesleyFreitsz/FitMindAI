import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface AISuggestionCardProps {
  message: string;
}

export default function AISuggestionCard({ message }: AISuggestionCardProps) {
  return (
    <Card className="p-4 border-l-4 border-l-primary">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
        </div>
        <p className="text-sm text-foreground flex-1">{message}</p>
      </div>
    </Card>
  );
}
