import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, Search } from 'lucide-react';

interface QuickAddFoodProps {
  onSubmit?: (text: string) => void;
}

export default function QuickAddFood({ onSubmit }: QuickAddFoodProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && onSubmit) {
      onSubmit(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Ex: 200g de frango e 100g de arroz..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="pl-10 pr-12 h-12 text-base"
          data-testid="input-add-food"
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="absolute right-1 top-1/2 -translate-y-1/2"
          data-testid="button-voice-input"
          onClick={() => console.log('Voice input triggered')}
        >
          <Mic className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}
