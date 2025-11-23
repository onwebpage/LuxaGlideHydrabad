import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  
  // Add admin token if present
  const adminToken = localStorage.getItem("adminToken");
  if (adminToken) {
    headers["Authorization"] = `Bearer ${adminToken}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = {};
    
    // Add admin token if present
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
      headers["Authorization"] = `Bearer ${adminToken}`;
    }

    // Build URL from queryKey
    // Simple approach: first element is the URL, second (if exists and is object) is query params
    let url = String(queryKey[0]);
    
    // Check if there's a second element that's an object (query params)
    if (queryKey.length === 2 && typeof queryKey[1] === 'object' && queryKey[1] !== null && !Array.isArray(queryKey[1])) {
      const params = queryKey[1] as Record<string, unknown>;
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    } else if (queryKey.length > 1) {
      // If there are more segments, they're path segments (e.g., /api/products/123)
      const pathSegments = queryKey.slice(1).filter(s => typeof s === 'string' || typeof s === 'number');
      if (pathSegments.length > 0) {
        url += '/' + pathSegments.join('/');
      }
    }

    const res = await fetch(url, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
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
