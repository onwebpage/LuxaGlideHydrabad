import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export interface Vendor {
  id: string;
  userId: string;
  businessName: string;
  gstNumber: string | null;
  kycStatus: "pending" | "approved" | "rejected";
  kycDocuments: string | null;
  businessAddress: string | null;
  businessPhone: string | null;
  businessEmail: string | null;
  logo: string | null;
  rating: string | null;
  totalSales: number;
  createdAt: string;
  updatedAt: string;
}

export function useVendors(filters?: { kycStatus?: string; limit?: number }) {
  return useQuery<Vendor[]>({
    queryKey: ["/api/vendors", filters],
  });
}

export function useVendor(id: string | undefined) {
  return useQuery<Vendor>({
    queryKey: ["/api/vendors", id],
    enabled: !!id,
  });
}

export function useUpdateVendor() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Vendor> }) => {
      return await apiRequest("PUT", `/api/vendors/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
    },
  });
}
