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
import { getAuthToken } from "@/lib/auth-context";
import { 
  Store, 
  Search, 
  ArrowLeft, 
  Trash2, 
  Eye, 
  Mail, 
  Phone, 
  MapPin, 
  Package,
  FileText,
  Building,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck
} from "lucide-react";
import type { Vendor, User, Product } from "@shared/schema";

interface VendorWithUser extends Vendor {
  user?: User;
  products?: Product[];
}

export default function AdminVendors() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [kycFilter, setKycFilter] = useState<string>("all");
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<{ id: string; name: string } | null>(null);

  const { data: vendors = [], isLoading } = useQuery<Vendor[]>({
    queryKey: ["/api/admin/vendors", { kycStatus: kycFilter !== "all" ? kycFilter : undefined }],
  });

  const { data: vendorDetails, isLoading: isLoadingDetails } = useQuery<VendorWithUser | null>({
    queryKey: ["/api/admin/vendors", "detail", selectedVendorId],
    enabled: !!selectedVendorId && viewDialogOpen,
    queryFn: async () => {
      const token = getAuthToken();
      const response = await fetch(`/api/admin/vendors/${selectedVendorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch vendor details");
      const data = await response.json();
      return data || null;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (vendorId: string) => {
      const token = getAuthToken();
      const response = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete vendor');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendors"] });
      toast({
        title: "Vendor Deleted",
        description: "The vendor account and all associated data has been deleted.",
      });
      setDeleteDialogOpen(false);
      setVendorToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete vendor",
        variant: "destructive",
      });
    },
  });

  const toggleApproveMutation = useMutation({
    mutationFn: async ({ vendorId, approved }: { vendorId: string; approved: boolean }) => {
      const token = getAuthToken();
      const response = await fetch(`/api/admin/vendors/${vendorId}/approve`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approved }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update approval status');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendors"] });
      if (selectedVendorId) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/vendors", "detail", selectedVendorId] });
      }
      toast({
        title: data.vendor.adminApproved ? "Vendor Approved" : "Approval Revoked",
        description: `Vendor ${data.vendor.businessName} has been ${data.vendor.adminApproved ? 'approved' : 'unapproved'}.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleViewVendor = (vendorId: string) => {
    setSelectedVendorId(vendorId);
    setViewDialogOpen(true);
  };

  const handleDeleteVendor = (vendor: Vendor) => {
    setVendorToDelete({
      id: vendor.id,
      name: vendor.businessName,
    });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (vendorToDelete) {
      deleteMutation.mutate(vendorToDelete.id);
    }
  };

  const getKycStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case "submitted":
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <Clock className="w-3 h-3 mr-1" />
            Under Review
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch = 
      vendor.businessName.toLowerCase().includes(search.toLowerCase()) ||
      (vendor.gstNumber && vendor.gstNumber.toLowerCase().includes(search.toLowerCase()));
    
    const matchesKyc = kycFilter === "all" || vendor.kycStatus === kycFilter;
    
    return matchesSearch && matchesKyc;
  });

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-6">
        <div className="mb-6 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation("/admin")}
            data-testid="button-back-admin"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Vendor Management
                </CardTitle>
                <CardDescription>
                  View vendor details, KYC status, and manage vendor accounts
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by business name or GST..."
                    className="pl-10 w-full sm:w-64"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    data-testid="input-search-vendors"
                  />
                </div>
                <Select value={kycFilter} onValueChange={setKycFilter}>
                  <SelectTrigger className="w-full sm:w-40" data-testid="select-kyc-filter">
                    <SelectValue placeholder="KYC Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="submitted">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">
                Loading vendors...
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No vendors found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>GST Number</TableHead>
                      <TableHead>Business Address</TableHead>
                      <TableHead>KYC Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVendors.map((vendor) => (
                      <TableRow key={vendor.id} data-testid={`row-vendor-${vendor.id}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-muted-foreground" />
                            {vendor.businessName}
                          </div>
                        </TableCell>
                        <TableCell>
                          {vendor.gstNumber || (
                            <span className="text-muted-foreground">Not provided</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {vendor.businessAddress || (
                              <span className="text-muted-foreground">Not provided</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getKycStatusBadge(vendor.kycStatus || "pending")}
                            {vendor.adminApproved && (
                              <Badge variant="outline" className="border-green-500 text-green-600">
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                Admin Approved
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewVendor(vendor.id)}
                              data-testid={`button-view-vendor-${vendor.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteVendor(vendor)}
                              className="text-destructive hover:text-destructive"
                              data-testid={`button-delete-vendor-${vendor.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
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

        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Vendor Details
              </DialogTitle>
              <DialogDescription>
                Complete information about the vendor account
              </DialogDescription>
            </DialogHeader>
            
            {isLoadingDetails ? (
              <div className="py-8 text-center text-muted-foreground">
                Loading vendor details...
              </div>
            ) : vendorDetails ? (
              <div className="space-y-6 mt-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                      Business Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Building className="w-4 h-4 mt-1 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Business Name</p>
                          <p className="font-medium">{vendorDetails.businessName}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FileText className="w-4 h-4 mt-1 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">GST Number</p>
                          <p className="font-medium">
                            {vendorDetails.gstNumber || "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Business Address</p>
                          <p className="font-medium">
                            {vendorDetails.businessAddress || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                      Account Information
                    </h4>
                    <div className="space-y-3">
                      {vendorDetails.user && (
                        <>
                          <div className="flex items-start gap-3">
                            <Mail className="w-4 h-4 mt-1 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Email</p>
                              <p className="font-medium">{vendorDetails.user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Phone className="w-4 h-4 mt-1 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Phone</p>
                              <p className="font-medium">
                                {vendorDetails.user.phone || "Not provided"}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">KYC Status</p>
                        <div className="flex items-center gap-2">
                          {getKycStatusBadge(vendorDetails.kycStatus || "pending")}
                          {vendorDetails.adminApproved && (
                            <Badge variant="outline" className="border-green-500 text-green-600">
                              <ShieldCheck className="w-3 h-3 mr-1" />
                              Admin Approved
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border">
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      Administrator Approval
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pre-approved vendors can bypass KYC and add products directly.
                    </p>
                  </div>
                  <Button
                    variant={vendorDetails.adminApproved ? "outline" : "default"}
                    size="sm"
                    onClick={() => toggleApproveMutation.mutate({ 
                      vendorId: vendorDetails.id, 
                      approved: !vendorDetails.adminApproved 
                    })}
                    disabled={toggleApproveMutation.isPending}
                  >
                    {vendorDetails.adminApproved ? "Revoke Approval" : "Approve Vendor"}
                  </Button>
                </div>

                {vendorDetails.kycDocuments && vendorDetails.kycDocuments.length > 0 && (
                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                      KYC Documents
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {vendorDetails.kycDocuments.map((doc, index) => (
                        <a
                          key={index}
                          href={doc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 rounded-md border hover:bg-accent transition-colors"
                        >
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm truncate">Document {index + 1}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {vendorDetails.products && vendorDetails.products.length > 0 && (
                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Products ({vendorDetails.products.length})
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {vendorDetails.products.slice(0, 10).map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-2 rounded-md bg-secondary/50"
                        >
                          <span className="font-medium truncate">{product.name}</span>
                          <Badge variant={product.isActive ? "default" : "secondary"}>
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      ))}
                      {vendorDetails.products.length > 10 && (
                        <p className="text-sm text-muted-foreground text-center pt-2">
                          And {vendorDetails.products.length - 10} more products...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setViewDialogOpen(false);
                      setSelectedVendorId(null);
                    }}
                  >
                    Close
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (vendorDetails) {
                        setViewDialogOpen(false);
                        handleDeleteVendor(vendorDetails);
                      }
                    }}
                    data-testid="button-delete-from-details"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Vendor
                  </Button>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent data-testid="dialog-delete-vendor">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Vendor Account</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the vendor "{vendorToDelete?.name}"?
                This will permanently remove their account, all their products, and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                disabled={deleteMutation.isPending}
                data-testid="button-cancel-delete-vendor"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="bg-destructive hover:bg-destructive/90"
                data-testid="button-confirm-delete-vendor"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Vendor"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
