import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Send,
  User,
  Loader2,
  Coffee,
  Sun,
  Moon,
  Cookie,
} from "lucide-react";
import { useChatWithAI, useParseFoodText, useCreateFoodLog } from "@/lib/hooks";
import { useToast } from "@/hooks/use-toast";
import { InsertFood } from "@shared/schema";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

// Garante que PendingFood tenha todos os campos necessários para InsertFood
type PendingFood = InsertFood & {
  foodId?: string;
  portion: number;
  unit: string;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        'Olá! Sou o FitMind AI, seu assistente de nutrição e fitness. Você pode adicionar alimentos (ex: "200g de frango") ou fazer perguntas sobre nutrição e treino.',
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [pendingFoods, setPendingFoods] = useState<PendingFood[]>([]);

  const { toast } = useToast();
  const chatMutation = useChatWithAI();
  const parseFoodMutation = useParseFoodText();
  const createLogMutation = useCreateFoodLog();

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");

    try {
      const parsedResult = await parseFoodMutation.mutateAsync(userInput);

      // CORREÇÃO: Achata o array se ele vier aninhado
      const foods = Array.isArray(parsedResult) ? parsedResult.flat() : [];

      if (
        foods.length > 0 &&
        foods[0] &&
        typeof foods[0] === "object" &&
        "calories" in foods[0]
      ) {
        setPendingFoods(foods.map((f: any) => ({ ...f, foodId: f.id })));
        const mealPrompt: Message = {
          id: (Date.now() + 1).toString(),
          role: "system",
          content:
            "Em qual refeição você gostaria de registrar este(s) alimento(s)?",
          timestamp: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, mealPrompt]);
      } else {
        throw new Error("Não é um alimento, tratar como pergunta");
      }
    } catch (error) {
      try {
        const conversationHistory = messages
          .filter(
            (m): m is Message & { role: "user" | "assistant" } =>
              m.role === "user" || m.role === "assistant"
          )
          .map((m) => ({ role: m.role, content: m.content }));

        conversationHistory.push({ role: "user", content: userInput });

        const chatResult = await chatMutation.mutateAsync(conversationHistory);

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: chatResult.message,
          timestamp: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } catch (chatError) {
        toast({
          title: "Erro na conversa",
          description: "Não consegui processar sua mensagem",
          variant: "destructive",
        });
      }
    }
  };

  const handleMealSelect = async (
    meal: "café" | "almoço" | "jantar" | "lanches"
  ) => {
    if (pendingFoods.length === 0) return;

    try {
      for (const food of pendingFoods) {
        await createLogMutation.mutateAsync({
          foodId: food.foodId,
          foodData: food.foodId ? undefined : food,
          portion: food.portion,
          meal,
        });
      }

      const totals = pendingFoods.reduce(
        (acc, food) => {
          acc.calories += food.calories || 0;
          acc.protein += food.protein || 0;
          acc.carbs += food.carbs || 0;
          acc.fat += food.fat || 0;
          return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      const foodNames = pendingFoods.map((f) => f.name).join(", ");
      const summary = `Calorias: ${totals.calories.toFixed(
        0
      )}kcal, P: ${totals.protein.toFixed(0)}g, C: ${totals.carbs.toFixed(
        0
      )}g, G: ${totals.fat.toFixed(0)}g`;

      const aiMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Ótimo! Registrei ${foodNames} no seu ${meal}. Resumo: ${summary}`,
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => prev.filter((m) => m.role !== "system"));
      setMessages((prev) => [...prev, aiMessage]);
      setPendingFoods([]);
    } catch (error) {
      toast({
        title: "Erro ao registrar",
        description: "Não foi possível salvar seu alimento.",
        variant: "destructive",
      });
    }
  };

  const isLoading =
    chatMutation.isPending ||
    parseFoodMutation.isPending ||
    createLogMutation.isPending;

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role !== "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
              )}
              <Card
                className={`p-3 max-w-[80%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : ""
                }`}
              >
                <p className="text-sm">{message.content}</p>
                {message.role === "system" && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMealSelect("café")}
                    >
                      <Coffee className="h-4 w-4 mr-1" /> Café
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMealSelect("almoço")}
                    >
                      <Sun className="h-4 w-4 mr-1" /> Almoço
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMealSelect("jantar")}
                    >
                      <Moon className="h-4 w-4 mr-1" /> Jantar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMealSelect("lanches")}
                    >
                      <Cookie className="h-4 w-4 mr-1" /> Lanche
                    </Button>
                  </div>
                )}
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp}
                </span>
              </Card>
              {message.role === "user" && (
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
            onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSend()}
            disabled={isLoading || pendingFoods.length > 0}
            data-testid="input-chat"
          />
          <Button
            onClick={handleSend}
            size="icon"
            disabled={isLoading || pendingFoods.length > 0}
            data-testid="button-send-chat"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
