import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Users, Search, ArrowLeft, Ban, CheckCircle, Eye, Mail, Phone, MapPin, Package } from "lucide-react";
import type { User, Order, Address } from "@shared/schema";

interface CustomerDetails extends User {
  addresses: Address[];
  orders: Order[];
  profile: any;
}

export default function AdminCustomers() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [customerToBlock, setCustomerToBlock] = useState<{ id: string; name: string; isBlocked: boolean } | null>(null);

  const buildFilters = () => {
    const filters: any = {};
    if (search) filters.search = search;
    if (roleFilter !== "all") filters.role = roleFilter;
    if (statusFilter === "blocked") filters.isBlocked = true;
    if (statusFilter === "active") filters.isBlocked = false;
    return filters;
  };

  const { data: customers = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/customers", buildFilters()],
  });

  const { data: customerDetails, isLoading: isLoadingDetails } = useQuery<CustomerDetails>({
    queryKey: ["/api/admin/customers", "detail", selectedCustomerId],
    enabled: !!selectedCustomerId,
    queryFn: async () => {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/customers/${selectedCustomerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch customer details");
      return response.json();
    },
  });

  const blockMutation = useMutation({
    mutationFn: async ({ id, block }: { id: string; block: boolean }) => {
      return await apiRequest("POST", `/api/admin/customers/${id}/${block ? 'block' : 'unblock'}`);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customers"] });
      toast({
        title: variables.block ? "Customer Blocked" : "Customer Unblocked",
        description: `Customer has been ${variables.block ? 'blocked' : 'unblocked'} successfully`,
      });
      setBlockDialogOpen(false);
      setCustomerToBlock(null);
      if (viewDialogOpen) {
        setViewDialogOpen(false);
        setSelectedCustomerId(null);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update customer status",
        variant: "destructive",
      });
    },
  });

  const handleViewCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setViewDialogOpen(true);
  };

  const handleBlockToggle = (customer: User) => {
    setCustomerToBlock({
      id: customer.id,
      name: customer.fullName,
      isBlocked: customer.isBlocked || false,
    });
    setBlockDialogOpen(true);
  };

  const confirmBlockToggle = () => {
    if (customerToBlock) {
      blockMutation.mutate({ 
        id: customerToBlock.id, 
        block: !customerToBlock.isBlocked 
      });
    }
  };

  const getStatusBadge = (customer: User) => {
    if (customer.isBlocked) {
      return <Badge variant="destructive" data-testid={`badge-status-${customer.id}`}>Blocked</Badge>;
    }
    return <Badge variant="default" data-testid={`badge-status-${customer.id}`}>Active</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      buyer: "default",
      vendor: "secondary",
      admin: "outline",
    };
    return <Badge variant={variants[role] || "default"}>{role}</Badge>;
  };

  const filteredCustomers = customers;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-6 py-4">
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
              <h1 className="text-3xl font-bold">Customer Management</h1>
              <p className="text-muted-foreground">Manage all customers, view details, and control access</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Customers
            </CardTitle>
            <CardDescription>
              View and manage all registered customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-customers"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40" data-testid="select-role-filter">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40" data-testid="select-status-filter">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading customers...</div>
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No customers found</div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer) => (
                        <TableRow key={customer.id} data-testid={`row-customer-${customer.id}`}>
                          <TableCell className="font-medium" data-testid={`text-name-${customer.id}`}>
                            {customer.fullName}
                          </TableCell>
                          <TableCell data-testid={`text-email-${customer.id}`}>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              {customer.email}
                            </div>
                          </TableCell>
                          <TableCell data-testid={`text-phone-${customer.id}`}>
                            {customer.phone ? (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                {customer.phone}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>{getRoleBadge(customer.role)}</TableCell>
                          <TableCell>{getStatusBadge(customer)}</TableCell>
                          <TableCell data-testid={`text-joined-${customer.id}`}>
                            {new Date(customer.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewCustomer(customer.id)}
                                data-testid={`button-view-${customer.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant={customer.isBlocked ? "default" : "destructive"}
                                size="sm"
                                onClick={() => handleBlockToggle(customer)}
                                disabled={customer.role === "admin"}
                                data-testid={`button-block-${customer.id}`}
                              >
                                {customer.isBlocked ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <Ban className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-customer-details">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              Complete information about the customer
            </DialogDescription>
          </DialogHeader>
          {isLoadingDetails ? (
            <div className="text-center py-8 text-muted-foreground">Loading details...</div>
          ) : customerDetails ? (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium" data-testid="text-detail-name">{customerDetails.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <div data-testid="text-detail-role">{getRoleBadge(customerDetails.role)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium" data-testid="text-detail-email">{customerDetails.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium" data-testid="text-detail-phone">
                      {customerDetails.phone || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div data-testid="text-detail-status">{getStatusBadge(customerDetails)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Joined</p>
                    <p className="font-medium" data-testid="text-detail-joined">
                      {new Date(customerDetails.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {customerDetails.addresses && customerDetails.addresses.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Addresses ({customerDetails.addresses.length})
                  </h3>
                  <div className="space-y-3">
                    {customerDetails.addresses.map((address) => (
                      <Card key={address.id} data-testid={`card-address-${address.id}`}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <p className="font-medium">{address.label}</p>
                                {address.isDefault && <Badge variant="secondary">Default</Badge>}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {address.fullName} • {address.phone}
                              </p>
                              <p className="text-sm mt-1">
                                {address.addressLine1}
                                {address.addressLine2 && `, ${address.addressLine2}`}
                              </p>
                              <p className="text-sm">
                                {address.city}, {address.state} {address.postalCode}
                              </p>
                              <p className="text-sm">{address.country}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {customerDetails.orders && customerDetails.orders.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Order History ({customerDetails.orders.length})
                  </h3>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order Number</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customerDetails.orders.slice(0, 10).map((order) => (
                          <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                            <TableCell className="font-medium">{order.orderNumber}</TableCell>
                            <TableCell>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>₹{Number(order.totalAmount).toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{order.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={order.paymentStatus === 'paid' ? 'default' : 'destructive'}
                              >
                                {order.paymentStatus}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {customerDetails.orders.length > 10 && (
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      Showing 10 of {customerDetails.orders.length} orders
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Block/Unblock Confirmation Dialog */}
      <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <AlertDialogContent data-testid="dialog-block-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {customerToBlock?.isBlocked ? 'Unblock' : 'Block'} Customer
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {customerToBlock?.isBlocked ? 'unblock' : 'block'}{' '}
              <span className="font-semibold">{customerToBlock?.name}</span>?
              {!customerToBlock?.isBlocked && (
                <span className="block mt-2 text-destructive">
                  This will prevent the customer from accessing their account.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-block">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBlockToggle}
              className={customerToBlock?.isBlocked ? "" : "bg-destructive hover:bg-destructive/90"}
              data-testid="button-confirm-block"
            >
              {customerToBlock?.isBlocked ? 'Unblock' : 'Block'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
