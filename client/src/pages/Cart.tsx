import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Package,
  Truck,
  ShieldCheck,
  Loader2,
  ShoppingBag,
  Eye,
  Ticket,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface AppliedCoupon {
  id: string;
  code: string;
  name: string;
  discountType: "percentage" | "fixed";
  discountValue: string;
  minOrderValue: string | null;
}

export default function Cart() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    cartItems,
    cartItemCount,
    isLoading,
    updateQuantity,
    removeFromCart,
    clearCart,
    isUpdating,
    isRemoving,
  } = useCart();

  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [viewerCounts, setViewerCounts] = useState<Record<string, number>>({});
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponSuccess, setCouponSuccess] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastValidatedCodeRef = useRef<string>("");

  const cartSubtotal = cartItems.reduce((acc, item) => {
    const price = item.product?.price ? parseFloat(String(item.product.price)) : 0;
    return acc + (price * item.quantity);
  }, 0);

  const calculateCouponDiscount = (): number => {
    if (!appliedCoupon) return 0;
    
    if (appliedCoupon.discountType === "percentage") {
      return cartSubtotal * (parseFloat(appliedCoupon.discountValue) / 100);
    } else {
      return Math.min(parseFloat(appliedCoupon.discountValue), cartSubtotal);
    }
  };

  const couponDiscount = calculateCouponDiscount();
  const cartTotal = cartSubtotal - couponDiscount;

  const validateCoupon = useCallback(async (code: string) => {
    if (!code.trim() || code === lastValidatedCodeRef.current) {
      return;
    }

    lastValidatedCodeRef.current = code;
    setIsValidatingCoupon(true);
    setCouponError(null);
    setCouponSuccess(false);

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, orderTotal: cartSubtotal }),
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        setCouponError(data.message || "Invalid coupon code");
        setAppliedCoupon(null);
        setCouponSuccess(false);
        return;
      }

      setAppliedCoupon(data.coupon);
      setCouponSuccess(true);
      setCouponError(null);
      toast({
        title: "Coupon Applied!",
        description: `You're saving ${data.coupon.discountType === "percentage" 
          ? `${data.coupon.discountValue}%` 
          : `₹${data.coupon.discountValue}`}`,
      });
    } catch (error) {
      setCouponError("Failed to validate coupon");
      setAppliedCoupon(null);
      setCouponSuccess(false);
    } finally {
      setIsValidatingCoupon(false);
    }
  }, [cartSubtotal, toast]);

  const handleCouponChange = useCallback((value: string) => {
    const upperValue = value.toUpperCase();
    setCouponCode(upperValue);
    setCouponError(null);
    setCouponSuccess(false);
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!upperValue.trim()) {
      setAppliedCoupon(null);
      lastValidatedCodeRef.current = "";
      return;
    }

    if (upperValue.length >= 3) {
      debounceTimerRef.current = setTimeout(() => {
        validateCoupon(upperValue);
      }, 500);
    }
  }, [validateCoupon]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponCode("");
    setCouponSuccess(false);
    lastValidatedCodeRef.current = "";
    toast({
      title: "Coupon Removed",
      description: "Coupon has been removed from your order",
    });
  };

  const productIdsString = useMemo(() => {
    return cartItems.map(item => item.productId).sort().join(',');
  }, [cartItems]);

  useEffect(() => {
    if (!productIdsString) {
      setViewerCounts({});
      return;
    }

    const fetchViewerCounts = async () => {
      const productIds = productIdsString.split(',');
      try {
        const response = await fetch('/api/products/viewers/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productIds }),
        });
        if (response.ok) {
          const data = await response.json();
          setViewerCounts(data.viewerCounts || {});
        }
      } catch (error) {
        console.error('Failed to fetch viewer counts:', error);
      }
    };

    fetchViewerCounts();
    const interval = setInterval(fetchViewerCounts, 15000);
    
    return () => clearInterval(interval);
  }, [productIdsString]);

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      return;
    }

    setUpdatingItemId(cartItemId);
    try {
      await updateQuantity({ cartItemId, quantity: newQuantity });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update quantity",
        variant: "destructive",
      });
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    setRemovingItemId(cartItemId);
    try {
      await removeFromCart(cartItemId);
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item",
        variant: "destructive",
      });
    } finally {
      setRemovingItemId(null);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to clear cart",
        variant: "destructive",
      });
    }
  };

  const parseProductImages = (images: any): string[] => {
    if (!images) return [];
    if (Array.isArray(images)) return images;
    try {
      return JSON.parse(images);
    } catch {
      return [];
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="mb-8">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <Skeleton className="w-32 h-32 rounded-lg" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-8 w-32" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <Card className="text-center py-16">
            <CardContent>
              <ShoppingBag className="w-20 h-20 mx-auto mb-6 text-muted-foreground/30" />
              <h2 className="text-2xl font-semibold mb-4">Your Cart is Empty</h2>
              <p className="text-muted-foreground mb-8">
                Looks like you haven't added any items to your cart yet
              </p>
              <Link href="/products">
                <Button size="lg" data-testid="button-browse-products">
                  <Package className="w-5 h-5 mr-2" />
                  Browse Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-12 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-3 sm:px-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="font-serif text-2xl sm:text-4xl font-semibold mb-1 sm:mb-2">Shopping Cart</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {cartItemCount} {cartItemCount === 1 ? "item" : "items"} in your cart
            </p>
          </div>
          <Link href="/products">
            <Button variant="outline" size="sm" className="w-full sm:w-auto" data-testid="button-continue-shopping">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="text-xs sm:text-sm">Continue Shopping</span>
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const productImages = parseProductImages(item.product?.images);
              const productImage = productImages[0] || "/placeholder.jpg";
              const productPrice = parseFloat(String(item.product?.price || "0"));

              return (
                <Card key={item.id} data-testid={`cart-item-${item.id}`}>
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex gap-3 sm:gap-6">
                      <Link href={`/products/${item.productId}`}>
                        <div className="w-20 h-20 sm:w-32 sm:h-32 bg-secondary rounded-lg overflow-hidden shrink-0 hover-elevate">
                          <img
                            src={productImage}
                            alt={item.product?.name || "Product"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <Link href={`/products/${item.productId}`} className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-lg mb-1 hover:text-primary transition-colors line-clamp-2 sm:truncate" data-testid={`text-product-name-${item.id}`}>
                              {item.product?.name || "Product"}
                            </h3>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 -mt-1 -mr-2 sm:hidden"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={removingItemId === item.id}
                            data-testid={`button-remove-mobile-${item.id}`}
                          >
                            {removingItemId === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                          {item.selectedColor && (
                            <Badge variant="secondary" className="text-xs" data-testid={`badge-color-${item.id}`}>
                              {item.selectedColor}
                            </Badge>
                          )}
                          {item.selectedSize && (
                            <Badge variant="secondary" className="text-xs" data-testid={`badge-size-${item.id}`}>
                              {item.selectedSize}
                            </Badge>
                          )}
                        </div>

                        {viewerCounts[item.productId] > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-orange-600 mb-2" data-testid={`text-viewers-${item.id}`}>
                            <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span>{viewerCounts[item.productId]} {viewerCounts[item.productId] === 1 ? 'person' : 'people'} viewing</span>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mt-2 sm:mt-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={updatingItemId === item.id || item.quantity <= 1}
                              data-testid={`button-decrease-${item.id}`}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <div className="flex items-center">
                              {updatingItemId === item.id ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-4" />
                              ) : (
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (val >= 1) {
                                      handleUpdateQuantity(item.id, val);
                                    }
                                  }}
                                  className="w-16 sm:w-20 text-center text-sm"
                                  min={1}
                                  data-testid={`input-quantity-${item.id}`}
                                />
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={updatingItemId === item.id}
                              data-testid={`button-increase-${item.id}`}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              ₹{productPrice.toLocaleString()} x {item.quantity}
                            </p>
                            <p className="text-base sm:text-xl font-semibold" data-testid={`text-item-total-${item.id}`}>
                              ₹{(productPrice * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 hidden sm:flex"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={removingItemId === item.id}
                        data-testid={`button-remove-${item.id}`}
                      >
                        {removingItemId === item.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <div className="flex justify-end">
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={handleClearCart}
                data-testid="button-clear-cart"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cart
              </Button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20 sm:top-24">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({cartItemCount} items)</span>
                  <span className="font-medium" data-testid="text-subtotal">₹{Math.round(cartSubtotal).toLocaleString()}</span>
                </div>

                <Separator />
                
                <div className="space-y-3">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Ticket className="w-4 h-4" />
                    Apply Coupon
                  </p>
                  
                  <div className="relative">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => handleCouponChange(e.target.value)}
                      className={`pr-10 transition-all ${
                        couponSuccess && appliedCoupon
                          ? "border-green-500 bg-green-50 dark:bg-green-950/30 focus-visible:ring-green-500"
                          : couponError
                          ? "border-destructive bg-red-50 dark:bg-red-950/30"
                          : ""
                      }`}
                      data-testid="input-coupon-code"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isValidatingCoupon ? (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      ) : couponSuccess && appliedCoupon ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : couponError ? (
                        <AlertCircle className="w-4 h-4 text-destructive" />
                      ) : null}
                    </div>
                  </div>

                  {couponSuccess && appliedCoupon && (
                    <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium text-green-800 dark:text-green-200 text-sm">
                              {appliedCoupon.name}
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-300">
                              {appliedCoupon.discountType === "percentage"
                                ? `${appliedCoupon.discountValue}% off applied`
                                : `₹${parseFloat(appliedCoupon.discountValue).toLocaleString()} off applied`
                              }
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-700 hover:text-destructive hover:bg-destructive/10 shrink-0"
                          onClick={handleRemoveCoupon}
                          data-testid="button-remove-coupon"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {couponError && (
                    <div className="flex items-center gap-2 text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-200" data-testid="text-coupon-error">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{couponError}</span>
                    </div>
                  )}

                  {!couponCode && !appliedCoupon && (
                    <p className="text-xs text-muted-foreground">
                      Enter your coupon code above to get instant discount
                    </p>
                  )}
                </div>

                <Separator />

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 flex items-center gap-1">
                      <Ticket className="w-4 h-4" />
                      Coupon Discount
                    </span>
                    <span className="text-green-600 font-medium" data-testid="text-discount">-₹{Math.round(couponDiscount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-muted-foreground">Calculated at checkout</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span data-testid="text-total">₹{Math.round(cartTotal).toLocaleString()}</span>
                </div>
                {couponDiscount > 0 && (
                  <p className="text-xs text-green-600 text-right">
                    You're saving ₹{Math.round(couponDiscount).toLocaleString()} with your coupon!
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => {
                    toast({
                      title: "Checkout",
                      description: "Checkout functionality coming soon!",
                    });
                  }}
                  data-testid="button-checkout"
                >
                  Proceed to Checkout
                </Button>
                <Link href="/products" className="w-full">
                  <Button variant="outline" className="w-full" data-testid="button-continue-shopping-bottom">
                    Continue Shopping
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
                <Truck className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-sm">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">On all bulk orders</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-sm">Secure Checkout</p>
                  <p className="text-xs text-muted-foreground">100% protected payments</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
                <Package className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-sm">Quality Assured</p>
                  <p className="text-xs text-muted-foreground">Verified vendors only</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
