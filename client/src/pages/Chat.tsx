import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChatInterface from "@/components/ChatInterface";
import DailySummary from "@/components/DailySummary";

export default function Chat() {
  return (
    <div className="grid gap-6 lg:grid-cols-3 h-full">
      <div className="lg:col-span-2 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Chat com IA</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            <ChatInterface />
          </CardContent>
        </Card>
      </div>

      <DailySummary />
    </div>
  );
}
