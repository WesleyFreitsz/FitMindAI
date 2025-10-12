import WorkoutCard from '../WorkoutCard';

export default function WorkoutCardExample() {
  return (
    <div className="w-full max-w-md p-4">
      <WorkoutCard
        type="Musculação"
        duration={60}
        intensity={4}
        caloriesBurned={350}
        time="18:00"
        onDelete={() => console.log('Delete workout')}
      />
    </div>
  );
}
