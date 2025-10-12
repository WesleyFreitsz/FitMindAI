import FoodLogCard from '../FoodLogCard';

export default function FoodLogCardExample() {
  return (
    <div className="w-full max-w-md p-4">
      <FoodLogCard
        foodName="Peito de Frango Grelhado"
        portion="200g"
        calories={330}
        protein={62}
        carbs={0}
        fat={7}
        time="12:30"
        onDelete={() => console.log('Delete clicked')}
        onEdit={() => console.log('Edit clicked')}
      />
    </div>
  );
}
