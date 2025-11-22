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

export default function BuyerDashboard() {
  // Mock data - will be replaced with API
  const stats = [
    { label: "Total Orders", value: "24", icon: ShoppingBag, change: "+12%" },
    { label: "Pending Orders", value: "3", icon: Package, change: "-" },
    { label: "Wishlist Items", value: "12", icon: Heart, change: "+2" },
    { label: "Total Spent", value: "₹1,24,500", icon: TrendingUp, change: "+23%" },
  ];

  const recentOrders = [
    {
      id: "ORD001",
      date: "2024-01-15",
      vendor: "Elite Fashion Co.",
      items: 50,
      amount: 25000,
      status: "delivered",
    },
    {
      id: "ORD002",
      date: "2024-01-20",
      vendor: "Trends Wholesale",
      items: 30,
      amount: 18000,
      status: "shipped",
    },
    {
      id: "ORD003",
      date: "2024-01-22",
      vendor: "Style Studios",
      items: 20,
      amount: 12000,
      status: "processing",
    },
  ];

  const addresses = [
    {
      id: "1",
      label: "Office",
      name: "John Doe",
      phone: "+91 98765 43210",
      address: "123 Fashion Street, Mumbai, Maharashtra 400001",
      isDefault: true,
    },
    {
      id: "2",
      label: "Warehouse",
      name: "John Doe",
      phone: "+91 98765 43210",
      address: "456 Wholesale Avenue, Delhi, Delhi 110001",
      isDefault: false,
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
          <h1 className="font-serif text-4xl font-semibold mb-2">Buyer Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your orders, profile, and preferences
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
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
                    {stat.change !== "-" && (
                      <span className="text-sm text-green-600">{stat.change}</span>
                    )}
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>{order.vendor}</TableCell>
                        <TableCell>{order.items} pcs</TableCell>
                        <TableCell>₹{order.amount.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover-elevate transition-all">
                <CardContent className="p-6">
                  <div className="aspect-square bg-secondary rounded-lg flex items-center justify-center text-6xl mb-4">
                    🌸
                  </div>
                  <h3 className="font-semibold mb-2">Designer Silk Saree</h3>
                  <p className="text-2xl font-serif font-semibold mb-4">₹2,500</p>
                  <Button className="w-full" data-testid="button-add-to-cart-wishlist">
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <div className="space-y-4">
              {addresses.map((address) => (
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
                          <p className="font-semibold">{address.name}</p>
                          <p className="text-muted-foreground">{address.phone}</p>
                          <p className="text-muted-foreground">{address.address}</p>
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
              ))}
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
