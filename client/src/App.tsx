import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ThemeToggle from "@/components/ThemeToggle";
import Chat from "@/pages/Chat";
import Profile from "@/pages/Profile";
import Calendar from "@/pages/Calendar";
import LoginPage from "@/pages/Login";
import RegisterPage from "@/pages/Register";
import {
  MessageSquare,
  User,
  CalendarDays,
  Sparkles,
  LogIn,
  LogOut,
} from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Switch, Route, Redirect, useLocation, Router } from "wouter";

function MainLayout() {
  const [activeTab, setActiveTab] = useState<"chat" | "profile" | "calendar">(
    "chat"
  );
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  const tabs = {
    chat: Chat,
    profile: Profile,
    calendar: Calendar,
  };

  const ActiveComponent = tabs[activeTab] || Chat;

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      <header className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">FitMind AI</h1>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user?.isGuest ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/login")}
            >
              <span className="mr-2">Login</span>
              <LogIn className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={logout}>
              <span className="mr-2">Sair</span>
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 md:p-6">
        <ActiveComponent />
      </main>

      <nav className="border-t bg-background sticky bottom-0 z-10">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {Object.entries({
            Chat: { icon: MessageSquare, id: "chat" },
            Perfil: { icon: User, id: "profile" },
            Calendário: { icon: CalendarDays, id: "calendar" },
          }).map(([label, { icon: Icon, id }]) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() =>
                  setActiveTab(id as "chat" | "profile" | "calendar")
                }
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function LoadingOverlay({ text }: { text: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
      <p className="text-lg font-medium text-foreground">{text}</p>
    </div>
  );
}

function AppRoutes() {
  const { user, isLoading, isLoggingOut } = useAuth();

  if (isLoading) {
    return <LoadingOverlay text="Carregando..." />;
  }

  if (isLoggingOut) {
    return <LoadingOverlay text="A terminar sessão..." />;
  }

  return (
    <Switch>
      <Route path="/login">
        {!user?.isGuest ? <Redirect to="/" /> : <LoginPage />}
      </Route>
      <Route path="/register">
        {!user?.isGuest ? <Redirect to="/" /> : <RegisterPage />}
      </Route>
      <Route>
        <MainLayout />
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AppRoutes />
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </Router>
  );
}
