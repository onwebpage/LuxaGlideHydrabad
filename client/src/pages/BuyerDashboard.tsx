import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShoppingBag,
  Heart,
  MapPin,
  FileText,
  Download,
  Package,
  TrendingUp,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Order, Address, Product } from "@shared/schema";

export default function BuyerDashboard() {
  const userId = localStorage.getItem("userId") || "demo-user-id";

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/buyer", userId],
    enabled: !!userId,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: [`/api/orders/user/${userId}`],
    enabled: !!userId,
  });

  const { data: addresses = [], isLoading: addressesLoading } = useQuery<Address[]>({
    queryKey: [`/api/addresses/${userId}`],
    enabled: !!userId,
  });

  const { data: wishlistData = [], isLoading: wishlistLoading } = useQuery({
    queryKey: [`/api/wishlist/${userId}`],
    enabled: !!userId,
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      delivered: "bg-green-100 text-green-700",
      shipped: "bg-blue-100 text-blue-700",
      processing: "bg-yellow-100 text-yellow-700",
      pending: "bg-gray-100 text-gray-700",
      confirmed: "bg-blue-100 text-blue-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return <Badge className={variants[status] || ""}>{status}</Badge>;
  };

  const statsCards = [
    { 
      label: "Total Orders", 
      value: statsLoading ? "..." : stats?.totalOrders?.toString() || "0", 
      icon: ShoppingBag 
    },
    { 
      label: "Pending Orders", 
      value: statsLoading ? "..." : stats?.pendingOrders?.toString() || "0", 
      icon: Package 
    },
    { 
      label: "Wishlist Items", 
      value: statsLoading ? "..." : stats?.wishlistCount?.toString() || "0", 
      icon: Heart 
    },
    { 
      label: "Total Spent", 
      value: statsLoading ? "..." : `₹${stats?.totalSpent?.toLocaleString() || "0"}`, 
      icon: TrendingUp 
    },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-semibold mb-2">Buyer Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your orders, profile, and preferences
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

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders" data-testid="tab-orders">Orders</TabsTrigger>
            <TabsTrigger value="wishlist" data-testid="tab-wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="addresses" data-testid="tab-addresses">Addresses</TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
          </TabsList>

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
                    No orders yet. Start shopping to place your first order!
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
                          <TableCell className="font-medium" data-testid={`text-order-${order.id}`}>
                            {order.orderNumber}
                          </TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>₹{Number(order.totalAmount).toLocaleString()}</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>
                            <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                              {order.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" data-testid={`button-view-order-${order.id}`}>
                                View
                              </Button>
                              <Button variant="ghost" size="sm" data-testid={`button-download-invoice-${order.id}`}>
                                <Download className="w-4 h-4" />
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

          {/* Wishlist Tab */}
          <TabsContent value="wishlist">
            {wishlistLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading wishlist...</div>
            ) : wishlistData.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                Your wishlist is empty. Browse products to add items!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistData.map((item: any) => (
                  <Card key={item.id} className="hover-elevate transition-all">
                    <CardContent className="p-6">
                      <div className="aspect-square bg-secondary rounded-lg flex items-center justify-center text-6xl mb-4">
                        🌸
                      </div>
                      <h3 className="font-semibold mb-2">Wishlist Item</h3>
                      <p className="text-2xl font-serif font-semibold mb-4">₹-</p>
                      <Button className="w-full" data-testid={`button-add-to-cart-${item.id}`}>
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <div className="space-y-4">
              {addressesLoading ? (
                <div className="py-8 text-center text-muted-foreground">Loading addresses...</div>
              ) : addresses.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No addresses saved. Add your first address!
                </div>
              ) : (
                addresses.map((address) => (
                  <Card key={address.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge variant={address.isDefault ? "default" : "secondary"}>
                              {address.label}
                            </Badge>
                            {address.isDefault && (
                              <Badge variant="outline">Default</Badge>
                            )}
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="font-semibold">{address.fullName}</p>
                            <p className="text-muted-foreground">{address.phone}</p>
                            <p className="text-muted-foreground">
                              {address.addressLine1}, {address.addressLine2 && `${address.addressLine2}, `}
                              {address.city}, {address.state} {address.postalCode}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" data-testid={`button-edit-address-${address.id}`}>
                            Edit
                          </Button>
                          {!address.isDefault && (
                            <Button variant="ghost" size="sm" data-testid={`button-delete-address-${address.id}`}>
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              <Button variant="outline" className="w-full" data-testid="button-add-address">
                <MapPin className="w-4 h-4 mr-2" />
                Add New Address
              </Button>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 mb-6">
                    <Avatar className="w-20 h-20">
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                        JD
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">John Doe</h3>
                      <p className="text-muted-foreground">john.doe@example.com</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs uppercase tracking-wider mb-2 block text-muted-foreground">
                        Phone
                      </Label>
                      <p className="font-medium">+91 98765 43210</p>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider mb-2 block text-muted-foreground">
                        Business Name
                      </Label>
                      <p className="font-medium">Fashion Boutique</p>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider mb-2 block text-muted-foreground">
                        GST Number
                      </Label>
                      <p className="font-medium">22AAAAA0000A1Z5</p>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider mb-2 block text-muted-foreground">
                        Member Since
                      </Label>
                      <p className="font-medium">January 2024</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button data-testid="button-edit-profile">
                      <User className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
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

// Add missing Label import
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
