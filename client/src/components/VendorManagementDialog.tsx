import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  Ban,
  CheckCheck,
  Package,
  DollarSign,
  Star,
  ShoppingBag,
  FileText,
  Building,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Vendor, Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface VendorManagementDialogProps {
  vendor: Vendor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface VendorStats {
  totalProducts: number;
  activeOrders: number;
  totalRevenue: number;
  avgRating: number;
}

export function VendorManagementDialog({
  vendor,
  open,
  onOpenChange,
}: VendorManagementDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("info");

  const { data: vendorProducts = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/vendors", vendor?.id, "products"],
    enabled: !!vendor?.id && open,
  });

  const { data: vendorStats, isLoading: statsLoading } = useQuery<VendorStats>({
    queryKey: ["/api/vendors", vendor?.id, "stats"],
    enabled: !!vendor?.id && open,
  });

  const approveMutation = useMutation({
    mutationFn: (vendorId: string) =>
      apiRequest("POST", `/api/vendors/${vendorId}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      toast({
        title: "Vendor Approved",
        description: "Vendor KYC has been approved successfully",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve vendor",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (vendorId: string) =>
      apiRequest("POST", `/api/vendors/${vendorId}/reject`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      toast({
        title: "Vendor Rejected",
        description: "Vendor KYC has been rejected",
        variant: "destructive",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject vendor",
        variant: "destructive",
      });
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (vendorId: string) =>
      apiRequest("POST", `/api/vendors/${vendorId}/suspend`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      toast({
        title: "Vendor Suspended",
        description: "Vendor account has been suspended",
        variant: "destructive",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to suspend vendor",
        variant: "destructive",
      });
    },
  });

  const activateMutation = useMutation({
    mutationFn: (vendorId: string) =>
      apiRequest("POST", `/api/vendors/${vendorId}/activate`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      toast({
        title: "Vendor Activated",
        description: "Vendor account has been activated",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to activate vendor",
        variant: "destructive",
      });
    },
  });

  const handleApprove = () => {
    if (vendor) {
      approveMutation.mutate(vendor.id);
    }
  };

  const handleReject = () => {
    if (vendor) {
      rejectMutation.mutate(vendor.id);
    }
  };

  const handleSuspend = () => {
    if (vendor) {
      suspendMutation.mutate(vendor.id);
    }
  };

  const handleActivate = () => {
    if (vendor) {
      activateMutation.mutate(vendor.id);
    }
  };

  const getKycBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      approved: { className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300", label: "Approved" },
      pending: { className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300", label: "Pending" },
      rejected: { className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300", label: "Rejected" },
    };
    const variant = variants[status] || { className: "", label: status };
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getActiveBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Active</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">Suspended</Badge>
    );
  };

  if (!vendor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-vendor-management">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif" data-testid="text-vendor-name">
            {vendor.businessName}
          </DialogTitle>
          <DialogDescription>
            Complete vendor profile and management controls
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mb-4">
          {getKycBadge(vendor.kycStatus)}
          {getActiveBadge(vendor.isActive ?? true)}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info" data-testid="tab-info">Info</TabsTrigger>
            <TabsTrigger value="documents" data-testid="tab-documents">Documents</TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">Products</TabsTrigger>
            <TabsTrigger value="stats" data-testid="tab-stats">Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Business Name</p>
                    <p className="font-medium" data-testid="text-business-name">{vendor.businessName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">GST Number</p>
                    <p className="font-medium" data-testid="text-gst-number">{vendor.gstNumber || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Business Address</p>
                    <p className="font-medium" data-testid="text-business-address">{vendor.businessAddress || "Not provided"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <p className="font-medium" data-testid="text-rating">
                      {Number(vendor.rating).toFixed(2)} ⭐
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sales</p>
                    <p className="font-medium" data-testid="text-total-sales">{vendor.totalSales || 0}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="font-medium text-sm" data-testid="text-description">
                      {vendor.description || "No description available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">KYC Documents</h3>
              {vendor.kycDocuments && Array.isArray(vendor.kycDocuments) && vendor.kycDocuments.length > 0 ? (
                <div className="space-y-2">
                  {vendor.kycDocuments.map((doc: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-md"
                      data-testid={`doc-${index}`}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{doc.name || `Document ${index + 1}`}</span>
                      </div>
                      {doc.url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(doc.url, "_blank")}
                          data-testid={`button-view-doc-${index}`}
                        >
                          View
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm py-4" data-testid="text-no-documents">
                  No KYC documents uploaded yet
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            {productsLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading products...</div>
            ) : vendorProducts.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground" data-testid="text-no-products">
                No products found for this vendor
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                      <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                        <TableCell className="font-medium" data-testid={`text-product-name-${product.id}`}>
                          {product.name}
                        </TableCell>
                        <TableCell data-testid={`text-product-price-${product.id}`}>
                          ₹{Number(product.price).toLocaleString()}
                        </TableCell>
                        <TableCell data-testid={`text-product-stock-${product.id}`}>
                          {product.stock}
                        </TableCell>
                        <TableCell>
                          {product.isActive ? (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            {statsLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading stats...</div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Products
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      <span className="text-2xl font-serif font-semibold" data-testid="text-stat-products">
                        {vendorStats?.totalProducts || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Active Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-green-600" />
                      <span className="text-2xl font-serif font-semibold" data-testid="text-stat-orders">
                        {vendorStats?.activeOrders || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                      <span className="text-2xl font-serif font-semibold" data-testid="text-stat-revenue">
                        ₹{vendorStats?.totalRevenue?.toLocaleString() || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Average Rating
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-600" />
                      <span className="text-2xl font-serif font-semibold" data-testid="text-stat-rating">
                        {vendorStats?.avgRating?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 pt-4 border-t">
          {vendor.kycStatus === "pending" && (
            <>
              <Button
                onClick={handleApprove}
                disabled={approveMutation.isPending}
                data-testid="button-approve-vendor"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {approveMutation.isPending ? "Approving..." : "Approve"}
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={rejectMutation.isPending}
                data-testid="button-reject-vendor"
              >
                <XCircle className="w-4 h-4 mr-2" />
                {rejectMutation.isPending ? "Rejecting..." : "Reject"}
              </Button>
            </>
          )}

          {vendor.kycStatus === "approved" && (
            <>
              {vendor.isActive ? (
                <Button
                  variant="destructive"
                  onClick={handleSuspend}
                  disabled={suspendMutation.isPending}
                  data-testid="button-suspend-vendor"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  {suspendMutation.isPending ? "Suspending..." : "Suspend"}
                </Button>
              ) : (
                <Button
                  onClick={handleActivate}
                  disabled={activateMutation.isPending}
                  data-testid="button-activate-vendor"
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  {activateMutation.isPending ? "Activating..." : "Activate"}
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
