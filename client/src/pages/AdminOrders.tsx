import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  ArrowLeft, 
  Download, 
  Truck, 
  Eye,
  Edit,
  ExternalLink,
} from "lucide-react";
import type { Order, Vendor } from "@shared/schema";

interface OrderWithDetails extends Order {
  user?: { fullName: string; email: string };
  vendor?: { businessName: string };
  shippingAddress?: any;
  items?: any[];
}

export default function AdminOrders() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [newVendorId, setNewVendorId] = useState<string>("");
  const [trackingNumber, setTrackingNumber] = useState<string>("");

  const { data: orders = [], isLoading, refetch } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders", { status: statusFilter !== "all" ? statusFilter : undefined }],
  });

  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const token = localStorage.getItem("adminToken");
      return await apiRequest("PUT", `/api/admin/orders/${orderId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({
        title: "Status Updated",
        description: "Order status has been updated successfully",
      });
      setEditDialogOpen(false);
      setSelectedOrder(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  const updateVendorMutation = useMutation({
    mutationFn: async ({ orderId, vendorId }: { orderId: string; vendorId: string }) => {
      const token = localStorage.getItem("adminToken");
      return await apiRequest("PUT", `/api/admin/orders/${orderId}/vendor`, { vendorId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({
        title: "Vendor Assigned",
        description: "Vendor has been assigned successfully",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign vendor",
        variant: "destructive",
      });
    },
  });

  const updateTrackingMutation = useMutation({
    mutationFn: async ({ orderId, trackingNumber }: { orderId: string; trackingNumber: string }) => {
      const token = localStorage.getItem("adminToken");
      return await apiRequest("PUT", `/api/admin/orders/${orderId}/tracking`, { trackingNumber }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({
        title: "Tracking Updated",
        description: "Tracking number has been updated successfully",
      });
      setTrackingNumber("");
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update tracking",
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = async (order: Order) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }

      const orderDetails = await response.json();
      setSelectedOrder(orderDetails);
      setViewDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch order details",
        variant: "destructive",
      });
    }
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setNewVendorId(order.vendorId);
    setEditDialogOpen(true);
  };

  const handleDownloadInvoice = (orderId: string, orderNumber: string) => {
    const token = localStorage.getItem("adminToken");
    const url = `/api/admin/orders/${orderId}/invoice`;
    
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${orderNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Invoice Downloaded",
          description: "Invoice has been downloaded successfully",
        });
      })
      .catch(error => {
        toast({
          title: "Error",
          description: "Failed to download invoice",
          variant: "destructive",
        });
      });
  };

  const handleDownloadShippingLabel = (orderId: string, orderNumber: string) => {
    const token = localStorage.getItem("adminToken");
    const url = `/api/admin/orders/${orderId}/shipping-label`;
    
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `label-${orderNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Label Downloaded",
          description: "Shipping label has been downloaded successfully",
        });
      })
      .catch(error => {
        toast({
          title: "Error",
          description: "Failed to download shipping label",
          variant: "destructive",
        });
      });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "delivered":
        return "default";
      case "shipped":
        return "secondary";
      case "processing":
        return "secondary";
      case "confirmed":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getTrackingUrl = (trackingNumber: string) => {
    // Generic tracking URL - in production, you'd have specific URLs for different carriers
    return `https://www.google.com/search?q=${encodeURIComponent(trackingNumber)}+tracking`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard/admin")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-serif">Order Management</h1>
            <p className="text-muted-foreground">Manage and track all customer orders</p>
          </div>
        </div>

        {/* Filters */}
        <Card data-testid="card-filters">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="filter-status">Filter by Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="filter-status" data-testid="select-status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                onClick={() => refetch()}
                data-testid="button-refresh"
              >
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card data-testid="card-orders">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Orders ({orders.length})
            </CardTitle>
            <CardDescription>
              View and manage all customer orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No orders found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Number</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Tracking</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                        <TableCell className="font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(order.status)} data-testid={`badge-status-${order.id}`}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={order.paymentStatus === "paid" ? "default" : "outline"}>
                            {order.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>₹{Number(order.totalAmount).toFixed(2)}</TableCell>
                        <TableCell>
                          {order.trackingNumber ? (
                            <a
                              href={getTrackingUrl(order.trackingNumber)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-primary hover:underline"
                              data-testid={`link-tracking-${order.id}`}
                            >
                              {order.trackingNumber}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">Not set</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(order)}
                              data-testid={`button-view-${order.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditOrder(order)}
                              data-testid={`button-edit-${order.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownloadInvoice(order.id, order.orderNumber)}
                              data-testid={`button-invoice-${order.id}`}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownloadShippingLabel(order.id, order.orderNumber)}
                              data-testid={`button-label-${order.id}`}
                            >
                              <Truck className="h-4 w-4" />
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

        {/* View Order Details Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="dialog-view-order">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>
                Order #{selectedOrder?.orderNumber}
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <p className="font-medium" data-testid="text-order-status">
                      <Badge variant={getStatusBadgeVariant(selectedOrder.status)}>
                        {selectedOrder.status}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Payment Status</Label>
                    <p className="font-medium" data-testid="text-payment-status">
                      <Badge variant={selectedOrder.paymentStatus === "paid" ? "default" : "outline"}>
                        {selectedOrder.paymentStatus}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Total Amount</Label>
                    <p className="font-medium" data-testid="text-total-amount">₹{Number(selectedOrder.totalAmount).toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Order Date</Label>
                    <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {/* Customer Info */}
                {selectedOrder.user && (
                  <div>
                    <Label className="text-muted-foreground">Customer</Label>
                    <p className="font-medium" data-testid="text-customer-name">{selectedOrder.user.fullName}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.user.email}</p>
                  </div>
                )}

                {/* Vendor Info */}
                {selectedOrder.vendor && (
                  <div>
                    <Label className="text-muted-foreground">Vendor</Label>
                    <p className="font-medium" data-testid="text-vendor-name">{selectedOrder.vendor.businessName}</p>
                  </div>
                )}

                {/* Shipping Address */}
                {selectedOrder.shippingAddress && (
                  <div>
                    <Label className="text-muted-foreground">Shipping Address</Label>
                    <p className="font-medium">{selectedOrder.shippingAddress.fullName}</p>
                    <p className="text-sm">{selectedOrder.shippingAddress.phone}</p>
                    <p className="text-sm">
                      {selectedOrder.shippingAddress.addressLine1}
                      {selectedOrder.shippingAddress.addressLine2 && `, ${selectedOrder.shippingAddress.addressLine2}`}
                    </p>
                    <p className="text-sm">
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                    </p>
                  </div>
                )}

                {/* Order Items */}
                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Order Items</Label>
                    <div className="space-y-2 mt-2">
                      {selectedOrder.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm border-b pb-2">
                          <span>Qty: {item.quantity}</span>
                          <span>₹{Number(item.price).toFixed(2)} each</span>
                          <span className="font-medium">₹{(Number(item.price) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Order Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent data-testid="dialog-edit-order">
            <DialogHeader>
              <DialogTitle>Manage Order</DialogTitle>
              <DialogDescription>
                Update order status, vendor, or tracking information
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                {/* Update Status */}
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Order Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger id="edit-status" data-testid="select-new-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => updateStatusMutation.mutate({ orderId: selectedOrder.id, status: newStatus })}
                    disabled={updateStatusMutation.isPending || newStatus === selectedOrder.status}
                    className="w-full"
                    data-testid="button-update-status"
                  >
                    {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
                  </Button>
                </div>

                {/* Assign Vendor */}
                <div className="space-y-2">
                  <Label htmlFor="edit-vendor">Assign Vendor</Label>
                  <Select value={newVendorId} onValueChange={setNewVendorId}>
                    <SelectTrigger id="edit-vendor" data-testid="select-vendor">
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.businessName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => updateVendorMutation.mutate({ orderId: selectedOrder.id, vendorId: newVendorId })}
                    disabled={updateVendorMutation.isPending || !newVendorId || newVendorId === selectedOrder.vendorId}
                    className="w-full"
                    data-testid="button-assign-vendor"
                  >
                    {updateVendorMutation.isPending ? "Assigning..." : "Assign Vendor"}
                  </Button>
                </div>

                {/* Update Tracking */}
                <div className="space-y-2">
                  <Label htmlFor="edit-tracking">Tracking Number</Label>
                  <Input
                    id="edit-tracking"
                    placeholder={selectedOrder.trackingNumber || "Enter tracking number"}
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    data-testid="input-tracking"
                  />
                  <Button
                    onClick={() => updateTrackingMutation.mutate({ orderId: selectedOrder.id, trackingNumber })}
                    disabled={updateTrackingMutation.isPending || !trackingNumber}
                    className="w-full"
                    data-testid="button-update-tracking"
                  >
                    {updateTrackingMutation.isPending ? "Updating..." : "Update Tracking"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
