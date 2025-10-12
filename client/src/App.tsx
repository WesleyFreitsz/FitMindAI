import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ThemeToggle from "@/components/ThemeToggle";
import Chat from "@/pages/Chat";
import Profile from "@/pages/Profile";
import Calendar from "@/pages/Calendar";
import { MessageSquare, User, CalendarDays, Sparkles } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'profile' | 'calendar'>('chat');

  const tabs = [
    { id: 'chat' as const, label: 'Chat', icon: MessageSquare, component: Chat },
    { id: 'profile' as const, label: 'Perfil', icon: User, component: Profile },
    { id: 'calendar' as const, label: 'Calendário', icon: CalendarDays, component: Calendar },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || Chat;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col h-screen w-full bg-background">
          <header className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">FitMind AI</h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-6">
            <ActiveComponent />
          </main>

          <nav className="border-t bg-background sticky bottom-0 z-10">
            <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors hover-elevate active-elevate-2 ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                    data-testid={`tab-${tab.id}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
