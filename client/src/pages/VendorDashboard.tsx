import { useState, useEffect } from "react";
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
} from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import type { Order, Product, Vendor } from "@shared/schema";
import { useAuth, getAuthToken } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { X, FileText, CheckCircle } from "lucide-react";

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
    queryKey: [`/api/products`],
    select: (data) => data.filter((p: Product) => p.vendorId === vendorId),
    enabled: !!vendorId,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: [`/api/orders/vendor/${vendorId}`],
    enabled: !!vendorId,
  });

  const kycStatus = vendorProfile?.kycStatus || "pending";

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

  const handleKycSubmit = async () => {
    if (kycFiles.length === 0) {
      toast({
        title: "No documents",
        description: "Please upload at least one KYC document",
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

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-semibold mb-2">Vendor Dashboard</h1>
          <p className="text-muted-foreground">
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
                Please upload your business documents to verify your account. This is required to start selling on LuxeWholesale.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="businessAddress">Business Address</Label>
                <Textarea
                  id="businessAddress"
                  placeholder="Enter your complete business address"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  data-testid="input-business-address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstNumber">GST Number (Optional)</Label>
                <Input
                  id="gstNumber"
                  placeholder="e.g., 22AAAAA0000A1Z5"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  data-testid="input-gst-number"
                />
              </div>

              <div className="space-y-2">
                <Label>Upload Documents</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Upload valid business documents such as PAN Card, Business Registration Certificate, GST Certificate, or Address Proof.
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
                  disabled={kycUploading || kycFiles.length === 0}
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
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Product Inventory</CardTitle>
                <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-product">
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
                        <Input id="productName" placeholder="e.g., Designer Silk Saree" data-testid="input-product-name" />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="price">Price (₹)</Label>
                          <Input id="price" type="number" placeholder="2500" data-testid="input-price" />
                        </div>
                        <div>
                          <Label htmlFor="moq">MOQ</Label>
                          <Input id="moq" type="number" placeholder="10" data-testid="input-moq" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="Product description..." data-testid="input-description" />
                      </div>
                      <div>
                        <Label>Product Images</Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover-elevate transition-all cursor-pointer">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload or drag and drop images
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>
                          Cancel
                        </Button>
                        <Button data-testid="button-save-product">Save Product</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
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
                              <Button variant="ghost" size="sm" data-testid={`button-edit-${product.id}`}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" data-testid={`button-delete-${product.id}`}>
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
        </Tabs>
      </div>
    </div>
  );
}
