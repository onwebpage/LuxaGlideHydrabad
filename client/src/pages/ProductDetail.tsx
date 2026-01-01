import { useState, useEffect, useRef } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ShoppingCart,
  Star,
  Package,
  Truck,
  Shield,
  ArrowLeft,
  Plus,
  Minus,
  Loader2,
  Check,
  Eye,
  Ticket,
  Ruler,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import type { Product, Vendor } from "@shared/schema";

function getOrCreateSessionId(): string {
  const key = 'viewer_session_id';
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
}

import redSaree1 from "@assets/stock_images/red_silk_saree_india_274954fe.jpg";
import redSaree2 from "@assets/stock_images/red_silk_saree_india_cb81e8d8.jpg";
import redSaree3 from "@assets/stock_images/red_silk_saree_india_0a093fd6.jpg";
import blueSaree1 from "@assets/stock_images/blue_silk_saree_indi_03d2ff84.jpg";
import blueSaree2 from "@assets/stock_images/blue_silk_saree_indi_a49ea2a4.jpg";
import blueSaree3 from "@assets/stock_images/blue_silk_saree_indi_1fd841f8.jpg";
import goldSaree1 from "@assets/stock_images/gold_silk_saree_indi_b188128e.jpg";
import goldSaree2 from "@assets/stock_images/gold_silk_saree_indi_67bb39b1.jpg";
import goldSaree3 from "@assets/stock_images/gold_silk_saree_indi_76bd41d5.jpg";
import pinkSaree1 from "@assets/stock_images/pink_silk_saree_indi_ab617266.jpg";
import pinkSaree2 from "@assets/stock_images/pink_silk_saree_indi_373d4cfa.jpg";
import pinkSaree3 from "@assets/stock_images/pink_silk_saree_indi_f09954ad.jpg";
import greenSaree1 from "@assets/stock_images/green_silk_saree_ind_054b34aa.jpg";
import greenSaree2 from "@assets/stock_images/green_silk_saree_ind_3a3335d8.jpg";
import greenSaree3 from "@assets/stock_images/green_silk_saree_ind_e24af193.jpg";

const colorImageMap: Record<string, string[]> = {
  Red: [redSaree1, redSaree2, redSaree3],
  Blue: [blueSaree1, blueSaree2, blueSaree3],
  Gold: [goldSaree1, goldSaree2, goldSaree3],
  Pink: [pinkSaree1, pinkSaree2, pinkSaree3],
  Green: [greenSaree1, greenSaree2, greenSaree3],
};

interface AppliedCoupon {
  id: string;
  code: string;
  name: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue?: number | null;
}

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const [, setLocation] = useLocation();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedHeight, setSelectedHeight] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [suggestedSize, setSuggestedSize] = useState("");
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const currentProductIdRef = useRef<string | null>(null);
  
  const { addToCart, isAddingToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const productId = params?.id;
    if (!productId) return;

    const sessionId = getOrCreateSessionId();
    
    const cleanupPreviousProduct = () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      if (currentProductIdRef.current && currentProductIdRef.current !== productId) {
        fetch(`/api/products/${currentProductIdRef.current}/view`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        }).catch(() => {});
      }
    };

    cleanupPreviousProduct();
    currentProductIdRef.current = productId;
    setViewerCount(0);

    const registerView = async () => {
      try {
        const response = await fetch(`/api/products/${productId}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        if (response.ok) {
          const data = await response.json();
          setViewerCount(data.viewerCount);
        }
      } catch (error) {
        console.error('Failed to register view:', error);
      }
    };

    registerView();

    heartbeatRef.current = setInterval(registerView, 15000);

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      fetch(`/api/products/${productId}/view`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      }).catch(() => {});
      currentProductIdRef.current = null;
    };
  }, [params?.id]);

  const { data: similarProducts } = useQuery<Product[]>({
    queryKey: [`/api/products/${params?.id}/similar`],
    enabled: !!params?.id,
  });

  const { data: productData, isLoading: productLoading } = useQuery<Product>({
    queryKey: ['/api/products', params?.id],
    enabled: !!params?.id,
  });

  const { data: vendorData } = useQuery<Vendor>({
    queryKey: ['/api/vendors', productData?.vendorId],
    queryFn: async () => {
      const response = await fetch(`/api/vendors/approved`);
      const vendors = await response.json();
      return vendors.find((v: Vendor) => v.id === productData?.vendorId);
    },
    enabled: !!productData?.vendorId,
  });

  const parseJsonField = (field: any): string[] => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    try {
      return JSON.parse(field);
    } catch {
      return [];
    }
  };

  const parseBulkPricing = (field: any): Array<{ quantity: number; price: number }> => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    try {
      return JSON.parse(field);
    } catch {
      return [];
    }
  };

  const images = parseJsonField(productData?.images);
  const colors = parseJsonField(productData?.colors);
  const sizes = parseJsonField(productData?.sizes);
  const bulkPricing = parseBulkPricing(productData?.bulkPricing);

  const product = {
    id: productData?.id || params?.id || "1",
    name: productData?.name || "Product",
    vendor: {
      id: vendorData?.id || "v1",
      name: vendorData?.businessName || "Vendor",
      rating: parseFloat(String(vendorData?.rating || "4.5")),
      totalSales: vendorData?.totalSales || 0,
    },
    price: parseFloat(String(productData?.price || "0")),
    moq: productData?.moq || 1,
    stock: productData?.stock || 0,
    rating: parseFloat(String(productData?.rating || "0")),
    reviewCount: productData?.reviewCount || 0,
    description: productData?.description || "",
    fabric: productData?.fabric || "",
    category: "Fashion",
    colors: colors.length > 0 ? colors : ["Red", "Blue", "Gold", "Pink", "Green"],
    sizes: sizes.length > 0 ? sizes : ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    bulkPricing: bulkPricing.length > 0 ? bulkPricing : [],
    features: [
      productData?.fabric ? `Made with ${productData.fabric}` : "Premium Quality",
      "Handcrafted",
      "Free Shipping",
      "Easy Returns",
    ],
  };

  useEffect(() => {
    if (sizes.length > 0 && !selectedSize) {
      setSelectedSize(sizes[0]);
    }
  }, [sizes, selectedSize]);

  useEffect(() => {
    setQuantity(1);
  }, [productData?.id]);

  const handleAddToCart = async () => {
    try {
      await addToCart({
        productId: product.id,
        quantity,
        selectedColor: selectedColor || undefined,
        selectedSize: selectedSize || undefined,
      });
      
      setAddedToCart(true);
      toast({
        title: "Added to Cart",
        description: `${quantity} x ${product.name} added to your cart`,
      });
      
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add to cart",
        variant: "destructive",
      });
    }
  };

  const handleFindSize = () => {
    const h = parseInt(height);
    const w = parseInt(weight);
    if (!h || !w) return;

    let size = "M";
    if (h < 160) {
      size = w < 50 ? "XS" : "S";
    } else if (h < 175) {
      size = w < 65 ? "M" : "L";
    } else {
      size = w < 80 ? "XL" : "XXL";
    }
    setSuggestedSize(size);
  };

  // Get current color images - fallback to Red color if selected color not found
  const currentColorImages = colorImageMap[selectedColor] || colorImageMap.Red || [redSaree1];

  // Reset image selection when color changes
  useEffect(() => {
    setSelectedImage(0);
  }, [selectedColor]);

  const reviews = [
    {
      id: "1",
      user: "Priya S.",
      rating: 5,
      comment: "Excellent quality! My customers loved these sarees.",
      date: "2 weeks ago",
      verified: true,
    },
    {
      id: "2",
      user: "Rajesh K.",
      rating: 4,
      comment: "Good product, timely delivery. Will order again.",
      date: "1 month ago",
      verified: true,
    },
  ];

  return (
    <div className="min-h-screen py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-8 overflow-x-auto">
          <Link href="/" className="hover:text-primary whitespace-nowrap">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary whitespace-nowrap">Products</Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-[150px] sm:max-w-none">{product.name}</span>
        </div>

        <Link href="/products">
          <Button variant="ghost" className="mb-4 sm:mb-6 -ml-2 sm:-ml-4" size="sm" data-testid="button-back">
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            <span className="text-xs sm:text-sm">Back to Products</span>
          </Button>
        </Link>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-8 lg:gap-12 mb-8 sm:mb-16">
          {/* Images - Meesho Style Layout */}
          <div className="flex gap-2 sm:gap-4">
            {/* Thumbnails on Left */}
            <div className="flex flex-col gap-2 sm:gap-3 w-12 sm:w-16 md:w-20 shrink-0">
              {currentColorImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-secondary rounded-lg overflow-hidden transition-all hover-elevate border-2 ${
                    selectedImage === index ? "border-primary" : "border-transparent"
                  }`}
                  data-testid={`button-image-${index}`}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
            
            {/* Main Image */}
            <div className="flex-1">
              <motion.div
                key={selectedColor + selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="aspect-[3/4] bg-secondary rounded-2xl overflow-hidden"
              >
                <img 
                  src={currentColorImages[selectedImage]} 
                  alt={`${product.name} - ${selectedColor}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-3 sm:mb-4">
              <Badge className="mb-2 text-xs">{product.category}</Badge>
              <h1 className="font-serif text-xl sm:text-2xl md:text-4xl font-semibold mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                  <span className="text-sm ml-1">
                    {product.rating} ({product.reviewCount} reviews)
                  </span>
                </div>
              </div>
              <Link 
                href={`/vendors/${product.vendor.id}`}
                className="text-sm text-muted-foreground hover:text-primary" 
                data-testid="link-vendor"
              >
                by {product.vendor.name}
              </Link>
            </div>

            <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-border">
              <div className="flex items-baseline gap-2 sm:gap-3 mb-2">
                <span className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold">
                  ₹{product.price}
                </span>
                <span className="text-sm sm:text-base text-muted-foreground">/piece</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                {product.stock} pieces in stock
              </p>
              {viewerCount > 0 && (
                <div className="flex items-center gap-2 mt-2 text-sm text-orange-600" data-testid="text-viewer-count">
                  <Eye className="w-4 h-4" />
                  <span>{viewerCount} {viewerCount === 1 ? 'person' : 'people'} viewing this product</span>
                </div>
              )}
            </div>

            {/* Product Highlights - Meesho Style */}
            <div className="mb-6 pb-6 border-b border-border">
              <h3 className="text-base font-semibold mb-4">Product Highlights</h3>
              <div className="grid grid-cols-2 gap-4">
                {product.fabric && (
                  <div>
                    <p className="text-xs text-muted-foreground">Fabric</p>
                    <p className="text-sm font-medium">{product.fabric}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm font-medium">{product.category}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Shipping</p>
                  <p className="text-sm font-medium">Free Delivery</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Available Colors</p>
                  <p className="text-sm font-medium">{product.colors.length} colors</p>
                </div>
              </div>
            </div>

            {/* Color Selection - Circular Buttons like Meesho */}
            <div className="mb-4 sm:mb-6">
              <Label className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 block">
                Select Color
              </Label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-2.5 sm:px-4 h-8 sm:h-10 rounded-full border-2 transition-all text-xs sm:text-sm font-medium flex items-center justify-center gap-1 sm:gap-2 ${
                      selectedColor === color
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    }`}
                    data-testid={`button-color-${color}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Height Selection */}
            <div className="mb-4 sm:mb-6">
              <Label className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 block">
                Select Height
              </Label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {["4'8\" - 5'0\"", "5'0\" - 5'4\"", "5'4\" - 5'8\"", "5'8\" - 6'0\"", "6'0\" +"].map((height) => (
                  <button
                    key={height}
                    onClick={() => setSelectedHeight(height)}
                    className={`px-2 sm:px-4 h-8 sm:h-10 rounded-full border-2 transition-all text-xs sm:text-sm font-medium flex items-center justify-center ${
                      selectedHeight === height
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    }`}
                    data-testid={`button-height-${height.replace(/['"]/g, '')}`}
                  >
                    {height}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection - Circular Buttons like Meesho */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <Label className="text-sm sm:text-base font-semibold block">
                  Select Size
                </Label>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-primary h-8 gap-1.5">
                      <Ruler className="w-4 h-4" />
                      Find My Size
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        AI Size Suggestion
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Height (cm)</Label>
                        <Input 
                          type="number" 
                          placeholder="e.g. 165" 
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Weight (kg)</Label>
                        <Input 
                          type="number" 
                          placeholder="e.g. 60" 
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                        />
                      </div>
                      <Button className="w-full" onClick={handleFindSize}>
                        Calculate Size
                      </Button>
                      {suggestedSize && (
                        <div className="mt-4 p-4 bg-primary/10 rounded-xl text-center">
                          <p className="text-sm text-muted-foreground mb-1">Your recommended size is</p>
                          <p className="text-3xl font-bold text-primary">{suggestedSize}</p>
                          <Button 
                            variant="ghost" 
                            className="mt-2 text-primary"
                            onClick={() => {
                              setSelectedSize(suggestedSize);
                              const closeButton = document.querySelector('[data-radix-collection-item]') as HTMLButtonElement;
                              if (closeButton) closeButton.click();
                            }}
                          >
                            Apply this size
                          </Button>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full border-2 transition-all text-xs sm:text-sm font-medium flex items-center justify-center ${
                      selectedSize === size
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    }`}
                    data-testid={`button-size-${size}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <Label className="text-sm uppercase tracking-wider mb-3 block">
                Quantity
              </Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  data-testid="button-decrease-quantity"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 text-center"
                  data-testid="input-quantity"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  data-testid="button-increase-quantity"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Total: ₹{(product.price * quantity).toLocaleString()}
              </p>
            </div>

            {/* Actions - Meesho Style */}
            <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8">
              <Button 
                variant="outline"
                className="flex-1 text-xs sm:text-sm rounded-full border-2 border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/5" 
                size="default"
                onClick={handleAddToCart}
                disabled={isAddingToCart || addedToCart}
                data-testid="button-add-to-cart"
              >
                {isAddingToCart ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 animate-spin" />
                ) : addedToCart ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                ) : (
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                )}
                {isAddingToCart ? "Adding..." : addedToCart ? "Added!" : "Add to Cart"}
              </Button>
              <Button 
                className="flex-1 text-xs sm:text-sm rounded-full bg-[#d4af37] hover:bg-[#b8962d] text-white shadow-lg shadow-[#d4af37]/20" 
                size="default"
                onClick={() => setLocation("/checkout?buyNow=true")}
                disabled={isAddingToCart}
                data-testid="button-buy-now"
              >
                Buy Now
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-6 bg-secondary/50 rounded-xl">
              <div className="text-center">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-primary" />
                <p className="text-[10px] sm:text-xs text-muted-foreground">Great Value</p>
              </div>
              <div className="text-center">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-primary" />
                <p className="text-[10px] sm:text-xs text-muted-foreground">Fast Delivery</p>
              </div>
              <div className="text-center">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-primary" />
                <p className="text-[10px] sm:text-xs text-muted-foreground">Quality Assured</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description" className="mb-16">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="description" data-testid="tab-description">Description</TabsTrigger>
            <TabsTrigger value="shipping" data-testid="tab-shipping">Shipping</TabsTrigger>
            <TabsTrigger value="reviews" data-testid="tab-reviews">Reviews ({product.reviewCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-8">
            <Card>
              <CardContent className="p-8">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {product.description}
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Specifications</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Fabric:</dt>
                        <dd className="font-medium">{product.fabric}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Category:</dt>
                        <dd className="font-medium">{product.category}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Shipping:</dt>
                        <dd className="font-medium">Free Delivery</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Features</h3>
                    <ul className="space-y-2 text-sm">
                      {product.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipping" className="mt-8">
            <Card>
              <CardContent className="p-8">
                <h3 className="font-semibold mb-6">Shipping Information</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Truck className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-medium mb-1">Free Standard Delivery</h4>
                      <p className="text-muted-foreground text-sm">Delivered within 5-7 business days across India</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Package className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-medium mb-1">Express Shipping Available</h4>
                      <p className="text-muted-foreground text-sm">Get your order in 2-3 business days (additional charges apply)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Shield className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-medium mb-1">Secure Packaging</h4>
                      <p className="text-muted-foreground text-sm">All items are carefully packed to ensure safe delivery</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-8">
            <div className="space-y-6">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{review.user}</span>
                          {review.verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating
                                  ? "fill-primary text-primary"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Vendor Info */}
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-2">About the Vendor</h3>
                <p className="text-muted-foreground mb-4">{product.vendor.name}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span>{product.vendor.rating} Rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span>{product.vendor.totalSales}+ Sales</span>
                  </div>
                </div>
              </div>
              <Link href={`/vendors/${product.vendor.id}`}>
                <Button variant="outline" data-testid="button-visit-store">
                  Visit Store
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Similar Products Section */}
        {similarProducts && similarProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-serif font-bold">Similar Products You'll Love</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {similarProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p as any} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
