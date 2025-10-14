import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Função que verifica se a resposta é um erro (diferente de 401)
async function throwIfResNotOk(res: Response) {
  // Não lança erro para 401, pois é um estado esperado (usuário não logado)
  if (!res.ok && res.status !== 401) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`Request failed with status ${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

// A função de query padrão para o React Query
const defaultQueryFn: QueryFunction = async ({ queryKey }) => {
  const res = await fetch(queryKey.join("/") as string, {
    credentials: "include",
  });

  // Se não estiver autorizado (convidado), retorna null em vez de lançar um erro
  if (res.status === 401) {
    return null;
  }

  await throwIfResNotOk(res);
  return await res.json();
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn, // Usamos a nova função padrão
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
