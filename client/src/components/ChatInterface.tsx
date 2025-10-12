import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, User, Loader2 } from 'lucide-react';
import { useChatWithAI, useParseFoodText, useCreateFoodLog } from '@/lib/hooks';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou o FitMind AI, seu assistente de nutrição e fitness. Você pode adicionar alimentos (ex: "200g de frango") ou fazer perguntas sobre nutrição e treino.',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  
  const { toast } = useToast();
  const chatMutation = useChatWithAI();
  const parseFoodMutation = useParseFoodText();
  const createLogMutation = useCreateFoodLog();

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput('');

    // Check if it's a food input (contains numbers or food-related keywords)
    const isFoodInput = /\d+\s*(g|ml|kg|unidade|xícara|colher)/i.test(userInput) || 
                        /comi|comer|almocei|jantei|café|lanche/i.test(userInput);

    if (isFoodInput) {
      try {
        const result = await parseFoodMutation.mutateAsync(userInput);
        
        if (result && result.length > 0) {
          // Add foods to log (assuming lunch meal for now)
          for (const food of result) {
            await createLogMutation.mutateAsync({
              foodId: food.id,
              portion: food.portion || food.servingSize,
              meal: 'almoço',
            });
          }

          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `Registrei ${result.length} alimento(s): ${result.map((f: any) => f.name).join(', ')}. Total de calorias adicionadas!`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, aiMessage]);
        } else {
          throw new Error('Não consegui identificar os alimentos');
        }
      } catch (error) {
        toast({
          title: 'Erro ao processar alimento',
          description: 'Tente novamente com formato: "200g de frango"',
          variant: 'destructive',
        });
      }
    } else {
      // It's a question - use chat AI
      try {
        const conversationHistory = messages
          .filter(m => m.role === 'user' || m.role === 'assistant')
          .map(m => ({ role: m.role, content: m.content }));
        
        conversationHistory.push({ role: 'user', content: userInput });

        const result = await chatMutation.mutateAsync(conversationHistory);
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.message,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        toast({
          title: 'Erro na conversa',
          description: 'Não consegui processar sua mensagem',
          variant: 'destructive',
        });
      }
    }
  };

  const isLoading = chatMutation.isPending || parseFoodMutation.isPending;

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
              )}
              <Card className={`p-3 max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : ''}`}>
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">{message.timestamp}</span>
              </Card>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              </div>
              <Card className="p-3">
                <p className="text-sm text-muted-foreground">Pensando...</p>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Digite sua pergunta ou '200g de frango'..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            disabled={isLoading}
            data-testid="input-chat"
          />
          <Button onClick={handleSend} size="icon" disabled={isLoading} data-testid="button-send-chat">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
