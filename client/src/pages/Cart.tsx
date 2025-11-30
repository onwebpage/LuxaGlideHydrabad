import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    cartItems,
    cartItemCount,
    cartTotal,
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

  useEffect(() => {
    const fetchViewerCounts = async () => {
      if (cartItems.length === 0) {
        setViewerCounts({});
        return;
      }
      
      const productIds = cartItems.map(item => item.productId);
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
  }, [cartItems]);

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number, moq: number) => {
    if (newQuantity < moq) {
      toast({
        title: "Minimum Order Quantity",
        description: `Minimum order quantity is ${moq} pieces`,
        variant: "destructive",
      });
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

  if (!user) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <Card className="text-center py-16">
            <CardContent>
              <ShoppingCart className="w-20 h-20 mx-auto mb-6 text-muted-foreground/30" />
              <h2 className="text-2xl font-semibold mb-4">Please Login</h2>
              <p className="text-muted-foreground mb-8">
                You need to be logged in to view your cart
              </p>
              <Link href="/login">
                <Button size="lg" data-testid="button-login">
                  Login to Continue
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen py-12 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-4xl font-semibold mb-2">Shopping Cart</h1>
            <p className="text-muted-foreground">
              {cartItemCount} {cartItemCount === 1 ? "item" : "items"} in your cart
            </p>
          </div>
          <Link href="/products">
            <Button variant="outline" data-testid="button-continue-shopping">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const productImages = parseProductImages(item.product?.images);
              const productImage = productImages[0] || "/placeholder.jpg";
              const productPrice = parseFloat(String(item.product?.price || "0"));
              const productMoq = item.product?.moq || 1;

              return (
                <Card key={item.id} data-testid={`cart-item-${item.id}`}>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <Link href={`/products/${item.productId}`}>
                        <div className="w-32 h-32 bg-secondary rounded-lg overflow-hidden shrink-0 hover-elevate">
                          <img
                            src={productImage}
                            alt={item.product?.name || "Product"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.productId}`}>
                          <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors truncate" data-testid={`text-product-name-${item.id}`}>
                            {item.product?.name || "Product"}
                          </h3>
                        </Link>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {item.selectedColor && (
                            <Badge variant="secondary" data-testid={`badge-color-${item.id}`}>
                              {item.selectedColor}
                            </Badge>
                          )}
                          {item.selectedSize && (
                            <Badge variant="secondary" data-testid={`badge-size-${item.id}`}>
                              {item.selectedSize}
                            </Badge>
                          )}
                          <Badge variant="outline">MOQ: {productMoq}</Badge>
                        </div>

                        {viewerCounts[item.productId] > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-orange-600 mb-2" data-testid={`text-viewers-${item.id}`}>
                            <Eye className="w-3.5 h-3.5" />
                            <span>{viewerCounts[item.productId]} {viewerCounts[item.productId] === 1 ? 'person' : 'people'} viewing</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, productMoq)}
                              disabled={updatingItemId === item.id || item.quantity <= productMoq}
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
                                    if (val >= productMoq) {
                                      handleUpdateQuantity(item.id, val, productMoq);
                                    }
                                  }}
                                  className="w-20 text-center"
                                  min={productMoq}
                                  data-testid={`input-quantity-${item.id}`}
                                />
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, productMoq)}
                              disabled={updatingItemId === item.id}
                              data-testid={`button-increase-${item.id}`}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              ₹{productPrice.toLocaleString()} x {item.quantity}
                            </p>
                            <p className="text-xl font-semibold" data-testid={`text-item-total-${item.id}`}>
                              ₹{(productPrice * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
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
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({cartItemCount} items)</span>
                  <span className="font-medium" data-testid="text-subtotal">₹{cartTotal.toLocaleString()}</span>
                </div>
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
                  <span data-testid="text-total">₹{cartTotal.toLocaleString()}</span>
                </div>
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
