import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateBuyerProfileSchema, type UpdateBuyerProfile } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import type { Order, Address, Product, Buyer } from "@shared/schema";

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  wishlistCount: number;
  totalSpent: number;
}

interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
}

export default function BuyerDashboard() {
  const { user, profile, refreshProfile } = useAuth();
  const [, setLocation] = useLocation();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const userId = user?.id;

  if (!user) {
    setLocation("/login");
    return null;
  }

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: [`/api/dashboard/buyer/${userId}`],
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

  const { data: wishlistData = [], isLoading: wishlistLoading } = useQuery<WishlistItem[]>({
    queryKey: [`/api/wishlist/${userId}`],
    enabled: !!userId,
  });

  const buyerProfile = profile as Buyer | null;
  
  const form = useForm<UpdateBuyerProfile>({
    resolver: zodResolver(updateBuyerProfileSchema),
    defaultValues: {
      fullName: user.fullName || "",
      phone: user.phone || "",
      businessName: buyerProfile?.businessName || "",
      gstNumber: buyerProfile?.gstNumber || "",
      currentPassword: "",
      userId: user.id,
    },
  });

  // Reset form when dialog opens with latest user data
  useEffect(() => {
    if (isEditDialogOpen) {
      form.reset({
        fullName: user.fullName || "",
        phone: user.phone || "",
        businessName: buyerProfile?.businessName || "",
        gstNumber: buyerProfile?.gstNumber || "",
        currentPassword: "",
        userId: user.id,
      });
    }
  }, [isEditDialogOpen, user, buyerProfile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateBuyerProfile) => {
      const res = await apiRequest("PATCH", "/api/profile/buyer", data);
      return await res.json();
    },
    onSuccess: (response) => {
      refreshProfile(response.user, response.profile);
      toast({
        title: "Success",
        description: "Your profile has been updated successfully",
      });
      setIsEditDialogOpen(false);
      form.reset({
        fullName: response.user.fullName,
        phone: response.user.phone || "",
        businessName: response.profile?.businessName || "",
        gstNumber: response.profile?.gstNumber || "",
        currentPassword: "",
        userId: response.user.id,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateBuyerProfile) => {
    updateProfileMutation.mutate(data);
  };

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
                {wishlistData.map((item) => (
                  <WishlistProductCard key={item.id} item={item} />
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
                        {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{user?.fullName || 'User'}</h3>
                      <p className="text-muted-foreground">{user?.email || ''}</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs uppercase tracking-wider mb-2 block text-muted-foreground">
                        Phone
                      </Label>
                      <p className="font-medium">{user?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider mb-2 block text-muted-foreground">
                        Business Name
                      </Label>
                      <p className="font-medium">{profile?.businessName || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider mb-2 block text-muted-foreground">
                        GST Number
                      </Label>
                      <p className="font-medium">{profile?.gstNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider mb-2 block text-muted-foreground">
                        Member Since
                      </Label>
                      <p className="font-medium">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button onClick={() => setIsEditDialogOpen(true)} data-testid="button-edit-profile">
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

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your personal information and business details
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} data-testid="input-fullname" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your phone number" {...field} data-testid="input-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your business name" {...field} data-testid="input-business-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gstNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your GST number" {...field} data-testid="input-gst-number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password to confirm" {...field} data-testid="input-current-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-profile"
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Label component for profile section
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

// Wishlist product card component - fetches real product data for each wishlist item
function WishlistProductCard({ item }: { item: WishlistItem }) {
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${item.productId}`],
    enabled: !!item.productId,
  });

  if (isLoading) {
    return (
      <Card className="hover-elevate transition-all">
        <CardContent className="p-6">
          <div className="aspect-square bg-secondary rounded-lg animate-pulse mb-4" />
          <div className="h-6 bg-secondary rounded animate-pulse mb-2" />
          <div className="h-8 bg-secondary rounded animate-pulse mb-4" />
          <div className="h-10 bg-secondary rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!product) return null;

  const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
  const firstImage = Array.isArray(images) ? images[0] : null;

  return (
    <Card className="hover-elevate transition-all">
      <CardContent className="p-6">
        <Link href={`/products/${product.slug}`}>
          <div className="aspect-square bg-secondary rounded-lg flex items-center justify-center mb-4 overflow-hidden">
            {firstImage && !firstImage.includes('🌸') ? (
              <img src={firstImage} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>
        </Link>
        <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
        <p className="text-2xl font-serif font-semibold mb-4">
          ₹{Number(product.price).toLocaleString()}
        </p>
        <Button className="w-full" data-testid={`button-add-to-cart-${item.id}`}>
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}
