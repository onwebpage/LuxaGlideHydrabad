import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { FolderTree, Plus, ArrowLeft, Trash2, Edit, Upload, ImageIcon, Crop } from "lucide-react";
import type { Category } from "@shared/schema";
import { ImageCropModal } from "@/components/ImageCropModal";

export default function AdminCategories() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({ name: "", description: "", image: "" });
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropFileName, setCropFileName] = useState("category.jpg");
  const [loadingExistingImage, setLoadingExistingImage] = useState(false);

  const createFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; image?: string }) =>
      apiRequest("POST", "/api/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Category Created", description: "Category has been created successfully" });
      setCreateDialogOpen(false);
      setFormData({ name: "", description: "", image: "" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create category", variant: "destructive" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Category> }) =>
      apiRequest("PUT", `/api/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Category Updated", description: "Category has been updated successfully" });
      setEditDialogOpen(false);
      setSelectedCategory(null);
      setFormData({ name: "", description: "", image: "" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update category", variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => apiRequest("DELETE", `/api/categories/${categoryId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Category Deleted", description: "Category has been deleted successfully" });
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete category", variant: "destructive" });
    },
  });

  const handleCreate = () => createCategoryMutation.mutate(formData);

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({ name: category.name, description: category.description || "", image: category.image || "" });
    setEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (selectedCategory) updateCategoryMutation.mutate({ id: selectedCategory.id, data: formData });
  };

  const handleDeleteClick = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) deleteCategoryMutation.mutate(categoryToDelete);
  };

  const openFileForCrop = (file: File) => {
    setCropFileName(file.name);
    setCropSrc(URL.createObjectURL(file));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    openFileForCrop(file);
    e.target.value = "";
  };

  /** Load an existing hosted image URL into the cropper by fetching it as a Blob */
  const handleEditExistingImage = async (imageUrl: string) => {
    setLoadingExistingImage(true);
    try {
      const res = await fetch(imageUrl, { credentials: "include" });
      if (!res.ok) throw new Error("Could not load image");
      const blob = await res.blob();
      const ext = imageUrl.split(".").pop()?.split("?")[0] || "jpg";
      const name = `category.${ext}`;
      setCropFileName(name);
      setCropSrc(URL.createObjectURL(blob));
    } catch {
      toast({ title: "Error", description: "Could not load image for editing", variant: "destructive" });
    } finally {
      setLoadingExistingImage(false);
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    setCropSrc(null);
    const fd = new FormData();
    fd.append("file", croppedFile);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      setFormData((prev) => ({ ...prev, image: data.url }));
      toast({ title: "Image Uploaded", description: "Image has been uploaded successfully" });
    } catch (error: any) {
      toast({ title: "Upload Failed", description: error.message || "Failed to upload image", variant: "destructive" });
    }
  };

  const ImagePreview = ({ url }: { url: string }) => (
    <div className="mt-2 relative group w-fit">
      <img
        src={url}
        alt="Category preview"
        className="h-32 rounded-md object-cover border"
        style={{ maxWidth: "100%" }}
      />
      <button
        type="button"
        onClick={() => handleEditExistingImage(url)}
        disabled={loadingExistingImage}
        className="
          absolute inset-0 flex items-center justify-center gap-1.5
          bg-black/50 text-white text-xs font-medium rounded-md
          opacity-0 group-hover:opacity-100 transition-opacity
          disabled:cursor-not-allowed
        "
        data-testid="button-edit-existing-image"
      >
        <Crop className="w-4 h-4" />
        {loadingExistingImage ? "Loading…" : "Edit Image"}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen py-8">
      <ImageCropModal
        imageSrc={cropSrc}
        originalFileName={cropFileName}
        onComplete={handleCropComplete}
        onCancel={() => setCropSrc(null)}
      />

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
                Category Management
              </h1>
              <p className="text-muted-foreground">Manage product categories and tags</p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-create-category">
              <Plus className="w-4 h-4 mr-2" />
              Create Category
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Categories ({categories.length})</CardTitle>
            <CardDescription>All product categories in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <FolderTree className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No categories found. Create your first category to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id} data-testid={`row-category-${category.id}`}>
                        <TableCell>
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-12 h-12 object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium" data-testid={`text-category-name-${category.id}`}>
                          {category.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                        <TableCell className="max-w-md truncate">
                          {category.description || "No description"}
                        </TableCell>
                        <TableCell>{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(category)}
                              data-testid={`button-edit-${category.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteClick(category.id)}
                              data-testid={`button-delete-${category.id}`}
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

      {/* ── Create Dialog ── */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
            <DialogDescription>Add a new product category</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., T-Shirts"
                data-testid="input-category-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Category description"
                data-testid="input-category-description"
              />
            </div>
            <div className="space-y-2">
              <Label>Category Image</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  data-testid="input-category-image"
                />
                <input
                  ref={createFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  data-testid="input-image-upload-create"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => createFileInputRef.current?.click()}
                  title="Upload image"
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
              {formData.image && <ImagePreview url={formData.image} />}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              data-testid="button-cancel-create"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.name || createCategoryMutation.isPending}
              data-testid="button-submit-create"
            >
              {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Category Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., T-Shirts"
                data-testid="input-edit-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Category description"
                data-testid="input-edit-description"
              />
            </div>
            <div className="space-y-2">
              <Label>Category Image</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  data-testid="input-edit-image"
                />
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  data-testid="input-image-upload-edit"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => editFileInputRef.current?.click()}
                  title="Upload new image"
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
              {formData.image && <ImagePreview url={formData.image} />}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!formData.name || updateCategoryMutation.isPending}
              data-testid="button-submit-edit"
            >
              {updateCategoryMutation.isPending ? "Updating..." : "Update Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? Products in this category will become uncategorized.
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
