import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  IndianRupee,
  ShoppingBag,
  Plus,
  Edit,
  Trash2,
  Upload,
  Star,
  AlertCircle,
  Receipt,
} from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import VendorReceipts from "@/components/VendorReceipts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Order, Product, Vendor, Coupon } from "@shared/schema";
import { useAuth, getAuthToken } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

const salesData = [
  { month: "Jan", sales: 45000 },
  { month: "Feb", sales: 52000 },
  { month: "Mar", sales: 48000 },
  { month: "Apr", sales: 61000 },
  { month: "May", sales: 55000 },
  { month: "Jun", sales: 67000 },
];

export default function VendorDashboard() {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isKycDialogOpen, setIsKycDialogOpen] = useState(false);
  const [kycUploading, setKycUploading] = useState(false);
  const [kycFiles, setKycFiles] = useState<File[]>([]);
  const [businessAddress, setBusinessAddress] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [, setLocation] = useLocation();
  const { user, profile, isLoading: authLoading, refreshProfile } = useAuth();
  const { toast } = useToast();
  
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productMoq, setProductMoq] = useState("1");
  const [productDescription, setProductDescription] = useState("");
  const [productImages, setProductImages] = useState<File[]>([]);
  const [productSaving, setProductSaving] = useState(false);
  const productImageInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editProductName, setEditProductName] = useState("");
  const [editProductPrice, setEditProductPrice] = useState("");
  const [editProductMoq, setEditProductMoq] = useState("");
  const [editProductStock, setEditProductStock] = useState("");
  const [editProductDescription, setEditProductDescription] = useState("");
  const [editProductSaving, setEditProductSaving] = useState(false);
  
  const [deleteProductOpen, setDeleteProductOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteProductLoading, setDeleteProductLoading] = useState(false);
  
  const [productCouponId, setProductCouponId] = useState<string>("none");
  const [editProductCouponId, setEditProductCouponId] = useState<string>("none");
  
  const [applyCoupon, setApplyCoupon] = useState(false);
  const [couponMode, setCouponMode] = useState<"select" | "create">("select");
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponName, setNewCouponName] = useState("");
  const [newCouponDiscountType, setNewCouponDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [newCouponDiscountValue, setNewCouponDiscountValue] = useState("");
  const [newCouponMinOrder, setNewCouponMinOrder] = useState("");
  const [creatingCoupon, setCreatingCoupon] = useState(false);
  
  const [editApplyCoupon, setEditApplyCoupon] = useState(false);
  const [editCouponMode, setEditCouponMode] = useState<"select" | "create">("select");
  const [editNewCouponCode, setEditNewCouponCode] = useState("");
  const [editNewCouponName, setEditNewCouponName] = useState("");
  const [editNewCouponDiscountType, setEditNewCouponDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [editNewCouponDiscountValue, setEditNewCouponDiscountValue] = useState("");
  const [editNewCouponMinOrder, setEditNewCouponMinOrder] = useState("");
  const [editCreatingCoupon, setEditCreatingCoupon] = useState(false);
  
  const vendorProfile = profile as Vendor | null;
  const vendorId = vendorProfile?.id;

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalProducts: number;
    activeOrders: number;
    totalRevenue: number;
    avgRating: number;
  }>({
    queryKey: ["/api/dashboard/vendor", vendorId],
    enabled: !!vendorId,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/vendor/my-products"],
    enabled: !!vendorId,
    queryFn: async () => {
      const token = getAuthToken();
      const response = await fetch("/api/vendor/my-products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: [`/api/orders/vendor/${vendorId}`],
    enabled: !!vendorId,
  });

  const { data: activeCoupons = [] } = useQuery<Coupon[]>({
    queryKey: ["/api/coupons/active"],
  });

  const kycStatus = vendorProfile?.kycStatus || "pending";

  // GST number validation - memoized to prevent recalculation on every render
  // MUST be called before any conditional returns to follow React hooks rules
  const gstValidationResult = useMemo(() => {
    if (!gstNumber || gstNumber.length === 0) {
      return { valid: false, message: "Incorrect - GST number is required" };
    }
    
    const gst = gstNumber.trim().toUpperCase();
    
    if (gst.length !== 15) {
      return { valid: false, message: "Incorrect - GST number must be exactly 15 characters" };
    }
    
    const gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    
    if (!gstPattern.test(gst)) {
      return { valid: false, message: "Incorrect - Invalid GST number format" };
    }
    
    const stateCode = parseInt(gst.substring(0, 2), 10);
    if (stateCode < 1 || stateCode > 37) {
      return { valid: false, message: "Incorrect - Invalid state code in GST number" };
    }
    
    const panPart = gst.substring(2, 12);
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panPattern.test(panPart)) {
      return { valid: false, message: "Incorrect - Invalid PAN in GST number" };
    }
    
    const entityTypes = ['C', 'P', 'H', 'F', 'A', 'T', 'B', 'L', 'J', 'G'];
    if (!entityTypes.includes(panPart[3])) {
      return { valid: false, message: "Incorrect - Invalid entity type in GST number" };
    }
    
    return { valid: true, message: "Valid GST number" };
  }, [gstNumber]);

  // Business address validation - memoized
  // MUST be called before any conditional returns to follow React hooks rules
  const addressValidationResult = useMemo(() => {
    if (!businessAddress || businessAddress.trim().length === 0) {
      return { valid: false, message: "Incorrect - Business address is required" };
    }
    if (businessAddress.trim().length < 10) {
      return { valid: false, message: "Incorrect - Business address must be at least 10 characters" };
    }
    return { valid: true, message: "Valid" };
  }, [businessAddress]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "vendor")) {
      // Double-check localStorage in case of race condition with login
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.role === "vendor") {
            // User is a vendor in localStorage, wait for context to update
            return;
          }
        } catch (e) {
          // Invalid JSON, proceed with redirect
        }
      }
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "vendor") {
    // Also check localStorage as fallback for race condition
    const storedUser = localStorage.getItem("user");
    let isVendorInStorage = false;
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        isVendorInStorage = parsedUser.role === "vendor";
      } catch (e) {
        // Invalid JSON
      }
    }
    
    if (!isVendorInStorage) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Redirecting...</p>
          </div>
        </div>
      );
    }
  }

  if (!vendorProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading vendor profile...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "bg-green-100 text-green-700",
      "out of stock": "bg-red-100 text-red-700",
      pending: "bg-yellow-100 text-yellow-700",
      shipped: "bg-blue-100 text-blue-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      delivered: "bg-green-100 text-green-700",
      processing: "bg-yellow-100 text-yellow-700",
      confirmed: "bg-blue-100 text-blue-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return <Badge className={variants[status] || ""}>{status}</Badge>;
  };

  const statsCards = [
    { 
      label: "Total Products", 
      value: statsLoading ? "..." : stats?.totalProducts?.toString() || "0", 
      icon: Package 
    },
    { 
      label: "Active Orders", 
      value: statsLoading ? "..." : stats?.activeOrders?.toString() || "0", 
      icon: ShoppingBag 
    },
    { 
      label: "Total Revenue", 
      value: statsLoading ? "..." : `₹${stats?.totalRevenue?.toLocaleString() || "0"}`, 
      icon: IndianRupee 
    },
    { 
      label: "Avg Rating", 
      value: statsLoading ? "..." : stats?.avgRating?.toFixed(1) || "0.0", 
      icon: Star 
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const validFiles: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (validTypes.includes(file.type) && file.size <= 5 * 1024 * 1024) {
          validFiles.push(file);
        } else {
          toast({
            title: "Invalid file",
            description: `${file.name} is not a valid file type or exceeds 5MB`,
            variant: "destructive",
          });
        }
      }
      setKycFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setKycFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const validFiles: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (validTypes.includes(file.type) && file.size <= 5 * 1024 * 1024) {
          validFiles.push(file);
        } else {
          toast({
            title: "Invalid file",
            description: `${file.name} is not a valid image type or exceeds 5MB`,
            variant: "destructive",
          });
        }
      }
      setProductImages(prev => [...prev, ...validFiles]);
    }
  };

  const removeProductImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const resetProductForm = () => {
    setProductName("");
    setProductPrice("");
    setProductMoq("1");
    setProductDescription("");
    setProductImages([]);
    setProductCouponId("none");
    setApplyCoupon(false);
    setCouponMode("select");
    setNewCouponCode("");
    setNewCouponName("");
    setNewCouponDiscountType("percentage");
    setNewCouponDiscountValue("");
    setNewCouponMinOrder("");
  };

  const handleProductSubmit = async () => {
    if (!productName.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive",
      });
      return;
    }

    if (!productPrice || Number(productPrice) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    if (!productDescription.trim()) {
      toast({
        title: "Validation Error",
        description: "Product description is required",
        variant: "destructive",
      });
      return;
    }

    if (productImages.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please upload at least one product image",
        variant: "destructive",
      });
      return;
    }

    const authToken = getAuthToken();
    if (!authToken) {
      toast({
        title: "Authentication required",
        description: "Please log in again to add products",
        variant: "destructive",
      });
      return;
    }

    setProductSaving(true);
    try {
      let couponIdToUse: string | null = null;
      
      if (applyCoupon && couponMode === "select" && productCouponId !== "none") {
        couponIdToUse = productCouponId;
      } else if (applyCoupon && couponMode === "create") {
        if (!newCouponCode.trim() || !newCouponName.trim() || !newCouponDiscountValue) {
          toast({
            title: "Validation Error",
            description: "Please fill in coupon code, name, and discount value",
            variant: "destructive",
          });
          setProductSaving(false);
          return;
        }
        
        setCreatingCoupon(true);
        const couponResponse = await fetch('/api/vendor/coupons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            code: newCouponCode.trim().toUpperCase(),
            name: newCouponName.trim(),
            discountType: newCouponDiscountType,
            discountValue: parseFloat(newCouponDiscountValue),
            minOrderValue: newCouponMinOrder ? parseFloat(newCouponMinOrder) : null,
          }),
        });
        
        if (!couponResponse.ok) {
          const errorData = await couponResponse.json();
          throw new Error(errorData.message || 'Failed to create coupon');
        }
        
        const createdCoupon = await couponResponse.json();
        couponIdToUse = createdCoupon.id;
        setCreatingCoupon(false);
        queryClient.invalidateQueries({ queryKey: ['/api/coupons/active'] });
      }
      
      const formData = new FormData();
      formData.append('vendorId', vendorId || '');
      formData.append('name', productName.trim());
      formData.append('description', productDescription.trim());
      formData.append('price', productPrice);
      formData.append('moq', productMoq || '1');
      formData.append('stock', '100');
      if (couponIdToUse) {
        formData.append('couponId', couponIdToUse);
      }
      
      productImages.forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create product');
      }

      toast({
        title: "Product Added",
        description: applyCoupon && couponMode === "create" 
          ? "Your product and coupon have been added successfully!" 
          : "Your product has been added successfully and is pending approval.",
      });

      resetProductForm();
      setIsAddProductOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/vendor/my-products'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      });
    } finally {
      setProductSaving(false);
      setCreatingCoupon(false);
    }
  };

  const handleKycSubmit = async () => {
    // Validate GST number first using memoized result
    if (!gstValidationResult.valid) {
      toast({
        title: "Incorrect",
        description: gstValidationResult.message,
        variant: "destructive",
      });
      return;
    }

    // Validate business address using memoized result
    if (!addressValidationResult.valid) {
      toast({
        title: "Incorrect",
        description: addressValidationResult.message,
        variant: "destructive",
      });
      return;
    }

    // Validate documents
    if (kycFiles.length === 0) {
      toast({
        title: "Incorrect",
        description: "Incorrect - Please upload at least one KYC document",
        variant: "destructive",
      });
      return;
    }

    const authToken = getAuthToken();
    if (!authToken) {
      toast({
        title: "Authentication required",
        description: "Please log in again to submit KYC documents",
        variant: "destructive",
      });
      return;
    }

    setKycUploading(true);
    try {
      const formData = new FormData();
      kycFiles.forEach((file) => {
        formData.append('documents', file);
      });
      formData.append('businessAddress', businessAddress);
      formData.append('gstNumber', gstNumber);

      const response = await fetch('/api/vendors/kyc/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit KYC documents');
      }

      const data = await response.json();
      
      if (user && data.vendor) {
        refreshProfile(user, data.vendor);
      }

      toast({
        title: "KYC Submitted",
        description: "Your KYC documents have been submitted for verification. You will be notified once approved.",
      });

      setIsKycDialogOpen(false);
      setKycFiles([]);
      setBusinessAddress("");
      setGstNumber("");
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit KYC documents",
        variant: "destructive",
      });
    } finally {
      setKycUploading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditProductName(product.name);
    setEditProductPrice(String(product.price));
    setEditProductMoq(String(product.moq));
    setEditProductStock(String(product.stock));
    setEditProductDescription(product.description);
    setEditProductCouponId(product.couponId || "none");
    setEditApplyCoupon(!!product.couponId);
    setEditCouponMode("select");
    setEditNewCouponCode("");
    setEditNewCouponName("");
    setEditNewCouponDiscountType("percentage");
    setEditNewCouponDiscountValue("");
    setEditNewCouponMinOrder("");
    setIsEditProductOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    if (!editProductName.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive",
      });
      return;
    }

    if (!editProductPrice || Number(editProductPrice) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    const authToken = getAuthToken();
    if (!authToken) {
      toast({
        title: "Authentication required",
        description: "Please log in again to edit products",
        variant: "destructive",
      });
      return;
    }

    setEditProductSaving(true);
    try {
      let couponIdToUse = "";
      
      if (editApplyCoupon && editCouponMode === "select" && editProductCouponId !== "none") {
        couponIdToUse = editProductCouponId;
      } else if (editApplyCoupon && editCouponMode === "create") {
        if (!editNewCouponCode.trim() || !editNewCouponName.trim() || !editNewCouponDiscountValue) {
          toast({
            title: "Validation Error",
            description: "Please fill in coupon code, name, and discount value",
            variant: "destructive",
          });
          setEditProductSaving(false);
          return;
        }
        
        setEditCreatingCoupon(true);
        const couponResponse = await fetch('/api/vendor/coupons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            code: editNewCouponCode.trim().toUpperCase(),
            name: editNewCouponName.trim(),
            discountType: editNewCouponDiscountType,
            discountValue: parseFloat(editNewCouponDiscountValue),
            minOrderValue: editNewCouponMinOrder ? parseFloat(editNewCouponMinOrder) : null,
          }),
        });
        
        if (!couponResponse.ok) {
          const errorData = await couponResponse.json();
          throw new Error(errorData.message || 'Failed to create coupon');
        }
        
        const createdCoupon = await couponResponse.json();
        couponIdToUse = createdCoupon.id;
        setEditCreatingCoupon(false);
        queryClient.invalidateQueries({ queryKey: ['/api/coupons/active'] });
      }
      
      const formData = new FormData();
      formData.append('name', editProductName.trim());
      formData.append('description', editProductDescription.trim());
      formData.append('price', editProductPrice);
      formData.append('moq', editProductMoq || '1');
      formData.append('stock', editProductStock || '0');
      formData.append('couponId', couponIdToUse);

      const response = await fetch(`/api/vendor/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product');
      }

      toast({
        title: "Product Updated",
        description: editApplyCoupon && editCouponMode === "create"
          ? "Your product and coupon have been updated successfully!"
          : "Your product has been updated successfully.",
      });

      setIsEditProductOpen(false);
      setEditingProduct(null);
      queryClient.invalidateQueries({ queryKey: ['/api/vendor/my-products'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setEditProductSaving(false);
      setEditCreatingCoupon(false);
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setDeleteProductOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    const authToken = getAuthToken();
    if (!authToken) {
      toast({
        title: "Authentication required",
        description: "Please log in again to delete products",
        variant: "destructive",
      });
      return;
    }

    setDeleteProductLoading(true);
    try {
      const response = await fetch(`/api/vendor/products/${productToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete product');
      }

      toast({
        title: "Product Deleted",
        description: "Your product has been deleted successfully.",
      });

      setDeleteProductOpen(false);
      setProductToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['/api/vendor/my-products'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setDeleteProductLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">Vendor Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your products, orders, and business analytics
          </p>
        </div>

        {/* KYC Alert */}
        {kycStatus === "pending" && (
          <Alert className="mb-6 border-primary/50 bg-primary/5">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="flex items-center gap-2 flex-wrap">
              Your KYC verification is pending. Please upload required documents to start selling.
              <Button 
                variant="ghost" 
                className="p-0 h-auto text-primary underline" 
                onClick={() => setIsKycDialogOpen(true)}
                data-testid="button-complete-kyc"
              >
                Complete KYC
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {kycStatus === "submitted" && (
          <Alert className="mb-6 border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700 dark:text-blue-400">
              Your KYC documents have been submitted and are under review. You can start adding products while we verify your documents.
            </AlertDescription>
          </Alert>
        )}

        {kycStatus === "rejected" && (
          <Alert className="mb-6 border-destructive/50 bg-destructive/5">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="flex items-center gap-2 flex-wrap">
              Your KYC verification was rejected. Please resubmit your documents.
              <Button 
                variant="ghost" 
                className="p-0 h-auto text-destructive underline" 
                onClick={() => setIsKycDialogOpen(true)}
                data-testid="button-resubmit-kyc"
              >
                Resubmit KYC
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {kycStatus === "approved" && (
          <Alert className="mb-6 border-green-500/50 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Your KYC verification is complete. You can now start selling products.
            </AlertDescription>
          </Alert>
        )}

        {/* KYC Dialog */}
        <Dialog open={isKycDialogOpen} onOpenChange={setIsKycDialogOpen}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Complete KYC Verification</DialogTitle>
              <DialogDescription>
                Please upload your business documents to verify your account. This is required to start selling on LuxeFashion.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="businessAddress">Business Address <span className="text-destructive">*</span></Label>
                <Textarea
                  id="businessAddress"
                  placeholder="Enter your complete business address (minimum 10 characters)"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  className={businessAddress && !addressValidationResult.valid ? "border-destructive" : ""}
                  data-testid="input-business-address"
                />
                {businessAddress && !addressValidationResult.valid && (
                  <p className="text-sm text-destructive">{addressValidationResult.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstNumber">GST Number <span className="text-destructive">*</span></Label>
                <Input
                  id="gstNumber"
                  placeholder="e.g., 22AAAAA0000A1Z5"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                  maxLength={15}
                  className={gstNumber && !gstValidationResult.valid ? "border-destructive" : gstNumber && gstValidationResult.valid ? "border-green-500" : ""}
                  data-testid="input-gst-number"
                />
                {gstNumber && !gstValidationResult.valid && (
                  <p className="text-sm text-destructive">{gstValidationResult.message}</p>
                )}
                {gstNumber && gstValidationResult.valid && (
                  <p className="text-sm text-green-600">Valid GST number format</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Format: 2 digits state code + 10 char PAN + entity number + Z + check digit
                </p>
              </div>

              <div className="space-y-2">
                <Label>Upload Documents <span className="text-destructive">*</span></Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Upload valid business documents such as PAN Card, Business Registration Certificate, GST Certificate, or Address Proof. (Required)
                </p>
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center hover-elevate transition-all cursor-pointer"
                  onClick={() => document.getElementById('kyc-file-input')?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload documents (JPG, PNG, PDF - max 5MB each)
                  </p>
                  <input
                    id="kyc-file-input"
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    onChange={handleFileChange}
                    data-testid="input-kyc-files"
                  />
                </div>
              </div>

              {kycFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Documents ({kycFiles.length})</Label>
                  <div className="space-y-2">
                    {kycFiles.map((file, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                          data-testid={`button-remove-file-${index}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsKycDialogOpen(false);
                    setKycFiles([]);
                    setBusinessAddress("");
                    setGstNumber("");
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleKycSubmit}
                  disabled={
                    kycUploading || 
                    kycFiles.length === 0 || 
                    !gstValidationResult.valid || 
                    !addressValidationResult.valid
                  }
                  data-testid="button-submit-kyc"
                >
                  {kycUploading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    "Submit for Verification"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="text-3xl font-serif font-semibold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Analytics Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Sales Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products" data-testid="tab-products">Products</TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
            <TabsTrigger value="receipts" data-testid="tab-receipts">Receipts</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
                <CardTitle>Product Inventory</CardTitle>
                <div className="flex items-center gap-3">
                  {(kycStatus === "pending" || kycStatus === "rejected") && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                      <AlertCircle className="w-4 h-4" />
                      <span>Complete KYC to add products</span>
                    </div>
                  )}
                  <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        data-testid="button-add-product"
                        disabled={kycStatus !== "approved" && kycStatus !== "submitted"}
                        title={(kycStatus === "pending" || kycStatus === "rejected") ? "Complete KYC verification to add products" : "Add a new product"}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                      <DialogDescription>
                        Fill in the details to add a new product to your inventory
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="productName">Product Name</Label>
                        <Input 
                          id="productName" 
                          placeholder="e.g., Designer Silk Saree" 
                          data-testid="input-product-name"
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="price">Price (₹)</Label>
                          <Input 
                            id="price" 
                            type="number" 
                            placeholder="2500" 
                            data-testid="input-price"
                            value={productPrice}
                            onChange={(e) => setProductPrice(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="moq">MOQ</Label>
                          <Input 
                            id="moq" 
                            type="number" 
                            placeholder="10" 
                            data-testid="input-moq"
                            value={productMoq}
                            onChange={(e) => setProductMoq(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                          id="description" 
                          placeholder="Product description..." 
                          data-testid="input-description"
                          value={productDescription}
                          onChange={(e) => setProductDescription(e.target.value)}
                        />
                      </div>
                      <div className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Ticket className="w-5 h-5 text-primary" />
                            <div>
                              <Label className="text-base font-medium">Apply Coupon</Label>
                              <p className="text-xs text-muted-foreground">Offer a discount on this product</p>
                            </div>
                          </div>
                          <Switch
                            checked={applyCoupon}
                            onCheckedChange={(checked) => {
                              setApplyCoupon(checked);
                              if (!checked) {
                                setProductCouponId("none");
                                setCouponMode("select");
                              }
                            }}
                            data-testid="switch-apply-coupon"
                          />
                        </div>
                        
                        {applyCoupon && (
                          <div className="space-y-4 pt-2">
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant={couponMode === "select" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCouponMode("select")}
                                data-testid="button-coupon-select-mode"
                              >
                                Select Existing
                              </Button>
                              <Button
                                type="button"
                                variant={couponMode === "create" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCouponMode("create")}
                                data-testid="button-coupon-create-mode"
                              >
                                Create New
                              </Button>
                            </div>
                            
                            {couponMode === "select" ? (
                              <div>
                                <Select value={productCouponId} onValueChange={setProductCouponId}>
                                  <SelectTrigger data-testid="select-product-coupon">
                                    <SelectValue placeholder="Select a coupon" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">No coupon selected</SelectItem>
                                    {activeCoupons.map((coupon) => (
                                      <SelectItem key={coupon.id} value={coupon.id}>
                                        {coupon.code} - {coupon.discountType === "percentage" ? `${coupon.discountValue}% off` : `₹${coupon.discountValue} off`}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {activeCoupons.length === 0 && (
                                  <p className="text-xs text-muted-foreground mt-2">
                                    No coupons available. Create a new one instead.
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-3 bg-muted/30 p-3 rounded-lg">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label htmlFor="newCouponCode" className="text-sm">Coupon Code *</Label>
                                    <Input
                                      id="newCouponCode"
                                      placeholder="e.g., SAVE20"
                                      value={newCouponCode}
                                      onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                                      data-testid="input-new-coupon-code"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="newCouponName" className="text-sm">Coupon Name *</Label>
                                    <Input
                                      id="newCouponName"
                                      placeholder="e.g., Summer Sale"
                                      value={newCouponName}
                                      onChange={(e) => setNewCouponName(e.target.value)}
                                      data-testid="input-new-coupon-name"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label htmlFor="newCouponDiscountType" className="text-sm">Discount Type</Label>
                                    <Select value={newCouponDiscountType} onValueChange={(v: "percentage" | "fixed") => setNewCouponDiscountType(v)}>
                                      <SelectTrigger data-testid="select-new-coupon-type">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                                        <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="newCouponDiscountValue" className="text-sm">Discount Value *</Label>
                                    <Input
                                      id="newCouponDiscountValue"
                                      type="number"
                                      placeholder={newCouponDiscountType === "percentage" ? "e.g., 20" : "e.g., 500"}
                                      value={newCouponDiscountValue}
                                      onChange={(e) => setNewCouponDiscountValue(e.target.value)}
                                      data-testid="input-new-coupon-value"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor="newCouponMinOrder" className="text-sm">Min Order Value (Optional)</Label>
                                  <Input
                                    id="newCouponMinOrder"
                                    type="number"
                                    placeholder="e.g., 1000"
                                    value={newCouponMinOrder}
                                    onChange={(e) => setNewCouponMinOrder(e.target.value)}
                                    data-testid="input-new-coupon-min"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        <Label>Product Images *</Label>
                        <div 
                          className="border-2 border-dashed border-border rounded-lg p-8 text-center hover-elevate transition-all cursor-pointer"
                          onClick={() => productImageInputRef.current?.click()}
                        >
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload or drag and drop images (JPG, PNG - max 5MB each)
                          </p>
                          <input
                            ref={productImageInputRef}
                            type="file"
                            multiple
                            accept=".jpg,.jpeg,.png"
                            className="hidden"
                            onChange={handleProductImageChange}
                            data-testid="input-product-images"
                          />
                        </div>
                        {productImages.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm font-medium">Selected Images ({productImages.length})</p>
                            <div className="flex flex-wrap gap-2">
                              {productImages.map((file, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Preview ${index + 1}`}
                                    className="w-20 h-20 object-cover rounded-md border"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeProductImage(index)}
                                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            resetProductForm();
                            setIsAddProductOpen(false);
                          }}
                          disabled={productSaving}
                        >
                          Cancel
                        </Button>
                        <Button 
                          data-testid="button-save-product"
                          onClick={handleProductSubmit}
                          disabled={productSaving}
                        >
                          {productSaving ? "Saving..." : "Save Product"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="py-8 text-center text-muted-foreground">Loading products...</div>
                ) : products.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No products yet. Add your first product to start selling!
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium" data-testid={`text-product-${product.id}`}>{product.name}</TableCell>
                          <TableCell>₹{Number(product.price).toLocaleString()}</TableCell>
                          <TableCell>{product.stock} pcs</TableCell>
                          <TableCell>
                            <Badge className={product.isActive && product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                              {product.isActive && product.stock > 0 ? "Active" : "Out of Stock"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                data-testid={`button-edit-${product.id}`}
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                data-testid={`button-delete-${product.id}`}
                                onClick={() => handleDeleteProduct(product)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Edit Product Dialog */}
          <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogDescription>
                  Update your product details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="editProductName">Product Name</Label>
                  <Input 
                    id="editProductName" 
                    placeholder="e.g., Designer Silk Saree" 
                    data-testid="input-edit-product-name"
                    value={editProductName}
                    onChange={(e) => setEditProductName(e.target.value)}
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="editPrice">Price (₹)</Label>
                    <Input 
                      id="editPrice" 
                      type="number" 
                      placeholder="2500" 
                      data-testid="input-edit-price"
                      value={editProductPrice}
                      onChange={(e) => setEditProductPrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editMoq">MOQ</Label>
                    <Input 
                      id="editMoq" 
                      type="number" 
                      placeholder="10" 
                      data-testid="input-edit-moq"
                      value={editProductMoq}
                      onChange={(e) => setEditProductMoq(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editStock">Stock</Label>
                    <Input 
                      id="editStock" 
                      type="number" 
                      placeholder="100" 
                      data-testid="input-edit-stock"
                      value={editProductStock}
                      onChange={(e) => setEditProductStock(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="editDescription">Description</Label>
                  <Textarea 
                    id="editDescription" 
                    placeholder="Product description..." 
                    data-testid="input-edit-description"
                    value={editProductDescription}
                    onChange={(e) => setEditProductDescription(e.target.value)}
                  />
                </div>
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-5 h-5 text-primary" />
                      <div>
                        <Label className="text-base font-medium">Apply Coupon</Label>
                        <p className="text-xs text-muted-foreground">Offer a discount on this product</p>
                      </div>
                    </div>
                    <Switch
                      checked={editApplyCoupon}
                      onCheckedChange={(checked) => {
                        setEditApplyCoupon(checked);
                        if (!checked) {
                          setEditProductCouponId("none");
                          setEditCouponMode("select");
                        }
                      }}
                      data-testid="switch-edit-apply-coupon"
                    />
                  </div>
                  
                  {editApplyCoupon && (
                    <div className="space-y-4 pt-2">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={editCouponMode === "select" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setEditCouponMode("select")}
                          data-testid="button-edit-coupon-select-mode"
                        >
                          Select Existing
                        </Button>
                        <Button
                          type="button"
                          variant={editCouponMode === "create" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setEditCouponMode("create")}
                          data-testid="button-edit-coupon-create-mode"
                        >
                          Create New
                        </Button>
                      </div>
                      
                      {editCouponMode === "select" ? (
                        <div>
                          <Select value={editProductCouponId} onValueChange={setEditProductCouponId}>
                            <SelectTrigger data-testid="select-edit-product-coupon">
                              <SelectValue placeholder="Select a coupon" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No coupon selected</SelectItem>
                              {activeCoupons.map((coupon) => (
                                <SelectItem key={coupon.id} value={coupon.id}>
                                  {coupon.code} - {coupon.discountType === "percentage" ? `${coupon.discountValue}% off` : `₹${coupon.discountValue} off`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {activeCoupons.length === 0 && (
                            <p className="text-xs text-muted-foreground mt-2">
                              No coupons available. Create a new one instead.
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3 bg-muted/30 p-3 rounded-lg">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="editNewCouponCode" className="text-sm">Coupon Code *</Label>
                              <Input
                                id="editNewCouponCode"
                                placeholder="e.g., SAVE20"
                                value={editNewCouponCode}
                                onChange={(e) => setEditNewCouponCode(e.target.value.toUpperCase())}
                                data-testid="input-edit-new-coupon-code"
                              />
                            </div>
                            <div>
                              <Label htmlFor="editNewCouponName" className="text-sm">Coupon Name *</Label>
                              <Input
                                id="editNewCouponName"
                                placeholder="e.g., Summer Sale"
                                value={editNewCouponName}
                                onChange={(e) => setEditNewCouponName(e.target.value)}
                                data-testid="input-edit-new-coupon-name"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="editNewCouponDiscountType" className="text-sm">Discount Type</Label>
                              <Select value={editNewCouponDiscountType} onValueChange={(v: "percentage" | "fixed") => setEditNewCouponDiscountType(v)}>
                                <SelectTrigger data-testid="select-edit-new-coupon-type">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                                  <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="editNewCouponDiscountValue" className="text-sm">Discount Value *</Label>
                              <Input
                                id="editNewCouponDiscountValue"
                                type="number"
                                placeholder={editNewCouponDiscountType === "percentage" ? "e.g., 20" : "e.g., 500"}
                                value={editNewCouponDiscountValue}
                                onChange={(e) => setEditNewCouponDiscountValue(e.target.value)}
                                data-testid="input-edit-new-coupon-value"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="editNewCouponMinOrder" className="text-sm">Min Order Value (Optional)</Label>
                            <Input
                              id="editNewCouponMinOrder"
                              type="number"
                              placeholder="e.g., 1000"
                              value={editNewCouponMinOrder}
                              onChange={(e) => setEditNewCouponMinOrder(e.target.value)}
                              data-testid="input-edit-new-coupon-min"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditProductOpen(false);
                      setEditingProduct(null);
                    }}
                    disabled={editProductSaving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    data-testid="button-update-product"
                    onClick={handleUpdateProduct}
                    disabled={editProductSaving}
                  >
                    {editProductSaving ? "Updating..." : "Update Product"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Product Confirmation */}
          <AlertDialog open={deleteProductOpen} onOpenChange={setDeleteProductOpen}>
            <AlertDialogContent data-testid="dialog-delete-product">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{productToDelete?.name}"? 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel 
                  disabled={deleteProductLoading}
                  data-testid="button-cancel-delete"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDeleteProduct}
                  disabled={deleteProductLoading}
                  className="bg-destructive hover:bg-destructive/90"
                  data-testid="button-confirm-delete"
                >
                  {deleteProductLoading ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="py-8 text-center text-muted-foreground">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No orders yet. Once customers place orders, they will appear here.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order Number</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium" data-testid={`text-order-${order.id}`}>{order.orderNumber}</TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>₹{Number(order.totalAmount).toLocaleString()}</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>
                            <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                              {order.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" data-testid={`button-process-${order.id}`}>
                              Process
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg">
                      <span className="font-medium">Total Revenue</span>
                      <span className="text-2xl font-serif font-semibold">₹4,25,000</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg">
                      <span className="font-medium">Pending Settlements</span>
                      <span className="text-2xl font-serif font-semibold">₹45,000</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg">
                      <span className="font-medium">Settled Amount</span>
                      <span className="text-2xl font-serif font-semibold text-green-600">₹3,80,000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="receipts">
            <VendorReceipts />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
