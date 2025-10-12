import MacroBar from '../MacroBar';

export default function MacroBarExample() {
  return (
    <div className="w-full max-w-md space-y-4 p-4">
      <MacroBar label="Proteína" current={120} target={150} color="hsl(var(--chart-2))" />
      <MacroBar label="Carboidratos" current={200} target={250} color="hsl(var(--chart-3))" />
      <MacroBar label="Gordura" current={55} target={70} color="hsl(var(--chart-4))" />
    </div>
  );
}
