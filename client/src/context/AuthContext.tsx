import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { User, InsertUser } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

// Adicionamos uma propriedade opcional 'isGuest' ao tipo User
type AppUser = User & { isGuest?: boolean };

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Omit<InsertUser, "id">) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Objeto padrão para o usuário convidado
const GUEST_USER: AppUser = {
  id: "guest",
  name: "Convidado",
  email: "",
  password: "", // A senha não é usada, mas precisa existir para satisfazer o tipo
  age: 25,
  sex: "masculino",
  weight: 70,
  height: 175,
  goal: "manter",
  activityLevel: "moderado",
  isGuest: true, // Flag para identificar o usuário convidado
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (res.ok) {
          const userData = await res.json();
          setUser({ ...userData, isGuest: false });
        } else if (res.status === 401) {
          // ✅ Sessão inexistente → usuário convidado
          setUser(GUEST_USER);
        } else {
          // ❗ Outros erros de status
          console.warn("Erro inesperado no /api/auth/me:", res.status);
          setUser(GUEST_USER);
        }
      } catch (error) {
        // 🔹 Falha real (servidor offline, CORS, etc)
        console.warn("Falha ao verificar sessão:", error);
        setUser(GUEST_USER);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiRequest("POST", "/api/auth/login", {
      email,
      password,
    });
    const userData = await res.json();
    setUser({ ...userData, isGuest: false });
    navigate("/");
  };

  const register = async (data: Omit<InsertUser, "id">) => {
    const res = await apiRequest("POST", "/api/auth/register", data);
    const userData = await res.json();
    setUser({ ...userData, isGuest: false });
    navigate("/");
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await apiRequest("POST", "/api/auth/logout", {});
    } catch (error) {
      console.error("Falha ao fazer logout:", error);
    } finally {
      // Força um recarregamento completo da página, que irá resetar todo o estado.
      window.location.href = "/";
    }
  };

  const value = { user, isLoading, isLoggingOut, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
