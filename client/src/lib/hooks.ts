import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "./queryClient";
import type { User, Food, FoodLog, Exercise, InsertFood } from "@shared/schema";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function useUser() {
  const { user } = useAuth();
  return useQuery<User>({
    queryKey: ["/api/user"],
    enabled: !user?.isGuest,
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/user");
      return res.json() as Promise<User>;
    },
  });
}

export function useUpdateUser() {
  const { user } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      if (user?.isGuest) {
        toast({ title: "Faça login para salvar suas alterações." });
        return Promise.resolve();
      }
      const res = await apiRequest("PUT", "/api/user", data);
      return res.json();
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      }
    },
  });
}

export function useFoods(query?: string) {
  return useQuery<Food[]>({
    queryKey: ["/api/foods", query],
    enabled: !!query && query.length > 0,
  });
}

export function useParseFoodText() {
  return useMutation({
    mutationFn: async (text: string) => {
      const res = await apiRequest("POST", "/api/foods/parse", { text });
      return res.json();
    },
  });
}

export function useFoodLogs(date?: Date) {
  const { user } = useAuth();
  const dateStr = date
    ? date.toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  return useQuery<(FoodLog & { food?: Food })[]>({
    queryKey: ["/api/food-logs", dateStr],
    enabled: !user?.isGuest,
  });
}

export function useCreateFoodLog() {
  const { user } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: {
      foodId?: string;
      foodData?: Omit<InsertFood, "id">;
      portion: number;
      meal: string;
    }) => {
      if (user?.isGuest) {
        toast({ title: "Faça login para salvar suas refeições." });
        return Promise.resolve();
      }
      const res = await apiRequest("POST", "/api/food-logs", data);
      return res.json();
    },
    onSuccess: (data) => {
      if (data) {
        // Invalida TODAS as queries que começam com '/api/food-logs'
        // Isso inclui o resumo diário e o calendário/progresso
        queryClient.invalidateQueries({ queryKey: ["/api/food-logs"] });
      }
    },
  });
}

export function useDeleteFoodLog() {
  const { user } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      if (user?.isGuest) {
        toast({ title: "Faça login para gerenciar suas refeições." });
        return Promise.resolve();
      }
      const res = await apiRequest("DELETE", `/api/food-logs/${id}`);
      return res.json();
    },
    onSuccess: (data) => {
      if (data) {
        // Invalida TODAS as queries que começam com '/api/food-logs'
        queryClient.invalidateQueries({ queryKey: ["/api/food-logs"] });
      }
    },
  });
}

export function useExercises(date?: Date) {
  const { user } = useAuth();
  const dateStr = date
    ? date.toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  return useQuery<Exercise[]>({
    queryKey: ["/api/exercises", dateStr],
    enabled: !user?.isGuest,
  });
}

export function useCreateExercise() {
  const { user } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: {
      type: string;
      duration: number;
      intensity: number;
      caloriesBurned: number;
    }) => {
      if (user?.isGuest) {
        toast({ title: "Faça login para salvar seus treinos." });
        return Promise.resolve();
      }
      const res = await apiRequest("POST", "/api/exercises", data);
      return res.json();
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
      }
    },
  });
}

interface Alarm {
  id: string;
  userId: string;
  time: string;
  label: string;
  enabled: boolean;
}

export function useAlarms() {
  const { user } = useAuth();
  return useQuery<Alarm[]>({
    queryKey: ["/api/alarms"],
    enabled: !user?.isGuest,
  });
}

export function useCreateAlarm() {
  const { user } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: {
      time: string;
      label: string;
      enabled?: boolean;
    }) => {
      if (user?.isGuest) {
        toast({ title: "Faça login para salvar seus alarmes." });
        return Promise.resolve();
      }
      const res = await apiRequest("POST", "/api/alarms", data);
      return res.json();
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["/api/alarms"] });
      }
    },
  });
}

export function useUpdateAlarm() {
  const { user } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Alarm> }) => {
      if (user?.isGuest) {
        toast({ title: "Faça login para gerenciar seus alarmes." });
        return Promise.resolve();
      }
      const res = await apiRequest("PUT", `/api/alarms/${id}`, data);
      return res.json();
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["/api/alarms"] });
      }
    },
  });
}

export function useDeleteAlarm() {
  const { user } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      if (user?.isGuest) {
        toast({ title: "Faça login para gerenciar seus alarmes." });
        return Promise.resolve();
      }
      const res = await apiRequest("DELETE", `/api/alarms/${id}`);
      return res.json();
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["/api/alarms"] });
      }
    },
  });
}

export function useChatWithAI() {
  return useMutation({
    mutationFn: async (
      messages: { role: "user" | "assistant"; content: string }[]
    ) => {
      const res = await apiRequest("POST", "/api/chat", { messages });
      return res.json();
    },
  });
}

export function useFoodLogsRange(startDate: Date, endDate: Date) {
  const { user } = useAuth();
  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  return useQuery<Record<string, (FoodLog & { food?: Food })[]>>({
    queryKey: ["/api/food-logs/range", startStr, endStr],
    enabled: !user?.isGuest,
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/food-logs/range?start=${startStr}&end=${endStr}`
      );
      return res.json();
    },
  });
}

export function useExercisesRange(startDate: Date, endDate: Date) {
  const { user } = useAuth();
  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  return useQuery<Record<string, Exercise[]>>({
    queryKey: ["/api/exercises/range", startStr, endStr],
    enabled: !user?.isGuest,
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/exercises/range?start=${startStr}&end=${endStr}`
      );
      return res.json();
    },
  });
}
