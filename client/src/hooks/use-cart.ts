import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth, getAuthToken } from "@/lib/auth-context";
import type { Cart, Product, Coupon } from "@shared/schema";

export interface ProductWithCoupon extends Product {
  coupon?: Coupon | null;
}

export interface CartItemWithProduct extends Cart {
  product?: ProductWithCoupon;
}

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getOrCreateGuestId(): string {
  const GUEST_ID_KEY = 'guest_cart_id';
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
}

export function useCart() {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  
  const effectiveUserId = user?.id || getOrCreateGuestId();

  const { data: cartItems = [], isLoading, refetch } = useQuery<CartItemWithProduct[]>({
    queryKey: ['/api/cart', effectiveUserId],
    queryFn: async () => {
      const authHeaders = getAuthHeaders();
      
      const response = await fetch(`/api/cart/${effectiveUserId}`, {
        headers: authHeaders,
      });
      if (!response.ok) return [];
      const items = await response.json();
      
      if (items.length === 0) return [];
      
      const productsResponse = await fetch('/api/products', {
        headers: authHeaders,
      });
      if (!productsResponse.ok) return items;
      const products = await productsResponse.json();
      const productMap = new Map(products.map((p: Product) => [p.id, p]));
      
      return items.map((item: Cart) => ({
        ...item,
        product: productMap.get(item.productId),
      }));
    },
    staleTime: 1000 * 60,
  });

  const addToCartMutation = useMutation({
    mutationFn: async (data: {
      productId: string;
      quantity: number;
      selectedColor?: string;
      selectedSize?: string;
    }) => {
      const authHeaders = getAuthHeaders();
      
      // Apply maximum limit of 10 pieces per order
      const validatedQuantity = Math.min(10, data.quantity);
      
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          userId: effectiveUserId,
          productId: data.productId,
          quantity: validatedQuantity,
          selectedColor: data.selectedColor,
          selectedSize: data.selectedSize,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add to cart");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', effectiveUserId] });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) => {
      const authHeaders = getAuthHeaders();
      
      // Apply maximum limit of 10 pieces per order
      const validatedQuantity = Math.min(10, quantity);
      
      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({ quantity: validatedQuantity }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update quantity");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', effectiveUserId] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (cartItemId: string) => {
      const authHeaders = getAuthHeaders();
      
      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to remove item");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', effectiveUserId] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const authHeaders = getAuthHeaders();
      
      const response = await fetch(`/api/cart/user/${effectiveUserId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to clear cart");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', effectiveUserId] });
    },
  });

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  const getDiscountedPrice = (item: CartItemWithProduct): number => {
    const price = item.product?.price ? parseFloat(String(item.product.price)) : 0;
    const coupon = item.product?.coupon;
    
    if (coupon && coupon.isActive) {
      if (coupon.discountType === "percentage") {
        return price * (1 - parseFloat(String(coupon.discountValue)) / 100);
      } else {
        return Math.max(0, price - parseFloat(String(coupon.discountValue)));
      }
    }
    return price;
  };
  
  const cartSubtotal = cartItems.reduce((acc, item) => {
    const price = item.product?.price ? parseFloat(String(item.product.price)) : 0;
    return acc + (price * item.quantity);
  }, 0);
  
  const cartTotal = cartItems.reduce((acc, item) => {
    const discountedPrice = getDiscountedPrice(item);
    return acc + (discountedPrice * item.quantity);
  }, 0);
  
  const cartDiscount = cartSubtotal - cartTotal;

  return {
    cartItems,
    cartItemCount,
    cartSubtotal,
    cartTotal,
    cartDiscount,
    getDiscountedPrice,
    isLoading,
    refetch,
    addToCart: addToCartMutation.mutateAsync,
    updateQuantity: updateQuantityMutation.mutateAsync,
    removeFromCart: removeFromCartMutation.mutateAsync,
    clearCart: clearCartMutation.mutateAsync,
    isAddingToCart: addToCartMutation.isPending,
    isUpdating: updateQuantityMutation.isPending,
    isRemoving: removeFromCartMutation.isPending,
  };
}
