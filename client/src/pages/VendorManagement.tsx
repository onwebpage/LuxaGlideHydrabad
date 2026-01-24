import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";
import { 
  Lock, 
  User, 
  Eye, 
  DollarSign, 
  TrendingUp, 
  Package, 
  RefreshCw, 
  LogOut,
  Search,
  Filter,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StaffSession {
  username: string;
  loginTime: Date;
}

interface VendorData {
  id: string;
  businessName: string;
  email: string;
  phone: string;
  totalSales: number;
  totalOrders: number;
  totalRefunds: number;
  status: string;
  joinDate: string;
}

export default function VendorManagement() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [staffSession, setStaffSession] = useState<StaffSession | null>(null);
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<VendorData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Login form state
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    // Check if staff is already logged in
    const session = localStorage.getItem("staffSession");
    if (session) {
      const parsedSession = JSON.parse(session);
      setStaffSession(parsedSession);
      setIsAuthenticated(true);
      loadVendorData();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        const data = await response.json();
        const session: StaffSession = {
          username: data.staff.username,
          loginTime: new Date(data.staff.lastLogin),
        };
        
        localStorage.setItem("staffSession", JSON.stringify(session));
        setStaffSession(session);
        setIsAuthenticated(true);
        
        toast({
          title: "Login successful",
          description: "Welcome to vendor monitoring dashboard",
        });
        
        loadVendorData();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Invalid credentials");
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("staffSession");
    setStaffSession(null);
    setIsAuthenticated(false);
    setVendors([]);
    setSelectedVendor(null);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const loadVendorData = async () => {
    try {
      const response = await fetch("/api/vendors");
      
      if (response.ok) {
        const data = await response.json();
        // Transform the data to match our interface
        const transformedVendors = await Promise.all(data.map(async (vendor: any) => {
          // Get vendor statistics
          const statsResponse = await fetch(`/api/vendors/${vendor.id}/stats`);
          const stats = statsResponse.ok ? await statsResponse.json() : {
            totalSales: 0,
            totalOrders: 0,
            totalRefunds: 0
          };
          
          return {
            id: vendor.id,
            businessName: vendor.businessName,
            email: vendor.email,
            phone: vendor.phone,
            totalSales: stats.totalRevenue || 0,
            totalOrders: stats.activeOrders || 0,
            totalRefunds: 0, // Calculate from orders if needed
            status: vendor.kycStatus,
            joinDate: new Date(vendor.createdAt).toLocaleDateString(),
          };
        }));
        setVendors(transformedVendors);
      }
    } catch (error) {
      console.error("Failed to load vendor data:", error);
      toast({
        title: "Error",
        description: "Failed to load vendor data",
        variant: "destructive",
      });
    }
  };

  const [vendorOrders, setVendorOrders] = useState<any[]>([]);
  const [vendorProducts, setVendorProducts] = useState<any[]>([]);
  const [loadingVendorDetails, setLoadingVendorDetails] = useState(false);

  const loadVendorDetails = async (vendorId: string) => {
    setLoadingVendorDetails(true);
    try {
      const ordersResponse = await fetch(`/api/orders/vendor/${vendorId}`);
      if (ordersResponse.ok) {
        const orders = await ordersResponse.json();
        setVendorOrders(orders);
      }

      const productsResponse = await fetch(`/api/products?vendorId=${vendorId}`);
      if (productsResponse.ok) {
        const products = await productsResponse.json();
        setVendorProducts(products);
      }
    } catch (error) {
      console.error("Failed to load vendor details:", error);
    } finally {
      setLoadingVendorDetails(false);
    }
  };

  const handleVendorSelect = (vendor: VendorData) => {
    setSelectedVendor(vendor);
    loadVendorDetails(vendor.id);
  };
  const filteredVendors = vendors.filter(vendor =>
    vendor.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 bg-secondary/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-serif">Staff Login</CardTitle>
              <CardDescription>
                Enter your credentials to access vendor monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter username"
                      value={loginData.username}
                      onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-semibold">Vendor Monitoring</h1>
              <p className="text-sm text-muted-foreground">
                Logged in as: {staffSession?.username} | {staffSession?.loginTime.toLocaleString()}
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vendor List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Vendors ({filteredVendors.length})
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {filteredVendors.map((vendor) => (
                    <div
                      key={vendor.id}
                      className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedVendor?.id === vendor.id ? "bg-muted" : ""
                      }`}
                      onClick={() => handleVendorSelect(vendor)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{vendor.businessName}</h4>
                          <p className="text-sm text-muted-foreground">{vendor.email}</p>
                        </div>
                        <Badge variant={vendor.status === "approved" ? "default" : "secondary"}>
                          {vendor.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vendor Details */}
          <div className="lg:col-span-2">
            {selectedVendor ? (
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="sales">Sales</TabsTrigger>
                  <TabsTrigger value="transactions">Products</TabsTrigger>
                  <TabsTrigger value="refunds">Refunds</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-full">
                            <DollarSign className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Sales</p>
                            <p className="text-2xl font-bold">₹{(selectedVendor.totalSales || 0).toLocaleString()}</p>
                            {selectedVendor.totalSales === 0 && (
                              <p className="text-xs text-muted-foreground">No orders yet</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-100 rounded-full">
                            <Package className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Products</p>
                            <p className="text-2xl font-bold">{vendorProducts.length || 0}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-red-100 rounded-full">
                            <RefreshCw className="w-6 h-6 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Refunds</p>
                            <p className="text-2xl font-bold">₹{(selectedVendor.totalRefunds || 0).toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Vendor Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Business Name</Label>
                          <p className="text-sm text-muted-foreground">{selectedVendor.businessName}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Email</Label>
                          <p className="text-sm text-muted-foreground">{selectedVendor.email}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Phone</Label>
                          <p className="text-sm text-muted-foreground">{selectedVendor.phone}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Join Date</Label>
                          <p className="text-sm text-muted-foreground">{selectedVendor.joinDate}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sales">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sales Records</CardTitle>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {loadingVendorDetails ? (
                        <div className="py-8 text-center text-muted-foreground">Loading sales data...</div>
                      ) : vendorOrders.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">No sales records found</div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Order ID</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {vendorOrders.map((order) => (
                              <TableRow key={order.id}>
                                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>{order.orderNumber}</TableCell>
                                <TableCell>₹{Number(order.totalAmount).toLocaleString()}</TableCell>
                                <TableCell><Badge>{order.status}</Badge></TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="transactions">
                  <Card>
                    <CardHeader>
                      <CardTitle>Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingVendorDetails ? (
                        <div className="py-8 text-center text-muted-foreground">Loading products...</div>
                      ) : vendorProducts.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">No products found</div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product Name</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Stock</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {vendorProducts.map((product) => (
                              <TableRow key={product.id}>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>₹{Number(product.price).toLocaleString()}</TableCell>
                                <TableCell>{product.stock || 0}</TableCell>
                                <TableCell><Badge variant={product.isActive ? "default" : "secondary"}>{product.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="refunds">
                  <Card>
                    <CardHeader>
                      <CardTitle>Refund Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>2024-01-10</TableCell>
                            <TableCell>ORD002</TableCell>
                            <TableCell>Product Defect</TableCell>
                            <TableCell>₹1,200</TableCell>
                            <TableCell><Badge variant="secondary">Processed</Badge></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select a Vendor</h3>
                  <p className="text-muted-foreground">
                    Choose a vendor from the list to view their details, sales, and transaction records.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}