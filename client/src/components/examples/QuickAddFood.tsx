import QuickAddFood from '../QuickAddFood';

export default function QuickAddFoodExample() {
  return (
    <div className="w-full max-w-md p-4">
      <QuickAddFood onSubmit={(text) => console.log('Food submitted:', text)} />
    </div>
  );
}
