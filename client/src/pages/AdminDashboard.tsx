import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Store,
  Package,
  TrendingUp,
  CheckCircle,
  XCircle,
  Search,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";
import type { Order, Vendor } from "@shared/schema";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/admin"],
  });

  const { data: vendors = [], isLoading: vendorsLoading } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const pendingVendors = vendors.filter(v => v.kycStatus === "pending");
  
  const statsCards = [
    { 
      label: "Total Users", 
      value: statsLoading ? "..." : stats?.totalUsers?.toString() || "0", 
      icon: Users 
    },
    { 
      label: "Active Vendors", 
      value: statsLoading ? "..." : stats?.activeVendors?.toString() || "0", 
      icon: Store 
    },
    { 
      label: "Total Products", 
      value: statsLoading ? "..." : stats?.totalProducts?.toString() || "0", 
      icon: Package 
    },
    { 
      label: "Total Revenue", 
      value: statsLoading ? "..." : `₹${stats?.totalRevenue?.toLocaleString() || "0"}`, 
      icon: TrendingUp 
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      delivered: "bg-green-100 text-green-700",
      shipped: "bg-blue-100 text-blue-700",
      processing: "bg-yellow-100 text-yellow-700",
      pending: "bg-gray-100 text-gray-700",
    };
    return <Badge className={variants[status] || ""}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-semibold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Platform overview and management controls
          </p>
        </div>

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

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
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
                  <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="vendors" className="space-y-6">
          <TabsList>
            <TabsTrigger value="vendors" data-testid="tab-vendors">Pending KYC</TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">Orders</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">Products</TabsTrigger>
          </TabsList>

          {/* Pending Vendors Tab */}
          <TabsContent value="vendors">
            <Card>
              <CardHeader>
                <CardTitle>Pending Vendor KYC Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                {vendorsLoading ? (
                  <div className="py-8 text-center text-muted-foreground">Loading vendors...</div>
                ) : pendingVendors.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No pending KYC approvals at the moment.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>GST Number</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingVendors.map((vendor) => (
                        <TableRow key={vendor.id}>
                          <TableCell className="font-medium" data-testid={`text-vendor-${vendor.id}`}>{vendor.businessName}</TableCell>
                          <TableCell>{vendor.contactPerson || vendor.email}</TableCell>
                          <TableCell>{vendor.gstNumber || "N/A"}</TableCell>
                          <TableCell>{new Date(vendor.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="default" data-testid={`button-approve-${vendor.id}`}>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive" data-testid={`button-reject-${vendor.id}`}>
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                              <Button size="sm" variant="outline" data-testid={`button-view-docs-${vendor.id}`}>
                                <FileText className="w-4 h-4 mr-1" />
                                View Docs
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>All Orders</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    className="pl-10 w-[300px]"
                    data-testid="input-search-orders"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="py-8 text-center text-muted-foreground">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No orders found in the system.
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
                            <Button variant="outline" size="sm" data-testid={`button-view-order-${order.id}`}>
                              View Details
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

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-10 w-[300px]"
                    data-testid="input-search-users"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  User management interface coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Product Oversight</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    className="pl-10 w-[300px]"
                    data-testid="input-search-products"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  Product management interface coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
