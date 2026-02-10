import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AdminFilterSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    category: true,
    priceRange: true,
    brand: true,
    size: true,
    height: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/cms", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.filterSettings) {
          setSettings(data.filterSettings);
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/cms/filter-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Filter settings updated successfully",
        });
      } else {
        throw new Error("Failed to update settings");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update filter settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Filter Settings</h1>
        <p className="text-muted-foreground">
          Control which filters are visible on the home page
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Home Page Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="category">Category Filter</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to filter products by category
              </p>
            </div>
            <Switch
              id="category"
              checked={settings.category}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, category: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="priceRange">Price Range Filter</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to filter products by price range
              </p>
            </div>
            <Switch
              id="priceRange"
              checked={settings.priceRange}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, priceRange: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="brand">Brand Filter</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to search and filter by brand name
              </p>
            </div>
            <Switch
              id="brand"
              checked={settings.brand}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, brand: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="size">Size Filter</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to filter products by size (XS, S, M, L, XL, XXL)
              </p>
            </div>
            <Switch
              id="size"
              checked={settings.size}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, size: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="height">Height Filter</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to filter products by height range
              </p>
            </div>
            <Switch
              id="height"
              checked={settings.height}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, height: checked })
              }
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
