import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Ticket,
  Switch,
  X,
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
import { queryClient } from "@/lib/queryClient";

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
    return { valid: true, message: "Valid GST number" };
  }, [gstNumber]);

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
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  const handleKycSubmit = async () => {
    if (!gstValidationResult.valid || !addressValidationResult.valid || kycFiles.length === 0) {
      toast({ title: "Incorrect", description: "Please check all fields", variant: "destructive" });
      return;
    }
    const authToken = getAuthToken();
    setKycUploading(true);
    try {
      const formData = new FormData();
      kycFiles.forEach(file => formData.append('documents', file));
      formData.append('businessAddress', businessAddress);
      formData.append('gstNumber', gstNumber);
      const response = await fetch('/api/vendors/kyc/submit', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to submit KYC');
      const data = await response.json();
      if (user && data.vendor) refreshProfile(user, data.vendor);
      toast({ title: "KYC Submitted", description: "Pending verification" });
      setIsKycDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setKycUploading(false);
    }
  };

  const handleProductSubmit = async () => {
    setProductSaving(true);
    try {
      const authToken = getAuthToken();
      const formData = new FormData();
      formData.append('vendorId', vendorId || '');
      formData.append('name', productName);
      formData.append('description', productDescription);
      formData.append('price', productPrice);
      formData.append('moq', productMoq);
      productImages.forEach(file => formData.append('images', file));
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to add product');
      toast({ title: "Product Added" });
      setIsAddProductOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/vendor/my-products'] });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProductSaving(false);
    }
  };

  if (authLoading || !user || !vendorProfile) return <div>Loading...</div>;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-6">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-serif font-bold">Vendor Dashboard</h1>
            <p className="text-muted-foreground">Manage your Queen4Feet store</p>
          </div>
          {kycStatus !== "approved" && (
            <Button onClick={() => setIsKycDialogOpen(true)}>Complete KYC</Button>
          )}
        </div>

        <Dialog open={isKycDialogOpen} onOpenChange={setIsKycDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete KYC Verification</DialogTitle>
              <DialogDescription>
                Please upload your business documents to verify your account. This is required to start selling on Queen4Feet.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>GST Number</Label>
                <Input value={gstNumber} onChange={e => setGstNumber(e.target.value)} />
              </div>
              <div>
                <Label>Business Address</Label>
                <Textarea value={businessAddress} onChange={e => setBusinessAddress(e.target.value)} />
              </div>
              <Button onClick={handleKycSubmit} disabled={kycUploading}>Submit</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Welcome to Queen4Feet Vendor Suite</CardTitle>
            <CardDescription>Track your sales, manage inventory, and grow your brand.</CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeOrders || 0}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats?.totalRevenue?.toLocaleString() || 0}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.avgRating || 0}</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="receipts">Receipts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Product Inventory</CardTitle>
                <Button onClick={() => setIsAddProductOpen(true)} disabled={kycStatus !== "approved"}>
                  <Plus className="w-4 h-4 mr-2" /> Add Product
                </Button>
              </CardHeader>
              <CardContent>
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
                    {productsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                      </TableRow>
                    ) : products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">No products yet</TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>₹{parseFloat(product.price).toLocaleString()}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>
                            <Badge variant={product.isActive ? "default" : "secondary"}>
                              {product.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>Track and manage your orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                      </TableRow>
                    ) : orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">No orders yet</TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.orderNumber}</TableCell>
                          <TableCell>{order.userId}</TableCell>
                          <TableCell>₹{parseFloat(order.totalAmount).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge>{order.status}</Badge>
                          </TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="receipts">
            <VendorReceipts />
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Sales Analytics</CardTitle>
                <CardDescription>Track your sales performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
