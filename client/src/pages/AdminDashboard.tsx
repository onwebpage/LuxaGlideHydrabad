import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Store,
  Package,
  TrendingUp,
  CheckCircle,
  XCircle,
  FileText,
  ShoppingCart,
  AlertTriangle,
  DollarSign,
  LogOut,
  Eye,
  Ban,
  CheckCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import type { Order, Vendor, Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { VendorManagementDialog } from "@/components/VendorManagementDialog";

interface AdminStats {
  totalVendors: number;
  totalOrders: number;
  totalRevenue: number;
  activeProducts: number;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const adminAuth = localStorage.getItem("adminAuth");
    const authTime = localStorage.getItem("adminAuthTime");
    
    if (!adminAuth || adminAuth !== "true") {
      setLocation("/admin-login");
      return;
    }
    
    if (authTime) {
      const timeSinceAuth = Date.now() - parseInt(authTime);
      const oneHour = 60 * 60 * 1000;
      
      if (timeSinceAuth > oneHour) {
        localStorage.removeItem("adminAuth");
        localStorage.removeItem("adminAuthTime");
        toast({
          title: "Session Expired",
          description: "Please login again",
          variant: "destructive",
        });
        setLocation("/admin-login");
      }
    }
  }, [setLocation, toast]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("adminAuthTime");
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
    setLocation("/admin-login");
  };

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/dashboard/admin"],
  });

  const { data: monthlySales = [], isLoading: salesLoading } = useQuery<Array<{ month: string; revenue: number; orders: number }>>({
    queryKey: ["/api/analytics/monthly-sales"],
  });

  const { data: vendorPerformance = [], isLoading: vendorPerfLoading } = useQuery<Array<{ vendorName: string; totalSales: number; orderCount: number }>>({
    queryKey: ["/api/analytics/vendor-performance"],
  });

  const { data: lowStockProducts = [], isLoading: lowStockLoading } = useQuery<Product[]>({
    queryKey: ["/api/analytics/low-stock"],
  });

  const { data: recentOrders = [], isLoading: recentOrdersLoading } = useQuery<Order[]>({
    queryKey: ["/api/analytics/recent-orders"],
  });

  const { data: vendors = [], isLoading: vendorsLoading } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
  });

  const pendingVendors = vendors.filter(v => v.kycStatus === "pending");
  const approvedVendors = vendors.filter(v => v.kycStatus === "approved");
  const rejectedVendors = vendors.filter(v => v.kycStatus === "rejected");

  const handleViewVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setDialogOpen(true);
  };
  
  const statsCards = [
    { 
      label: "Total Vendors", 
      value: statsLoading ? "..." : stats?.totalVendors?.toString() || "0", 
      icon: Store,
      color: "text-blue-600"
    },
    { 
      label: "Total Orders", 
      value: statsLoading ? "..." : stats?.totalOrders?.toString() || "0", 
      icon: ShoppingCart,
      color: "text-green-600"
    },
    { 
      label: "Total Revenue", 
      value: statsLoading ? "..." : `₹${stats?.totalRevenue?.toLocaleString() || "0"}`, 
      icon: DollarSign,
      color: "text-purple-600"
    },
    { 
      label: "Active Products", 
      value: statsLoading ? "..." : stats?.activeProducts?.toString() || "0", 
      icon: Package,
      color: "text-orange-600"
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      delivered: { className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300", label: "Delivered" },
      shipped: { className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300", label: "Shipped" },
      processing: { className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300", label: "Processing" },
      confirmed: { className: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300", label: "Confirmed" },
      pending: { className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", label: "Pending" },
      cancelled: { className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300", label: "Cancelled" },
    };
    const variant = variants[status] || { className: "", label: status };
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      paid: { className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300", label: "Paid" },
      pending: { className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300", label: "Pending" },
      failed: { className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300", label: "Failed" },
      refunded: { className: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300", label: "Refunded" },
    };
    const variant = variants[status] || { className: "", label: status };
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-4xl font-semibold mb-2" data-testid="text-title">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Platform overview and management controls
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card data-testid={`card-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="text-3xl font-serif font-semibold mb-1" data-testid={`text-value-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>{stat.value}</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {lowStockProducts.length > 0 && (
          <Alert className="mb-8 border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950" data-testid="alert-low-stock">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <AlertTitle className="text-orange-900 dark:text-orange-100">Low Stock Alert</AlertTitle>
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              {lowStockProducts.length} product{lowStockProducts.length !== 1 ? 's' : ''} running low on stock. Please review and restock.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card data-testid="card-revenue-chart">
            <CardHeader>
              <CardTitle>Monthly Sales - Revenue Graph</CardTitle>
              <CardDescription>Revenue and order trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              {salesLoading ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Loading chart data...
                </div>
              ) : monthlySales.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No sales data available yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlySales}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: any, name: string) => {
                        if (name === "revenue") return [`₹${value.toLocaleString()}`, "Revenue"];
                        if (name === "orders") return [value, "Orders"];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2} 
                      name="Revenue"
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="orders" 
                      stroke="#10b981" 
                      strokeWidth={2} 
                      name="Orders"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-vendor-performance">
            <CardHeader>
              <CardTitle>Vendor Performance - Bar Chart</CardTitle>
              <CardDescription>Top performing vendors by sales</CardDescription>
            </CardHeader>
            <CardContent>
              {vendorPerfLoading ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Loading chart data...
                </div>
              ) : vendorPerformance.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No vendor performance data available yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vendorPerformance}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis 
                      dataKey="vendorName" 
                      className="text-xs" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: any, name: string) => {
                        if (name === "totalSales") return [`₹${value.toLocaleString()}`, "Total Sales"];
                        if (name === "orderCount") return [value, "Orders"];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="totalSales" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} name="Total Sales" />
                    <Bar dataKey="orderCount" fill="#06b6d4" radius={[8, 8, 0, 0]} name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card data-testid="card-recent-orders">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest orders in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {recentOrdersLoading ? (
                <div className="py-8 text-center text-muted-foreground">Loading orders...</div>
              ) : recentOrders.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No orders found in the system yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentOrders.map((order) => (
                        <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                          <TableCell className="font-medium" data-testid={`text-order-number-${order.id}`}>
                            {order.orderNumber}
                          </TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell data-testid={`text-order-amount-${order.id}`}>
                            ₹{Number(order.totalAmount).toLocaleString()}
                          </TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>{getPaymentBadge(order.paymentStatus)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-low-stock">
            <CardHeader>
              <CardTitle>Low Stock Alert</CardTitle>
              <CardDescription>Products that need restocking</CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockLoading ? (
                <div className="py-8 text-center text-muted-foreground">Loading products...</div>
              ) : lowStockProducts.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  All products have sufficient stock.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>MOQ</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lowStockProducts.map((product) => (
                        <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                          <TableCell className="font-medium" data-testid={`text-product-name-${product.id}`}>
                            {product.name}
                          </TableCell>
                          <TableCell>
                            <span className={product.stock === 0 ? "text-red-600 font-semibold" : "text-orange-600"} data-testid={`text-stock-${product.id}`}>
                              {product.stock}
                            </span>
                          </TableCell>
                          <TableCell>{product.moq}</TableCell>
                          <TableCell>
                            {product.stock === 0 ? (
                              <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                                Out of Stock
                              </Badge>
                            ) : (
                              <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                                Low Stock
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="vendor-management" className="space-y-6">
          <TabsList>
            <TabsTrigger value="vendor-management" data-testid="tab-vendor-management">Vendor Management</TabsTrigger>
            <TabsTrigger value="pending-kyc" data-testid="tab-pending-kyc">Pending KYC</TabsTrigger>
            <TabsTrigger value="all-orders" data-testid="tab-all-orders">All Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="vendor-management">
            <Card>
              <CardHeader>
                <CardTitle>All Vendors</CardTitle>
                <CardDescription>Manage all vendors in the system</CardDescription>
              </CardHeader>
              <CardContent>
                {vendorsLoading ? (
                  <div className="py-8 text-center text-muted-foreground">Loading vendors...</div>
                ) : vendors.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No vendors registered yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Business Name</TableHead>
                          <TableHead>GST Number</TableHead>
                          <TableHead>KYC Status</TableHead>
                          <TableHead>Account Status</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vendors.map((vendor) => (
                          <TableRow key={vendor.id} data-testid={`row-vendor-${vendor.id}`}>
                            <TableCell className="font-medium" data-testid={`text-vendor-business-${vendor.id}`}>
                              {vendor.businessName}
                            </TableCell>
                            <TableCell>{vendor.gstNumber || "N/A"}</TableCell>
                            <TableCell>
                              {vendor.kycStatus === "approved" && (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                  Approved
                                </Badge>
                              )}
                              {vendor.kycStatus === "pending" && (
                                <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                                  Pending
                                </Badge>
                              )}
                              {vendor.kycStatus === "rejected" && (
                                <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                                  Rejected
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {vendor.isActive ? (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                  Active
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                                  Suspended
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell data-testid={`text-vendor-rating-${vendor.id}`}>
                              {Number(vendor.rating).toFixed(2)} ⭐
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewVendor(vendor)}
                                data-testid={`button-view-vendor-${vendor.id}`}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending-kyc">
            <Card>
              <CardHeader>
                <CardTitle>Pending Vendor KYC Approvals</CardTitle>
                <CardDescription>Review and approve vendor applications</CardDescription>
              </CardHeader>
              <CardContent>
                {vendorsLoading ? (
                  <div className="py-8 text-center text-muted-foreground">Loading vendors...</div>
                ) : pendingVendors.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No pending KYC approvals at the moment.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Business Name</TableHead>
                          <TableHead>GST Number</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingVendors.map((vendor) => (
                          <TableRow key={vendor.id}>
                            <TableCell className="font-medium" data-testid={`text-vendor-${vendor.id}`}>
                              {vendor.businessName}
                            </TableCell>
                            <TableCell>{vendor.gstNumber || "N/A"}</TableCell>
                            <TableCell>{new Date(vendor.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewVendor(vendor)}
                                  data-testid={`button-view-pending-${vendor.id}`}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View & Approve
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all-orders">
            <Card>
              <CardHeader>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>Complete order history</CardDescription>
              </CardHeader>
              <CardContent>
                {recentOrdersLoading ? (
                  <div className="py-8 text-center text-muted-foreground">Loading orders...</div>
                ) : recentOrders.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No orders found in the system.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
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
                        {recentOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium" data-testid={`text-all-order-${order.id}`}>
                              {order.orderNumber}
                            </TableCell>
                            <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>₹{Number(order.totalAmount).toLocaleString()}</TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell>{getPaymentBadge(order.paymentStatus)}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" data-testid={`button-view-order-${order.id}`}>
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <VendorManagementDialog
          vendor={selectedVendor}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </div>
    </div>
  );
}
