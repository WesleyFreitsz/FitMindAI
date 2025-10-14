import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface CalorieRingProps {
  consumed: number;
  target: number;
  burned?: number;
}

export default function CalorieRing({
  consumed,
  target,
  burned = 0,
}: CalorieRingProps) {
  const net = consumed - burned;
  const percentage = Math.min((net / target) * 100, 100);

  const getColor = () => {
    if (net < target * 0.9) return "hsl(var(--chart-1))";
    if (net <= target * 1.1) return "hsl(var(--chart-3))";
    return "hsl(var(--destructive))";
  };

  const data = [{ value: percentage }, { value: 100 - percentage }];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="85%"
            startAngle={90}
            endAngle={-270}
            dataKey="value"
          >
            <Cell fill={getColor()} />
            <Cell fill="hsl(var(--muted))" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-mono text-3xl md:text-4xl font-bold text-foreground">
          {net.toLocaleString("pt-BR")}
        </div>
        <div className="text-sm text-muted-foreground">calorias líquidas</div>
        <div className="text-xs text-muted-foreground mt-1">
          Meta: {target.toLocaleString("pt-BR")} kcal
        </div>
      </div>
    </div>
  );
}
