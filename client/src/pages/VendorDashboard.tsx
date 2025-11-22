import { useState } from "react";
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
  TrendingUp,
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

export default function VendorDashboard() {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  
  const vendorId = localStorage.getItem("vendorId") || "demo-vendor-id";

  const { data: stats, isLoading: statsLoading } = useQuery({
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

  const { data: vendorData } = useQuery<Vendor>({
    queryKey: [`/api/vendors/${vendorId}`],
    enabled: !!vendorId,
  });

  const kycStatus = vendorData?.kycStatus || "pending";

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
            <AlertDescription>
              Your KYC verification is pending. Please upload required documents to start selling.
              <Button variant="link" className="p-0 h-auto ml-2 text-primary" data-testid="button-complete-kyc">
                Complete KYC
              </Button>
            </AlertDescription>
          </Alert>
        )}

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
