import { Progress } from '@/components/ui/progress';

interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  color: string;
  unit?: string;
}

export default function MacroBar({ label, current, target, color, unit = 'g' }: MacroBarProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const isComplete = current >= target;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="font-mono text-sm font-semibold text-foreground">
          {current.toFixed(0)}/{target.toFixed(0)}{unit}
        </span>
      </div>
      <Progress 
        value={percentage} 
        className="h-2"
        style={{
          '--progress-background': color,
        } as React.CSSProperties}
      />
    </div>
  );
}
