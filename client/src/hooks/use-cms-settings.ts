import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { AllCmsSettings, SiteMeta, Hero, FeaturedCollections, Testimonials, Promotions, Footer, HomepageFeaturedProducts } from "@shared/schema";

export function useCmsSettings() {
  return useQuery<AllCmsSettings>({
    queryKey: ["/api/cms/public"],
  });
}

function getAdminToken(): string | null {
  return localStorage.getItem("adminToken");
}

function handleAuthError(response: Response) {
  if (response.status === 401) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminAuth");
    window.location.href = "/admin-login";
    throw new Error("Session expired. Please log in again.");
  }
}

export function useAdminCmsSettings() {
  const adminToken = getAdminToken();
  
  return useQuery<AllCmsSettings>({
    queryKey: ["/api/admin/cms"],
    queryFn: async () => {
      const token = getAdminToken();
      if (!token) {
        throw new Error("No admin token");
      }
      const response = await fetch("/api/admin/cms", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        handleAuthError(response);
        throw new Error("Failed to fetch CMS settings");
      }
      return response.json();
    },
    enabled: !!adminToken,
    retry: false,
  });
}

async function adminFetch(url: string, options: RequestInit = {}) {
  const token = getAdminToken();
  if (!token) {
    throw new Error("No admin token");
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    handleAuthError(response);
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Request failed");
  }
  
  return response.json();
}

export function useUpdateSiteMeta() {
  return useMutation({
    mutationFn: (data: SiteMeta) => adminFetch("/api/admin/cms/site-meta", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cms/public"] });
    },
  });
}

export function useUpdateHero() {
  return useMutation({
    mutationFn: (data: Hero) => adminFetch("/api/admin/cms/hero", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cms/public"] });
    },
  });
}

export function useUpdateFeaturedCollections() {
  return useMutation({
    mutationFn: (data: FeaturedCollections) => adminFetch("/api/admin/cms/featured-collections", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cms/public"] });
    },
  });
}

export function useUpdateTestimonials() {
  return useMutation({
    mutationFn: (data: Testimonials) => adminFetch("/api/admin/cms/testimonials", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cms/public"] });
    },
  });
}

export function useUpdatePromotions() {
  return useMutation({
    mutationFn: (data: Promotions) => adminFetch("/api/admin/cms/promotions", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cms/public"] });
    },
  });
}

export function useUpdateFooter() {
  return useMutation({
    mutationFn: (data: Footer) => adminFetch("/api/admin/cms/footer", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cms/public"] });
    },
  });
}

export function useUpdateHomepageProducts() {
  return useMutation({
    mutationFn: (data: HomepageFeaturedProducts) => adminFetch("/api/admin/cms/homepage-products", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cms/public"] });
      queryClient.invalidateQueries({ queryKey: ["/api/homepage-products"] });
    },
  });
}
