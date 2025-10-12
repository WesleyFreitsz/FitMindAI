import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "./queryClient";
import type { User, Food, FoodLog, Exercise } from "@shared/schema";

// User hooks
export function useUser() {
  return useQuery<User>({
    queryKey: ["/api/user"],
  });
}

export function useUpdateUser() {
  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const res = await apiRequest("PUT", "/api/user", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
  });
}

// Food hooks
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

// Food log hooks
export function useFoodLogs(date?: Date) {
  const dateStr = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  
  return useQuery<(FoodLog & { food?: Food })[]>({
    queryKey: ["/api/food-logs", dateStr],
  });
}

export function useCreateFoodLog() {
  return useMutation({
    mutationFn: async (data: { foodId: string; portion: number; meal: string }) => {
      const res = await apiRequest("POST", "/api/food-logs", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/food-logs"] });
    },
  });
}

export function useDeleteFoodLog() {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/food-logs/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/food-logs"] });
    },
  });
}

// Exercise hooks
export function useExercises(date?: Date) {
  const dateStr = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  
  return useQuery<Exercise[]>({
    queryKey: ["/api/exercises", dateStr],
  });
}

export function useCreateExercise() {
  return useMutation({
    mutationFn: async (data: {
      type: string;
      duration: number;
      intensity: number;
      caloriesBurned: number;
    }) => {
      const res = await apiRequest("POST", "/api/exercises", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
    },
  });
}

// Alarm hooks
interface Alarm {
  id: string;
  userId: string;
  time: string;
  label: string;
  enabled: boolean;
}

export function useAlarms() {
  return useQuery<Alarm[]>({
    queryKey: ["/api/alarms"],
  });
}

export function useCreateAlarm() {
  return useMutation({
    mutationFn: async (data: { time: string; label: string; enabled?: boolean }) => {
      const res = await apiRequest("POST", "/api/alarms", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alarms"] });
    },
  });
}

export function useUpdateAlarm() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Alarm> }) => {
      const res = await apiRequest("PUT", `/api/alarms/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alarms"] });
    },
  });
}

export function useDeleteAlarm() {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/alarms/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alarms"] });
    },
  });
}

// Chat hook
export function useChatWithAI() {
  return useMutation({
    mutationFn: async (messages: { role: 'user' | 'assistant'; content: string }[]) => {
      const res = await apiRequest("POST", "/api/chat", { messages });
      return res.json();
    },
  });
}
