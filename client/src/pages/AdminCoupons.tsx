import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { Ticket, Search, ArrowLeft, Trash2, Edit, Plus, Percent, IndianRupee } from "lucide-react";
import type { Coupon } from "@shared/schema";

export default function AdminCoupons() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    minOrderValue: "",
    maxUses: "",
    isActive: true,
    startsAt: "",
    expiresAt: "",
  });

  const { data: coupons = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ["/api/admin/coupons", { isActive: statusFilter !== "all" ? statusFilter : undefined, search: search || undefined }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("isActive", statusFilter);
      if (search) params.append("search", search);
      
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/coupons?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch coupons");
      return response.json();
    },
  });

  const createCouponMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...data,
          discountValue: parseFloat(data.discountValue),
          minOrderValue: data.minOrderValue ? parseFloat(data.minOrderValue) : null,
          maxUses: data.maxUses ? parseInt(data.maxUses) : null,
          startsAt: data.startsAt || null,
          expiresAt: data.expiresAt || null,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create coupon");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Coupon created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      setCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateCouponMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...data,
          discountValue: parseFloat(data.discountValue),
          minOrderValue: data.minOrderValue ? parseFloat(data.minOrderValue) : null,
          maxUses: data.maxUses ? parseInt(data.maxUses) : null,
          startsAt: data.startsAt || null,
          expiresAt: data.expiresAt || null,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update coupon");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Coupon updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      setEditDialogOpen(false);
      setSelectedCoupon(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const toggleCouponMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/coupons/${id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to toggle coupon status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      toast({ title: "Success", description: "Coupon status updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to toggle coupon status", variant: "destructive" });
    },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete coupon");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Coupon deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      setDeleteDialogOpen(false);
      setCouponToDelete(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete coupon", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minOrderValue: "",
      maxUses: "",
      isActive: true,
      startsAt: "",
      expiresAt: "",
    });
  };

  const handleEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || "",
      discountType: coupon.discountType as "percentage" | "fixed",
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue || "",
      maxUses: coupon.maxUses?.toString() || "",
      isActive: coupon.isActive ?? true,
      startsAt: coupon.startsAt ? new Date(coupon.startsAt).toISOString().slice(0, 16) : "",
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : "",
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setCouponToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleCreateSubmit = () => {
    if (!formData.code || !formData.name || !formData.discountValue) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    createCouponMutation.mutate(formData);
  };

  const handleUpdateSubmit = () => {
    if (!selectedCoupon || !formData.code || !formData.name || !formData.discountValue) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    updateCouponMutation.mutate({ id: selectedCoupon.id, data: formData });
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", { 
      day: "2-digit", 
      month: "short", 
      year: "numeric" 
    });
  };

  const isCouponActive = (coupon: Coupon) => {
    if (!coupon.isActive) return false;
    const now = new Date();
    if (coupon.startsAt && new Date(coupon.startsAt) > now) return false;
    if (coupon.expiresAt && new Date(coupon.expiresAt) < now) return false;
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return false;
    return true;
  };

  const CouponForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Coupon Code *</Label>
          <Input
            id="code"
            placeholder="e.g., SAVE20"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            data-testid="input-coupon-code"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Coupon Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Summer Sale"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            data-testid="input-coupon-name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe the coupon offer..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          data-testid="input-coupon-description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="discountType">Discount Type</Label>
          <Select
            value={formData.discountType}
            onValueChange={(value: "percentage" | "fixed") => setFormData({ ...formData, discountType: value })}
          >
            <SelectTrigger data-testid="select-discount-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage (%)</SelectItem>
              <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="discountValue">Discount Value *</Label>
          <Input
            id="discountValue"
            type="number"
            placeholder={formData.discountType === "percentage" ? "e.g., 20" : "e.g., 500"}
            value={formData.discountValue}
            onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
            data-testid="input-discount-value"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minOrderValue">Min Order Value (₹)</Label>
          <Input
            id="minOrderValue"
            type="number"
            placeholder="Optional"
            value={formData.minOrderValue}
            onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
            data-testid="input-min-order"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxUses">Max Uses</Label>
          <Input
            id="maxUses"
            type="number"
            placeholder="Unlimited"
            value={formData.maxUses}
            onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
            data-testid="input-max-uses"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startsAt">Starts At</Label>
          <Input
            id="startsAt"
            type="datetime-local"
            value={formData.startsAt}
            onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
            data-testid="input-starts-at"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiresAt">Expires At</Label>
          <Input
            id="expiresAt"
            type="datetime-local"
            value={formData.expiresAt}
            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
            data-testid="input-expires-at"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="isActive">Active</Label>
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          data-testid="switch-is-active"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation("/dashboard/admin")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-serif text-4xl font-semibold">Coupon Management</h1>
            <p className="text-muted-foreground">Create and manage discount coupons for products</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search coupons..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                    data-testid="input-search"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]" data-testid="select-status-filter">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Coupons</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => { resetForm(); setCreateDialogOpen(true); }} data-testid="button-create-coupon">
                <Plus className="w-4 h-4 mr-2" />
                Create Coupon
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : coupons.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No coupons found</p>
                <p className="text-sm">Create your first coupon to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Min Order</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map((coupon) => (
                      <TableRow key={coupon.id} data-testid={`row-coupon-${coupon.id}`}>
                        <TableCell>
                          <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                            {coupon.code}
                          </code>
                        </TableCell>
                        <TableCell className="font-medium">{coupon.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {coupon.discountType === "percentage" ? (
                              <>
                                <Percent className="w-3 h-3" />
                                {coupon.discountValue}%
                              </>
                            ) : (
                              <>
                                <IndianRupee className="w-3 h-3" />
                                {coupon.discountValue}
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {coupon.minOrderValue ? `₹${coupon.minOrderValue}` : "-"}
                        </TableCell>
                        <TableCell>
                          {coupon.usedCount} / {coupon.maxUses ?? "∞"}
                        </TableCell>
                        <TableCell>{formatDate(coupon.expiresAt)}</TableCell>
                        <TableCell>
                          {isCouponActive(coupon) ? (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Switch
                              checked={coupon.isActive ?? false}
                              onCheckedChange={() => toggleCouponMutation.mutate(coupon.id)}
                              data-testid={`switch-toggle-${coupon.id}`}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(coupon)}
                              data-testid={`button-edit-${coupon.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(coupon.id)}
                              data-testid={`button-delete-${coupon.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
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

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Coupon</DialogTitle>
            <DialogDescription>
              Create a new discount coupon that can be applied to products
            </DialogDescription>
          </DialogHeader>
          <CouponForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} data-testid="button-cancel-create">
              Cancel
            </Button>
            <Button onClick={handleCreateSubmit} disabled={createCouponMutation.isPending} data-testid="button-submit-create">
              {createCouponMutation.isPending ? "Creating..." : "Create Coupon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>
              Update the coupon details
            </DialogDescription>
          </DialogHeader>
          <CouponForm isEdit />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} data-testid="button-cancel-edit">
              Cancel
            </Button>
            <Button onClick={handleUpdateSubmit} disabled={updateCouponMutation.isPending} data-testid="button-submit-edit">
              {updateCouponMutation.isPending ? "Updating..." : "Update Coupon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this coupon? This action cannot be undone.
              Products that have this coupon applied will no longer show the discount.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => couponToDelete && deleteCouponMutation.mutate(couponToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteCouponMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
