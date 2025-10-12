import WeightProjection from '../WeightProjection';

export default function WeightProjectionExample() {
  const mockData = [
    { day: 'Seg', weight: 78.5 },
    { day: 'Ter', weight: 78.2 },
    { day: 'Qua', weight: 78.0 },
    { day: 'Qui', weight: 77.8 },
    { day: 'Sex', weight: 77.5 },
    { day: 'Sáb', weight: 77.3 },
    { day: 'Dom', weight: 77.0 },
  ];

  return (
    <div className="w-full max-w-md p-4">
      <WeightProjection
        currentWeight={78.5}
        projectedWeight={77.0}
        weeklyData={mockData}
      />
    </div>
  );
}
