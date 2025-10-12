import CalorieRing from '../CalorieRing';

export default function CalorieRingExample() {
  return (
    <div className="w-full h-[300px] p-4">
      <CalorieRing consumed={1850} target={2200} burned={350} />
    </div>
  );
}
