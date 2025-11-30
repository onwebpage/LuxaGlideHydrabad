import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { 
  useAdminCmsSettings, 
  useUpdateSiteMeta, 
  useUpdateHero, 
  useUpdateFeaturedCollections,
  useUpdateTestimonials,
  useUpdatePromotions,
  useUpdateFooter,
  useUpdateHomepageProducts
} from "@/hooks/use-cms-settings";
import { 
  Settings, 
  Image, 
  FileText, 
  MessageSquare, 
  Tag, 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2,
  Upload,
  Star,
  Link as LinkIcon,
  Package,
  Search,
  GripVertical,
  X
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { FeaturedCollection, Testimonial, PromotionBanner, SocialLink, HomepageFeaturedProduct, Product } from "@shared/schema";

export default function AdminSiteSettings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: cmsSettings, isLoading, refetch } = useAdminCmsSettings();
  const updateSiteMeta = useUpdateSiteMeta();
  const updateHero = useUpdateHero();
  const updateFeaturedCollections = useUpdateFeaturedCollections();
  const updateTestimonials = useUpdateTestimonials();
  const updatePromotions = useUpdatePromotions();
  const updateFooter = useUpdateFooter();
  const updateHomepageProducts = useUpdateHomepageProducts();
  
  const [productSearch, setProductSearch] = useState("");
  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const [siteMeta, setSiteMeta] = useState({
    siteName: "",
    tagline: "",
    logo: "",
    favicon: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  });

  const [hero, setHero] = useState({
    headline: "",
    subheadline: "",
    ctaText: "",
    ctaLink: "",
    backgroundImage: "",
    overlayOpacity: 50,
    isVisible: true,
  });

  const [featuredCollections, setFeaturedCollections] = useState<{
    sectionTitle: string;
    collections: FeaturedCollection[];
  }>({
    sectionTitle: "",
    collections: [],
  });

  const [testimonials, setTestimonials] = useState<{
    sectionTitle: string;
    testimonials: Testimonial[];
  }>({
    sectionTitle: "",
    testimonials: [],
  });

  const [promotions, setPromotions] = useState<{
    banners: PromotionBanner[];
  }>({
    banners: [],
  });

  const [footer, setFooter] = useState({
    showNewsletter: true,
    newsletterTitle: "",
    newsletterDescription: "",
    copyrightText: "",
    socialLinks: [] as SocialLink[],
  });

  const [homepageProducts, setHomepageProducts] = useState<{
    sectionTitle: string;
    autoFallback: boolean;
    maxProducts: number;
    products: HomepageFeaturedProduct[];
  }>({
    sectionTitle: "Products For You",
    autoFallback: true,
    maxProducts: 12,
    products: [],
  });

  useEffect(() => {
    const adminAuth = localStorage.getItem("adminAuth");
    if (!adminAuth || adminAuth !== "true") {
      setLocation("/admin-login");
    }
  }, [setLocation]);

  useEffect(() => {
    if (cmsSettings) {
      setSiteMeta(cmsSettings.siteMeta);
      setHero({
        ...cmsSettings.hero,
        overlayOpacity: cmsSettings.hero.overlayOpacity ?? 50,
        isVisible: cmsSettings.hero.isVisible ?? true,
      });
      setFeaturedCollections(cmsSettings.featuredCollections);
      setTestimonials(cmsSettings.testimonials);
      setPromotions(cmsSettings.promotions);
      setFooter({
        ...cmsSettings.footer,
        socialLinks: cmsSettings.footer.socialLinks ?? [],
      });
      if (cmsSettings.homepageProducts) {
        setHomepageProducts({
          sectionTitle: cmsSettings.homepageProducts.sectionTitle || "Products For You",
          autoFallback: cmsSettings.homepageProducts.autoFallback ?? true,
          maxProducts: cmsSettings.homepageProducts.maxProducts || 12,
          products: cmsSettings.homepageProducts.products || [],
        });
      }
    }
  }, [cmsSettings]);

  const handleSaveSiteMeta = async () => {
    try {
      await updateSiteMeta.mutateAsync(siteMeta);
      toast({ title: "Success", description: "Site settings saved successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save site settings", variant: "destructive" });
    }
  };

  const handleSaveHero = async () => {
    try {
      await updateHero.mutateAsync(hero);
      toast({ title: "Success", description: "Hero section saved successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save hero section", variant: "destructive" });
    }
  };

  const handleSaveCollections = async () => {
    try {
      await updateFeaturedCollections.mutateAsync(featuredCollections);
      toast({ title: "Success", description: "Featured collections saved successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save featured collections", variant: "destructive" });
    }
  };

  const handleSaveTestimonials = async () => {
    try {
      await updateTestimonials.mutateAsync(testimonials);
      toast({ title: "Success", description: "Testimonials saved successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save testimonials", variant: "destructive" });
    }
  };

  const handleSavePromotions = async () => {
    try {
      await updatePromotions.mutateAsync(promotions);
      toast({ title: "Success", description: "Promotions saved successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save promotions", variant: "destructive" });
    }
  };

  const handleSaveFooter = async () => {
    try {
      await updateFooter.mutateAsync(footer);
      toast({ title: "Success", description: "Footer settings saved successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save footer settings", variant: "destructive" });
    }
  };

  const handleSaveHomepageProducts = async () => {
    try {
      await updateHomepageProducts.mutateAsync(homepageProducts);
      toast({ title: "Success", description: "Homepage products saved successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save homepage products", variant: "destructive" });
    }
  };

  const addHomepageProduct = (productId: string) => {
    const exists = homepageProducts.products.some(p => p.productId === productId);
    if (exists) {
      toast({ title: "Info", description: "Product already added" });
      return;
    }
    setHomepageProducts(prev => ({
      ...prev,
      products: [
        ...prev.products,
        { productId, displayOrder: prev.products.length, isVisible: true }
      ],
    }));
    setProductSearch("");
  };

  const removeHomepageProduct = (productId: string) => {
    setHomepageProducts(prev => ({
      ...prev,
      products: prev.products
        .filter(p => p.productId !== productId)
        .map((p, idx) => ({ ...p, displayOrder: idx })),
    }));
  };

  const moveHomepageProduct = (productId: string, direction: "up" | "down") => {
    setHomepageProducts(prev => {
      const products = [...prev.products];
      const idx = products.findIndex(p => p.productId === productId);
      if (idx === -1) return prev;
      
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= products.length) return prev;
      
      [products[idx], products[newIdx]] = [products[newIdx], products[idx]];
      return {
        ...prev,
        products: products.map((p, i) => ({ ...p, displayOrder: i })),
      };
    });
  };

  const getProductById = (productId: string): Product | undefined => {
    return allProducts.find(p => p.id === productId);
  };

  const filteredProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku?.toLowerCase().includes(productSearch.toLowerCase())
  ).slice(0, 10);

  const addCollection = () => {
    setFeaturedCollections(prev => ({
      ...prev,
      collections: [
        ...prev.collections,
        { id: Date.now().toString(), title: "", description: "", image: "", link: "", isVisible: true }
      ],
    }));
  };

  const removeCollection = (id: string) => {
    setFeaturedCollections(prev => ({
      ...prev,
      collections: prev.collections.filter(c => c.id !== id),
    }));
  };

  const updateCollection = (id: string, field: keyof FeaturedCollection, value: any) => {
    setFeaturedCollections(prev => ({
      ...prev,
      collections: prev.collections.map(c => c.id === id ? { ...c, [field]: value } : c),
    }));
  };

  const addTestimonial = () => {
    setTestimonials(prev => ({
      ...prev,
      testimonials: [
        ...prev.testimonials,
        { id: Date.now().toString(), customerName: "", customerRole: "", customerImage: "", quote: "", rating: 5, isVisible: true }
      ],
    }));
  };

  const removeTestimonial = (id: string) => {
    setTestimonials(prev => ({
      ...prev,
      testimonials: prev.testimonials.filter(t => t.id !== id),
    }));
  };

  const updateTestimonial = (id: string, field: keyof Testimonial, value: any) => {
    setTestimonials(prev => ({
      ...prev,
      testimonials: prev.testimonials.map(t => t.id === id ? { ...t, [field]: value } : t),
    }));
  };

  const addBanner = () => {
    setPromotions(prev => ({
      banners: [
        ...prev.banners,
        { id: Date.now().toString(), title: "", description: "", image: "", link: "", backgroundColor: "", textColor: "", isVisible: true }
      ],
    }));
  };

  const removeBanner = (id: string) => {
    setPromotions(prev => ({
      banners: prev.banners.filter(b => b.id !== id),
    }));
  };

  const updateBanner = (id: string, field: keyof PromotionBanner, value: any) => {
    setPromotions(prev => ({
      banners: prev.banners.map(b => b.id === id ? { ...b, [field]: value } : b),
    }));
  };

  const addSocialLink = () => {
    setFooter(prev => ({
      ...prev,
      socialLinks: [
        ...prev.socialLinks,
        { platform: "", url: "", isVisible: true }
      ],
    }));
  };

  const removeSocialLink = (index: number) => {
    setFooter(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  };

  const updateSocialLink = (index: number, field: keyof SocialLink, value: any) => {
    setFooter(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) => i === index ? { ...link, [field]: value } : link),
    }));
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onUpload: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onUpload(data.url);
        toast({ title: "Success", description: "Image uploaded successfully" });
      } else {
        toast({ title: "Error", description: "Failed to upload image", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload image", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-6">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="outline" onClick={() => setLocation("/dashboard/admin")} data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="font-serif text-4xl font-semibold" data-testid="text-title">Site Settings</h1>
            <p className="text-muted-foreground">Customize your website appearance and content</p>
          </div>
        </div>

        <Tabs defaultValue="branding" className="space-y-6">
          <TabsList className="flex-wrap gap-2">
            <TabsTrigger value="branding" data-testid="tab-branding">
              <Settings className="w-4 h-4 mr-2" />
              Branding & SEO
            </TabsTrigger>
            <TabsTrigger value="hero" data-testid="tab-hero">
              <Image className="w-4 h-4 mr-2" />
              Hero Section
            </TabsTrigger>
            <TabsTrigger value="collections" data-testid="tab-collections">
              <FileText className="w-4 h-4 mr-2" />
              Featured Collections
            </TabsTrigger>
            <TabsTrigger value="testimonials" data-testid="tab-testimonials">
              <MessageSquare className="w-4 h-4 mr-2" />
              Testimonials
            </TabsTrigger>
            <TabsTrigger value="promotions" data-testid="tab-promotions">
              <Tag className="w-4 h-4 mr-2" />
              Promotions
            </TabsTrigger>
            <TabsTrigger value="footer" data-testid="tab-footer">
              <LinkIcon className="w-4 h-4 mr-2" />
              Footer
            </TabsTrigger>
            <TabsTrigger value="homepage-products" data-testid="tab-homepage-products">
              <Package className="w-4 h-4 mr-2" />
              Homepage Products
            </TabsTrigger>
          </TabsList>

          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle>Branding & SEO Settings</CardTitle>
                <CardDescription>Configure your site's identity and search engine optimization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={siteMeta.siteName}
                      onChange={(e) => setSiteMeta(prev => ({ ...prev, siteName: e.target.value }))}
                      placeholder="Your Site Name"
                      data-testid="input-site-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      value={siteMeta.tagline || ""}
                      onChange={(e) => setSiteMeta(prev => ({ ...prev, tagline: e.target.value }))}
                      placeholder="Your site tagline"
                      data-testid="input-tagline"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="logo"
                        value={siteMeta.logo || ""}
                        onChange={(e) => setSiteMeta(prev => ({ ...prev, logo: e.target.value }))}
                        placeholder="/uploads/logo.png"
                        data-testid="input-logo"
                      />
                      <label className="cursor-pointer">
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, (url) => setSiteMeta(prev => ({ ...prev, logo: url })))}
                        />
                        <Button type="button" variant="outline" size="icon" asChild>
                          <span><Upload className="w-4 h-4" /></span>
                        </Button>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="favicon">Favicon URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="favicon"
                        value={siteMeta.favicon || ""}
                        onChange={(e) => setSiteMeta(prev => ({ ...prev, favicon: e.target.value }))}
                        placeholder="/uploads/favicon.ico"
                        data-testid="input-favicon"
                      />
                      <label className="cursor-pointer">
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, (url) => setSiteMeta(prev => ({ ...prev, favicon: url })))}
                        />
                        <Button type="button" variant="outline" size="icon" asChild>
                          <span><Upload className="w-4 h-4" /></span>
                        </Button>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={siteMeta.contactEmail || ""}
                      onChange={(e) => setSiteMeta(prev => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder="contact@example.com"
                      data-testid="input-contact-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      value={siteMeta.contactPhone || ""}
                      onChange={(e) => setSiteMeta(prev => ({ ...prev, contactPhone: e.target.value }))}
                      placeholder="+1 234 567 8900"
                      data-testid="input-contact-phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={siteMeta.address || ""}
                      onChange={(e) => setSiteMeta(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="City, Country"
                      data-testid="input-address"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="seoTitle">SEO Title</Label>
                      <Input
                        id="seoTitle"
                        value={siteMeta.seoTitle || ""}
                        onChange={(e) => setSiteMeta(prev => ({ ...prev, seoTitle: e.target.value }))}
                        placeholder="Page title for search engines"
                        data-testid="input-seo-title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seoDescription">SEO Description</Label>
                      <Textarea
                        id="seoDescription"
                        value={siteMeta.seoDescription || ""}
                        onChange={(e) => setSiteMeta(prev => ({ ...prev, seoDescription: e.target.value }))}
                        placeholder="Meta description for search engines"
                        rows={3}
                        data-testid="input-seo-description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seoKeywords">SEO Keywords</Label>
                      <Input
                        id="seoKeywords"
                        value={siteMeta.seoKeywords || ""}
                        onChange={(e) => setSiteMeta(prev => ({ ...prev, seoKeywords: e.target.value }))}
                        placeholder="keyword1, keyword2, keyword3"
                        data-testid="input-seo-keywords"
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveSiteMeta} disabled={updateSiteMeta.isPending} data-testid="button-save-branding">
                  <Save className="w-4 h-4 mr-2" />
                  {updateSiteMeta.isPending ? "Saving..." : "Save Branding Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>Configure the main banner on your homepage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Switch
                    id="heroVisible"
                    checked={hero.isVisible}
                    onCheckedChange={(checked) => setHero(prev => ({ ...prev, isVisible: checked }))}
                    data-testid="switch-hero-visible"
                  />
                  <Label htmlFor="heroVisible">Show Hero Section</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="headline">Headline</Label>
                  <Input
                    id="headline"
                    value={hero.headline}
                    onChange={(e) => setHero(prev => ({ ...prev, headline: e.target.value }))}
                    placeholder="Your main headline"
                    data-testid="input-headline"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subheadline">Subheadline</Label>
                  <Textarea
                    id="subheadline"
                    value={hero.subheadline || ""}
                    onChange={(e) => setHero(prev => ({ ...prev, subheadline: e.target.value }))}
                    placeholder="Supporting text below the headline"
                    rows={2}
                    data-testid="input-subheadline"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ctaText">Button Text</Label>
                    <Input
                      id="ctaText"
                      value={hero.ctaText || ""}
                      onChange={(e) => setHero(prev => ({ ...prev, ctaText: e.target.value }))}
                      placeholder="Shop Now"
                      data-testid="input-cta-text"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ctaLink">Button Link</Label>
                    <Input
                      id="ctaLink"
                      value={hero.ctaLink || ""}
                      onChange={(e) => setHero(prev => ({ ...prev, ctaLink: e.target.value }))}
                      placeholder="/products"
                      data-testid="input-cta-link"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backgroundImage">Background Image</Label>
                  <div className="flex gap-2">
                    <Input
                      id="backgroundImage"
                      value={hero.backgroundImage || ""}
                      onChange={(e) => setHero(prev => ({ ...prev, backgroundImage: e.target.value }))}
                      placeholder="/uploads/hero-bg.jpg"
                      data-testid="input-hero-bg"
                    />
                    <label className="cursor-pointer">
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, (url) => setHero(prev => ({ ...prev, backgroundImage: url })))}
                      />
                      <Button type="button" variant="outline" size="icon" asChild>
                        <span><Upload className="w-4 h-4" /></span>
                      </Button>
                    </label>
                  </div>
                  {hero.backgroundImage && (
                    <div className="mt-2">
                      <img src={hero.backgroundImage} alt="Hero preview" className="max-h-32 rounded-md" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Overlay Opacity: {hero.overlayOpacity}%</Label>
                  <Slider
                    value={[hero.overlayOpacity]}
                    onValueChange={([value]) => setHero(prev => ({ ...prev, overlayOpacity: value }))}
                    max={100}
                    step={5}
                    data-testid="slider-overlay"
                  />
                </div>

                <Button onClick={handleSaveHero} disabled={updateHero.isPending} data-testid="button-save-hero">
                  <Save className="w-4 h-4 mr-2" />
                  {updateHero.isPending ? "Saving..." : "Save Hero Section"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collections">
            <Card>
              <CardHeader>
                <CardTitle>Featured Collections</CardTitle>
                <CardDescription>Highlight specific product collections on your homepage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="collectionsSectionTitle">Section Title</Label>
                  <Input
                    id="collectionsSectionTitle"
                    value={featuredCollections.sectionTitle || ""}
                    onChange={(e) => setFeaturedCollections(prev => ({ ...prev, sectionTitle: e.target.value }))}
                    placeholder="Featured Collections"
                    data-testid="input-collections-title"
                  />
                </div>

                <div className="space-y-4">
                  {featuredCollections.collections.map((collection, index) => (
                    <Card key={collection.id} className="p-4" data-testid={`card-collection-${index}`}>
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold">Collection {index + 1}</h4>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={collection.isVisible}
                              onCheckedChange={(checked) => updateCollection(collection.id, "isVisible", checked)}
                              data-testid={`switch-collection-visible-${index}`}
                            />
                            <Label>Visible</Label>
                          </div>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => removeCollection(collection.id)}
                            data-testid={`button-remove-collection-${index}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={collection.title}
                            onChange={(e) => updateCollection(collection.id, "title", e.target.value)}
                            placeholder="Collection Title"
                            data-testid={`input-collection-title-${index}`}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Link</Label>
                          <Input
                            value={collection.link || ""}
                            onChange={(e) => updateCollection(collection.id, "link", e.target.value)}
                            placeholder="/products?category=silk"
                            data-testid={`input-collection-link-${index}`}
                          />
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={collection.description || ""}
                          onChange={(e) => updateCollection(collection.id, "description", e.target.value)}
                          placeholder="Brief description of this collection"
                          rows={2}
                          data-testid={`input-collection-desc-${index}`}
                        />
                      </div>
                      <div className="mt-4 space-y-2">
                        <Label>Image</Label>
                        <div className="flex gap-2">
                          <Input
                            value={collection.image || ""}
                            onChange={(e) => updateCollection(collection.id, "image", e.target.value)}
                            placeholder="/uploads/collection.jpg"
                            data-testid={`input-collection-image-${index}`}
                          />
                          <label className="cursor-pointer">
                            <Input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e, (url) => updateCollection(collection.id, "image", url))}
                            />
                            <Button type="button" variant="outline" size="icon" asChild>
                              <span><Upload className="w-4 h-4" /></span>
                            </Button>
                          </label>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Button variant="outline" onClick={addCollection} data-testid="button-add-collection">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Collection
                </Button>

                <Button onClick={handleSaveCollections} disabled={updateFeaturedCollections.isPending} data-testid="button-save-collections">
                  <Save className="w-4 h-4 mr-2" />
                  {updateFeaturedCollections.isPending ? "Saving..." : "Save Collections"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testimonials">
            <Card>
              <CardHeader>
                <CardTitle>Customer Testimonials</CardTitle>
                <CardDescription>Showcase customer reviews and feedback</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="testimonialsSectionTitle">Section Title</Label>
                  <Input
                    id="testimonialsSectionTitle"
                    value={testimonials.sectionTitle || ""}
                    onChange={(e) => setTestimonials(prev => ({ ...prev, sectionTitle: e.target.value }))}
                    placeholder="What Our Customers Say"
                    data-testid="input-testimonials-title"
                  />
                </div>

                <div className="space-y-4">
                  {testimonials.testimonials.map((testimonial, index) => (
                    <Card key={testimonial.id} className="p-4" data-testid={`card-testimonial-${index}`}>
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold">Testimonial {index + 1}</h4>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={testimonial.isVisible}
                              onCheckedChange={(checked) => updateTestimonial(testimonial.id, "isVisible", checked)}
                              data-testid={`switch-testimonial-visible-${index}`}
                            />
                            <Label>Visible</Label>
                          </div>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => removeTestimonial(testimonial.id)}
                            data-testid={`button-remove-testimonial-${index}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Customer Name</Label>
                          <Input
                            value={testimonial.customerName}
                            onChange={(e) => updateTestimonial(testimonial.id, "customerName", e.target.value)}
                            placeholder="John Doe"
                            data-testid={`input-testimonial-name-${index}`}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Role/Title</Label>
                          <Input
                            value={testimonial.customerRole || ""}
                            onChange={(e) => updateTestimonial(testimonial.id, "customerRole", e.target.value)}
                            placeholder="Fashion Designer"
                            data-testid={`input-testimonial-role-${index}`}
                          />
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <Label>Quote</Label>
                        <Textarea
                          value={testimonial.quote}
                          onChange={(e) => updateTestimonial(testimonial.id, "quote", e.target.value)}
                          placeholder="Customer's testimonial..."
                          rows={3}
                          data-testid={`input-testimonial-quote-${index}`}
                        />
                      </div>
                      <div className="mt-4 grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Rating (1-5)</Label>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => updateTestimonial(testimonial.id, "rating", star)}
                                className="focus:outline-none"
                                data-testid={`button-rating-${index}-${star}`}
                              >
                                <Star
                                  className={`w-6 h-6 ${star <= (testimonial.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Customer Image</Label>
                          <div className="flex gap-2">
                            <Input
                              value={testimonial.customerImage || ""}
                              onChange={(e) => updateTestimonial(testimonial.id, "customerImage", e.target.value)}
                              placeholder="/uploads/customer.jpg"
                              data-testid={`input-testimonial-image-${index}`}
                            />
                            <label className="cursor-pointer">
                              <Input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, (url) => updateTestimonial(testimonial.id, "customerImage", url))}
                              />
                              <Button type="button" variant="outline" size="icon" asChild>
                                <span><Upload className="w-4 h-4" /></span>
                              </Button>
                            </label>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Button variant="outline" onClick={addTestimonial} data-testid="button-add-testimonial">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Testimonial
                </Button>

                <Button onClick={handleSaveTestimonials} disabled={updateTestimonials.isPending} data-testid="button-save-testimonials">
                  <Save className="w-4 h-4 mr-2" />
                  {updateTestimonials.isPending ? "Saving..." : "Save Testimonials"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="promotions">
            <Card>
              <CardHeader>
                <CardTitle>Promotional Banners</CardTitle>
                <CardDescription>Create promotional banners for sales and special offers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {promotions.banners.map((banner, index) => (
                    <Card key={banner.id} className="p-4" data-testid={`card-banner-${index}`}>
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold">Banner {index + 1}</h4>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={banner.isVisible}
                              onCheckedChange={(checked) => updateBanner(banner.id, "isVisible", checked)}
                              data-testid={`switch-banner-visible-${index}`}
                            />
                            <Label>Visible</Label>
                          </div>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => removeBanner(banner.id)}
                            data-testid={`button-remove-banner-${index}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={banner.title}
                            onChange={(e) => updateBanner(banner.id, "title", e.target.value)}
                            placeholder="Sale Title"
                            data-testid={`input-banner-title-${index}`}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Link</Label>
                          <Input
                            value={banner.link || ""}
                            onChange={(e) => updateBanner(banner.id, "link", e.target.value)}
                            placeholder="/products?sale=true"
                            data-testid={`input-banner-link-${index}`}
                          />
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={banner.description || ""}
                          onChange={(e) => updateBanner(banner.id, "description", e.target.value)}
                          placeholder="Promotional message"
                          rows={2}
                          data-testid={`input-banner-desc-${index}`}
                        />
                      </div>
                      <div className="mt-4 grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Image</Label>
                          <div className="flex gap-2">
                            <Input
                              value={banner.image || ""}
                              onChange={(e) => updateBanner(banner.id, "image", e.target.value)}
                              placeholder="/uploads/banner.jpg"
                              data-testid={`input-banner-image-${index}`}
                            />
                            <label className="cursor-pointer">
                              <Input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, (url) => updateBanner(banner.id, "image", url))}
                              />
                              <Button type="button" variant="outline" size="icon" asChild>
                                <span><Upload className="w-4 h-4" /></span>
                              </Button>
                            </label>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Background Color</Label>
                          <Input
                            type="color"
                            value={banner.backgroundColor || "#000000"}
                            onChange={(e) => updateBanner(banner.id, "backgroundColor", e.target.value)}
                            className="h-10"
                            data-testid={`input-banner-bg-color-${index}`}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Text Color</Label>
                          <Input
                            type="color"
                            value={banner.textColor || "#ffffff"}
                            onChange={(e) => updateBanner(banner.id, "textColor", e.target.value)}
                            className="h-10"
                            data-testid={`input-banner-text-color-${index}`}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Button variant="outline" onClick={addBanner} data-testid="button-add-banner">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Banner
                </Button>

                <Button onClick={handleSavePromotions} disabled={updatePromotions.isPending} data-testid="button-save-promotions">
                  <Save className="w-4 h-4 mr-2" />
                  {updatePromotions.isPending ? "Saving..." : "Save Promotions"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="footer">
            <Card>
              <CardHeader>
                <CardTitle>Footer Settings</CardTitle>
                <CardDescription>Configure your website footer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Switch
                    id="showNewsletter"
                    checked={footer.showNewsletter}
                    onCheckedChange={(checked) => setFooter(prev => ({ ...prev, showNewsletter: checked }))}
                    data-testid="switch-newsletter"
                  />
                  <Label htmlFor="showNewsletter">Show Newsletter Signup</Label>
                </div>

                {footer.showNewsletter && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="newsletterTitle">Newsletter Title</Label>
                      <Input
                        id="newsletterTitle"
                        value={footer.newsletterTitle || ""}
                        onChange={(e) => setFooter(prev => ({ ...prev, newsletterTitle: e.target.value }))}
                        placeholder="Subscribe to Our Newsletter"
                        data-testid="input-newsletter-title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newsletterDescription">Newsletter Description</Label>
                      <Input
                        id="newsletterDescription"
                        value={footer.newsletterDescription || ""}
                        onChange={(e) => setFooter(prev => ({ ...prev, newsletterDescription: e.target.value }))}
                        placeholder="Get updates on new arrivals"
                        data-testid="input-newsletter-desc"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="copyrightText">Copyright Text</Label>
                  <Input
                    id="copyrightText"
                    value={footer.copyrightText || ""}
                    onChange={(e) => setFooter(prev => ({ ...prev, copyrightText: e.target.value }))}
                    placeholder="© 2024 Your Company. All rights reserved."
                    data-testid="input-copyright"
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Social Links</h3>
                  <div className="space-y-4">
                    {footer.socialLinks.map((link, index) => (
                      <div key={index} className="flex items-center gap-4" data-testid={`social-link-${index}`}>
                        <Input
                          value={link.platform}
                          onChange={(e) => updateSocialLink(index, "platform", e.target.value)}
                          placeholder="Platform (e.g., facebook)"
                          className="flex-1"
                          data-testid={`input-social-platform-${index}`}
                        />
                        <Input
                          value={link.url}
                          onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                          placeholder="https://..."
                          className="flex-[2]"
                          data-testid={`input-social-url-${index}`}
                        />
                        <Switch
                          checked={link.isVisible}
                          onCheckedChange={(checked) => updateSocialLink(index, "isVisible", checked)}
                          data-testid={`switch-social-visible-${index}`}
                        />
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => removeSocialLink(index)}
                          data-testid={`button-remove-social-${index}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" onClick={addSocialLink} className="mt-4" data-testid="button-add-social">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Social Link
                  </Button>
                </div>

                <Button onClick={handleSaveFooter} disabled={updateFooter.isPending} data-testid="button-save-footer">
                  <Save className="w-4 h-4 mr-2" />
                  {updateFooter.isPending ? "Saving..." : "Save Footer Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="homepage-products">
            <Card>
              <CardHeader>
                <CardTitle>Homepage Products</CardTitle>
                <CardDescription>
                  Control which products appear on the homepage. When no products are selected, 
                  the latest vendor products will be shown automatically.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="productsSectionTitle">Section Title</Label>
                  <Input
                    id="productsSectionTitle"
                    value={homepageProducts.sectionTitle}
                    onChange={(e) => setHomepageProducts(prev => ({ ...prev, sectionTitle: e.target.value }))}
                    placeholder="Products For You"
                    data-testid="input-products-section-title"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4">
                    <Switch
                      id="autoFallback"
                      checked={homepageProducts.autoFallback}
                      onCheckedChange={(checked) => setHomepageProducts(prev => ({ ...prev, autoFallback: checked }))}
                      data-testid="switch-auto-fallback"
                    />
                    <div>
                      <Label htmlFor="autoFallback">Auto-display vendor products</Label>
                      <p className="text-sm text-muted-foreground">
                        Show latest products when no featured products are selected
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxProducts">Max Products</Label>
                    <Input
                      id="maxProducts"
                      type="number"
                      min={1}
                      max={20}
                      value={homepageProducts.maxProducts}
                      onChange={(e) => setHomepageProducts(prev => ({ ...prev, maxProducts: parseInt(e.target.value) || 12 }))}
                      data-testid="input-max-products"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Featured Products</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Search and add products to feature on the homepage. Drag to reorder.
                  </p>
                  
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search products by name or SKU..."
                      className="pl-9"
                      data-testid="input-product-search"
                    />
                    {productSearch && filteredProducts.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-card border rounded-md shadow-lg max-h-64 overflow-auto">
                        {filteredProducts.map(product => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => addHomepageProduct(product.id)}
                            className="w-full flex items-center gap-3 p-3 hover-elevate text-left"
                            data-testid={`button-add-product-${product.id}`}
                          >
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                                <Package className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {product.sku} - ${product.price}
                              </p>
                            </div>
                            <Plus className="w-4 h-4 text-primary flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {homepageProducts.products.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground border rounded-md border-dashed">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No featured products selected</p>
                        <p className="text-sm">
                          {homepageProducts.autoFallback 
                            ? "Latest vendor products will be shown automatically"
                            : "Search above to add products"}
                        </p>
                      </div>
                    ) : (
                      homepageProducts.products.map((item, idx) => {
                        const product = getProductById(item.productId);
                        if (!product) return null;
                        return (
                          <div 
                            key={item.productId} 
                            className="flex items-center gap-3 p-3 border rounded-md"
                            data-testid={`featured-product-${item.productId}`}
                          >
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => moveHomepageProduct(item.productId, "up")}
                                disabled={idx === 0}
                                data-testid={`button-move-up-${item.productId}`}
                              >
                                <GripVertical className="w-4 h-4 rotate-90" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => moveHomepageProduct(item.productId, "down")}
                                disabled={idx === homepageProducts.products.length - 1}
                                data-testid={`button-move-down-${item.productId}`}
                              >
                                <GripVertical className="w-4 h-4 -rotate-90" />
                              </Button>
                            </div>
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                <Package className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {product.sku} - ${product.price}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground">#{idx + 1}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeHomepageProduct(item.productId)}
                              data-testid={`button-remove-product-${item.productId}`}
                            >
                              <X className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <Button 
                  onClick={handleSaveHomepageProducts} 
                  disabled={updateHomepageProducts.isPending} 
                  data-testid="button-save-homepage-products"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateHomepageProducts.isPending ? "Saving..." : "Save Homepage Products"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
