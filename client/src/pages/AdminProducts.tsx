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
import { Package, Search, Upload, ArrowLeft, Trash2, Edit, CheckCircle, XCircle, Eye } from "lucide-react";
import type { Product, Category, Vendor } from "@shared/schema";

export default function AdminProducts() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const { data: products = [], isLoading, refetch } = useQuery<Product[]>({
    queryKey: ["/api/admin/products", { status: statusFilter !== "all" ? statusFilter : undefined, search: search || undefined }],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
  });

  const approveProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      return await apiRequest("POST", `/api/admin/products/${productId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      toast({
        title: "Product Approved",
        description: "Product has been approved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve product",
        variant: "destructive",
      });
    },
  });

  const publishProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      return await apiRequest("POST", `/api/admin/products/${productId}/publish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      toast({
        title: "Product Published",
        description: "Product has been published successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to publish product",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      return await apiRequest("DELETE", `/api/admin/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully",
      });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const filteredProducts = products.filter(product => {
    const matchesCategory = categoryFilter === "all" || product.categoryId === categoryFilter;
    return matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      pending: { className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300", label: "Pending" },
      approved: { className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300", label: "Approved" },
      published: { className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300", label: "Published" },
    };
    const variant = variants[status] || { className: "", label: status };
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete);
    }
  };

  const getVendorName = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor?.businessName || "Unknown";
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find(c => c.id === categoryId);
    return category?.name || "Unknown";
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/dashboard/admin")}
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-4xl font-semibold mb-2" data-testid="text-title">
                Product Management
              </h1>
              <p className="text-muted-foreground">
                Manage and approve products from vendors
              </p>
            </div>
            <Button
              onClick={() => setLocation("/dashboard/admin/products/bulk-upload")}
              data-testid="button-bulk-upload"
            >
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Search Products</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products ({filteredProducts.length})</CardTitle>
            <CardDescription>Review and manage all products in the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading products...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No products found matching your filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                        <TableCell className="font-medium" data-testid={`text-product-name-${product.id}`}>
                          {product.name}
                        </TableCell>
                        <TableCell>{getVendorName(product.vendorId)}</TableCell>
                        <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                        <TableCell>₹{Number(product.price).toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={product.stock < 10 ? "text-orange-600" : ""}>
                            {product.stock}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(product.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewProduct(product)}
                              data-testid={`button-view-${product.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {product.status === "pending" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => approveProductMutation.mutate(product.id)}
                                disabled={approveProductMutation.isPending}
                                data-testid={`button-approve-${product.id}`}
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </Button>
                            )}
                            {product.status === "approved" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => publishProductMutation.mutate(product.id)}
                                disabled={publishProductMutation.isPending}
                                data-testid={`button-publish-${product.id}`}
                              >
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteClick(product.id)}
                              data-testid={`button-delete-${product.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
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
      </div>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>View full product information</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Product Name</Label>
                  <p className="font-medium">{selectedProduct.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedProduct.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Vendor</Label>
                  <p className="font-medium">{getVendorName(selectedProduct.vendorId)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <p className="font-medium">{getCategoryName(selectedProduct.categoryId)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Price</Label>
                  <p className="font-medium">₹{Number(selectedProduct.price).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Stock</Label>
                  <p className="font-medium">{selectedProduct.stock}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">MOQ</Label>
                  <p className="font-medium">{selectedProduct.moq}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fabric</Label>
                  <p className="font-medium">{selectedProduct.fabric || "N/A"}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1">{selectedProduct.description}</p>
              </div>
              {selectedProduct.images && Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Images</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {(selectedProduct.images as string[]).map((image, idx) => (
                      <img
                        key={idx}
                        src={image}
                        alt={`Product ${idx + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
