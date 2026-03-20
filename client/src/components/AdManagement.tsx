import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { ImageCropModal } from "@/components/ImageCropModal";

interface Ad {
  id: string;
  title: string;
  description: string | null;
  bannerImage: string;
  link: string;
  position: string;
  textColor: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
}

export default function AdManagement() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const { toast } = useToast();
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropFileName, setCropFileName] = useState("banner.jpg");
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const pendingFormRef = useRef<HTMLFormElement | null>(null);

  const { data: ads = [], isLoading } = useQuery<Ad[]>({
    queryKey: ["/api/admin/ads"],
    queryFn: async () => {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/ads", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch ads");
      return res.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create ad");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
      setIsOpen(false);
      setEditingAd(null);
      toast({ title: "Ad created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/admin/ads/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update ad");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
      setIsOpen(false);
      setEditingAd(null);
      toast({ title: "Ad updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/admin/ads/${id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to toggle ad");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
      toast({ title: "Ad status updated" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/admin/ads/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete ad");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
      toast({ title: "Ad deleted successfully" });
    }
  });

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropFileName(file.name);
    setCropSrc(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleCropComplete = (file: File) => {
    setCroppedFile(file);
    setCroppedPreview(URL.createObjectURL(file));
    setCropSrc(null);
  };

  const buildFormData = (form: HTMLFormElement): FormData => {
    const formData = new FormData(form);
    const positionSelect = form.querySelector('select[name="position"]') as HTMLSelectElement;
    if (positionSelect?.value) formData.set('position', positionSelect.value);
    if (croppedFile) formData.set('bannerImage', croppedFile, croppedFile.name);
    return formData;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = buildFormData(form);
    if (editingAd) {
      updateMutation.mutate({ id: editingAd.id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <ImageCropModal
        imageSrc={cropSrc}
        originalFileName={cropFileName}
        onComplete={handleCropComplete}
        onCancel={() => setCropSrc(null)}
      />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ad Management</h2>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) { setEditingAd(null); setCroppedFile(null); setCroppedPreview(null); }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Ad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAd ? "Edit Ad" : "Create New Ad"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Ad Title</Label>
                <Input 
                  id="title" 
                  name="title" 
                  required 
                  defaultValue={editingAd?.title}
                  placeholder="Summer Sale 2024" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  defaultValue={editingAd?.description || ""}
                  placeholder="Get up to 50% off on all products" 
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link">Ad Link (URL)</Label>
                <Input 
                  id="link" 
                  name="link" 
                  type="url" 
                  required 
                  defaultValue={editingAd?.link}
                  placeholder="https://example.com/sale" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Ad Position</Label>
                <select 
                  name="position" 
                  defaultValue={editingAd?.position || "home_top"}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="home_top">Home - Top</option>
                  <option value="home_middle">Home - Middle</option>
                  <option value="home_bottom">Home - Bottom</option>
                  <option value="products_top">Products - Top</option>
                  <option value="products_sidebar">Products - Sidebar</option>
                  <option value="product_detail">Product Detail</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input 
                  id="displayOrder" 
                  name="displayOrder" 
                  type="number" 
                  defaultValue={editingAd?.displayOrder || 0}
                  placeholder="0" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="textColor">Text Color</Label>
                <Input 
                  id="textColor" 
                  name="textColor" 
                  type="color" 
                  defaultValue={editingAd?.textColor || "#ffffff"}
                  className="h-10 w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bannerImage">Banner Image</Label>
                <Input
                  id="bannerImage"
                  type="file"
                  accept="image/*"
                  required={!editingAd && !croppedFile}
                  onChange={handleBannerFileChange}
                />
                {(croppedPreview || editingAd?.bannerImage) && (
                  <div className="mt-2">
                    <img
                      src={croppedPreview || editingAd?.bannerImage}
                      alt="Banner preview"
                      className="h-20 object-cover rounded"
                    />
                    {croppedPreview && <p className="text-xs text-muted-foreground mt-1">Cropped image ready</p>}
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingAd ? "Update Ad" : "Create Ad"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Ads</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banner</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading ads...</TableCell>
                </TableRow>
              ) : ads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">No ads found</TableCell>
                </TableRow>
              ) : (
                ads.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell>
                      <img src={ad.bannerImage} alt={ad.title} className="h-12 w-20 object-cover rounded" />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ad.title}</p>
                        {ad.description && <p className="text-xs text-muted-foreground">{ad.description}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{ad.position.replace(/_/g, " ")}</TableCell>
                    <TableCell>{ad.displayOrder}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${ad.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {ad.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => toggleMutation.mutate(ad.id)}
                      >
                        {ad.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setEditingAd(ad);
                          setCroppedFile(null);
                          setCroppedPreview(null);
                          setIsOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this ad?")) {
                            deleteMutation.mutate(ad.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
