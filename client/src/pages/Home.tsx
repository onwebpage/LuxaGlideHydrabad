import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Star, TrendingUp, Users, Package, CheckCircle, Sparkles, Search, ChevronUp, ChevronDown, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { Vendor, Product, Category, AllCmsSettings } from "@shared/schema";
import { useCategories } from "@/hooks/use-categories";
import heroImage from "@assets/generated_images/luxury_fashion_boutique_interior.png";
import suitImage from "@assets/stock_images/woman_wearing_formal_0b5c0cca.jpg";
import newArrivalsImage from "@assets/stock_images/woman_wearing_new_tr_9ad6e643.jpg";
import kurtaImage from "@assets/stock_images/indian_woman_wearing_838e84e3.jpg";
import sareeImage from "@assets/stock_images/indian_woman_wearing_a1c65f9d.jpg";
import dressImage from "@assets/stock_images/woman_wearing_elegan_093861bd.jpg";
import shirtImage from "@assets/stock_images/woman_wearing_casual_0b8e2129.jpg";
import coordsImage from "@assets/stock_images/woman_wearing_coordi_05875df2.jpg";
import loungewearImage from "@assets/stock_images/woman_wearing_comfor_d11563b2.jpg";
import bottomsImage from "@assets/stock_images/woman_wearing_pants__d18fff1f.jpg";
import shawlImage from "@assets/stock_images/woman_wearing_shawl__60f3f662.jpg";
import partyWearImage from "@assets/stock_images/woman_wearing_glamor_7fcd42b1.jpg";

const defaultCategoryImages: Record<string, string> = {
  "suits": suitImage,
  "new-arrivals": newArrivalsImage,
  "kurtas": kurtaImage,
  "sarees": sareeImage,
  "dresses": dressImage,
  "shirts": shirtImage,
  "co-ords": coordsImage,
  "loungewear": loungewearImage,
  "bottoms": bottomsImage,
  "shawls": shawlImage,
  "party-wear": partyWearImage,
};

export default function Home() {
  const [sortBy, setSortBy] = useState("relevance");
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [showAllCategories, setShowAllCategories] = useState(false);

  const { data: vendors = [], isLoading: vendorsLoading } = useQuery<Vendor[]>({
    queryKey: ['/api/vendors/approved'],
    queryFn: async () => {
      const response = await fetch('/api/vendors/approved?limit=4');
      if (!response.ok) throw new Error('Failed to fetch vendors');
      return response.json();
    }
  });

  const { data: homepageProductsData, isLoading: productsLoading } = useQuery<{
    sectionTitle: string;
    products: Product[];
    useFallback: boolean;
  }>({
    queryKey: ['/api/homepage-products'],
    queryFn: async () => {
      const response = await fetch('/api/homepage-products');
      if (!response.ok) throw new Error('Failed to fetch homepage products');
      return response.json();
    }
  });
  
  const { data: apiCategories, isLoading: categoriesLoading } = useCategories();

  const { data: cmsSettings } = useQuery<AllCmsSettings>({
    queryKey: ['/api/cms/public'],
    queryFn: async () => {
      const response = await fetch('/api/cms/public');
      if (!response.ok) throw new Error('Failed to fetch CMS settings');
      return response.json();
    }
  });

  const sectionTitle = homepageProductsData?.sectionTitle || "Products For You";

  const dynamicShopCategories = useMemo(() => {
    if (!apiCategories || apiCategories.length === 0) return [];
    return apiCategories.slice(0, 12).map((cat: Category) => ({
      name: cat.name.toUpperCase(),
      image: cat.image || defaultCategoryImages[cat.slug] || suitImage,
      slug: cat.slug,
    }));
  }, [apiCategories]);

  const featuredCollections = useMemo(() => {
    if (!cmsSettings?.featuredCollections?.collections) return [];
    return cmsSettings.featuredCollections.collections.filter(c => c.isVisible !== false);
  }, [cmsSettings]);
  
  const products = useMemo(() => {
    if (!homepageProductsData?.products) return [];
    
    return homepageProductsData.products.map(product => {
      const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      const bulkPricing = product.bulkPricing ? (typeof product.bulkPricing === 'string' ? JSON.parse(product.bulkPricing) : product.bulkPricing) : null;
      
      const currentPrice = parseFloat(product.price);
      const hasDiscount = bulkPricing && Array.isArray(bulkPricing) && bulkPricing.length > 0;
      const originalPrice = hasDiscount ? Math.round(currentPrice * 1.15) : null;
      const discountPercent = hasDiscount ? Math.round((1 - currentPrice / originalPrice!) * 100) : null;
      
      return {
        ...product,
        image: Array.isArray(images) && images.length > 0 ? images[0] : '/placeholder.jpg',
        imageCount: Array.isArray(images) ? images.length : 1,
        price: currentPrice,
        rating: parseFloat(product.rating || '0'),
        originalPrice,
        discountPercent,
        reviewCount: product.reviewCount || 0,
        hasDiscount,
      };
    });
  }, [homepageProductsData?.products]);

  const filteredCategories = useMemo(() => {
    if (!apiCategories) return [];
    return apiCategories.filter(cat => 
      cat.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [apiCategories, categorySearch]);

  const displayedCategories = showAllCategories 
    ? filteredCategories 
    : filteredCategories.slice(0, 8);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    if (selectedCategories.size > 0) {
      result = result.filter(p => selectedCategories.has(p.categoryId));
    }
    
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    
    return result.slice(0, 10);
  }, [products, selectedCategories, sortBy]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const fallbackCategories = [
    { name: "SUITS", image: suitImage, slug: "suits" },
    { name: "NEW ARRIVALS", image: newArrivalsImage, slug: "new-arrivals" },
    { name: "KURTAS", image: kurtaImage, slug: "kurtas" },
    { name: "SAREES", image: sareeImage, slug: "sarees" },
    { name: "DRESSES", image: dressImage, slug: "dresses" },
    { name: "SHIRTS", image: shirtImage, slug: "shirts" },
    { name: "CO-ORDS", image: coordsImage, slug: "co-ords" },
    { name: "LOUNGEWEAR", image: loungewearImage, slug: "loungewear" },
    { name: "BOTTOMS", image: bottomsImage, slug: "bottoms" },
    { name: "SHAWLS", image: shawlImage, slug: "shawls" },
    { name: "PARTY WEAR", image: partyWearImage, slug: "party-wear" },
  ];

  const shopCategories = dynamicShopCategories.length > 0 ? dynamicShopCategories : fallbackCategories;

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Boutique Owner, Delhi",
      content: "LuxeWholesale transformed my business. The quality of products and vendor relationships are exceptional.",
      rating: 5,
    },
    {
      name: "Rajesh Kumar",
      role: "Fashion Retailer, Mumbai",
      content: "Best B2B platform for wholesale fashion. Competitive pricing and reliable delivery every time.",
      rating: 5,
    },
    {
      name: "Anjali Patel",
      role: "Online Store Owner",
      content: "The variety of products and ease of bulk ordering make this my go-to wholesale marketplace.",
      rating: 5,
    },
  ];

  const stats = [
    { label: "Happy Customers", value: "10K+", icon: Users },
    { label: "Happy Vendors", value: "500+", icon: CheckCircle },
    { label: "Growth Potential", value: "200%", icon: TrendingUp },
  ];

  const brandPartners = [
    { name: "FabricWorld", color: "text-purple-700 dark:text-purple-400" },
    { name: "SilkCraft", color: "text-pink-600 dark:text-pink-400" },
    { name: "TextileHub", color: "text-blue-600 dark:text-blue-400" },
    { name: "WeaveMaster", color: "text-emerald-600 dark:text-emerald-400" },
    { name: "FashionFirst", color: "text-orange-600 dark:text-orange-400" },
    { name: "StyleKart", color: "text-red-600 dark:text-red-400" },
    { name: "TrendyFab", color: "text-violet-600 dark:text-violet-400" },
    { name: "EleganceHub", color: "text-amber-600 dark:text-amber-400" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Simple and Clean */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-serif text-5xl md:text-7xl font-semibold text-white leading-tight mb-8">
              Elevate Your Fashion
              <br />
              <span className="text-primary">Business</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Connect with verified vendors, access exclusive wholesale pricing, and grow your retail business with premium women's clothing.
            </p>
            
            <Link href="/register?role=vendor">
              <Button
                size="lg"
                className="text-lg px-12 py-7"
                data-testid="button-become-vendor"
              >
                Become a Vendor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Running Brand Marquee Bar - Meesho Style */}
      <section className="relative overflow-hidden bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-purple-950/30 py-6 border-y border-purple-100 dark:border-purple-900/30">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400" />
        
        <div className="flex overflow-hidden">
          <motion.div 
            className="flex items-center gap-16 px-8"
            animate={{ x: [0, -1200] }}
            transition={{ x: { repeat: Infinity, duration: 20, ease: "linear" } }}
          >
            {[...brandPartners, ...brandPartners].map((brand, index) => (
              <div key={index} className="flex-shrink-0">
                <span className={`text-xl font-bold tracking-tight ${brand.color} whitespace-nowrap`}>
                  {brand.name}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-4xl font-serif font-semibold mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category - Image Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4">
              SHOP BY CATEGORIES
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {shopCategories.map((category, index) => (
              <Link key={category.name} href={`/products?category=${category.slug}`}>
                <div 
                  className="relative aspect-[3/4] overflow-hidden cursor-pointer group"
                  data-testid={`card-category-${index}`}
                >
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
                  
                  {category.badge && (
                    <div className="absolute top-3 right-3">
                      {category.badge === "NEW" ? (
                        <div className="bg-black text-white px-3 py-2 text-xs font-bold tracking-wide">
                          <span className="block text-base font-serif">NEW</span>
                          <span className="block text-[10px] tracking-widest">ARRIVALS</span>
                        </div>
                      ) : category.badge === "UNDER" ? (
                        <div className="bg-primary text-black px-3 py-2 text-center">
                          <span className="block text-[10px] tracking-wide">UNDER</span>
                          <span className="block text-sm font-bold">₹{category.badgeValue}</span>
                        </div>
                      ) : category.badge === "SPECIAL" ? (
                        <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white px-3 py-2 text-center">
                          <span className="block text-[10px] tracking-wide">{category.badge}</span>
                          <span className="block text-xs font-bold">{category.badgeValue}</span>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-purple-700 via-purple-600 to-pink-500 text-white px-3 py-2 text-center rounded-sm">
                          <span className="block text-[10px] tracking-wide">{category.badge}</span>
                          <span className="block text-sm font-bold">₹{category.badgeValue}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-sm md:text-base tracking-wide uppercase text-center">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-b from-secondary/20 to-background" data-testid="section-why-choose-us">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-4">
              The LuxeWholesale Promise
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience premium wholesale fashion with unmatched quality and service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-3">Verified Vendors</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Every vendor undergoes rigorous KYC verification to ensure authenticity and reliability
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-3">Premium Quality</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Handpicked collections featuring the finest fabrics and impeccable craftsmanship
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-3">Competitive Pricing</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Exclusive wholesale rates with bulk discounts to maximize your profit margins
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Truck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-3">Reliable Delivery</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Fast and secure shipping across India with real-time order tracking
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products For You Section */}
      <section className="py-12 bg-background" data-testid="section-products-for-you">
        <div className="container mx-auto px-4 lg:px-6">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold mb-8 text-foreground">
            {sectionTitle}
          </h2>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Sidebar - Filters */}
            <aside className="w-full lg:w-64 shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Sort Dropdown */}
                <div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full bg-background border" data-testid="select-sort-products">
                      <span className="text-sm text-muted-foreground">Sort by :</span>
                      <SelectValue placeholder="Relevance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filters Header */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm uppercase tracking-wide">Filters</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {products.length}+ Products
                  </p>
                </div>

                {/* Category Section */}
                <div className="border-t pt-4">
                  <button
                    className="flex items-center justify-between w-full mb-4"
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    data-testid="button-toggle-categories"
                  >
                    <h4 className="font-semibold text-sm">Category</h4>
                    {showAllCategories ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>

                  {/* Category Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="pl-9 h-9 text-sm"
                      data-testid="input-category-search"
                    />
                  </div>

                  {/* Category Checkboxes */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {categoriesLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-5 w-full" />
                      ))
                    ) : (
                      displayedCategories.map((category) => (
                        <label
                          key={category.id}
                          className="flex items-center gap-3 cursor-pointer group"
                          data-testid={`checkbox-category-${category.id}`}
                        >
                          <Checkbox
                            checked={selectedCategories.has(category.id)}
                            onCheckedChange={() => toggleCategory(category.id)}
                            className="border-muted-foreground/50"
                          />
                          <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                            {category.name}
                          </span>
                        </label>
                      ))
                    )}
                  </div>

                  {/* Show More */}
                  {filteredCategories.length > 8 && (
                    <button
                      className="text-primary text-sm font-medium mt-4 hover:underline"
                      onClick={() => setShowAllCategories(!showAllCategories)}
                      data-testid="button-show-more-categories"
                    >
                      {showAllCategories ? "Show Less" : "Show More"}
                    </button>
                  )}
                </div>
              </div>
            </aside>

            {/* Right Side - Product Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {productsLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden border-0 shadow-sm">
                      <Skeleton className="aspect-square w-full" />
                      <div className="p-3 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </Card>
                  ))
                ) : filteredProducts.length === 0 ? (
                  <div className="col-span-full py-12 text-center">
                    <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground">No products found</p>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <Link key={product.id} href={`/products/${product.id}`}>
                      <Card
                        className="group overflow-hidden border hover-elevate transition-all duration-300 cursor-pointer h-full"
                        data-testid={`card-product-for-you-${product.id}`}
                      >
                        {/* Product Image */}
                        <div className="relative aspect-square overflow-hidden bg-muted/30">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* Image Count Badge */}
                          {product.imageCount > 1 && (
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-sm">
                              +{product.imageCount - 1} More
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="p-3 space-y-1.5">
                          {/* Product Name */}
                          <h3 className="text-sm font-medium text-foreground truncate leading-tight">
                            {product.name}
                          </h3>

                          {/* Price */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-bold text-foreground">
                              ₹{product.price.toLocaleString()}
                            </span>
                            {product.hasDiscount && product.originalPrice && (
                              <>
                                <span className="text-xs text-muted-foreground line-through">
                                  ₹{product.originalPrice.toLocaleString()}
                                </span>
                                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                  {product.discountPercent}% off
                                </span>
                              </>
                            )}
                          </div>

                          {/* Free Delivery */}
                          <div className="flex items-center gap-1">
                            <Truck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                              Free Delivery
                            </span>
                          </div>

                          {/* Rating */}
                          {(product.rating > 0 || product.reviewCount > 0) && (
                            <div className="flex items-center gap-1.5 pt-1">
                              <div className="flex items-center gap-1 bg-emerald-600 dark:bg-emerald-500 text-white px-1.5 py-0.5 rounded-sm">
                                <span className="text-xs font-semibold">{product.rating.toFixed(1)}</span>
                                <Star className="w-2.5 h-2.5 fill-white" />
                              </div>
                              {product.reviewCount > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {product.reviewCount.toLocaleString()} Reviews
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </Card>
                    </Link>
                  ))
                )}
              </div>

              {/* View All Products Link */}
              {products.length > 10 && (
                <div className="text-center mt-8">
                  <Link href="/products">
                    <Button variant="outline" size="lg" data-testid="button-view-all-products">
                      View All Products
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-4">
              What Our Clients Say
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Trusted by thousands of retailers across India
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="h-full" data-testid={`card-testimonial-${index}`}>
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-6">
            Ready to Grow Your Business?
          </h2>
          <p className="text-lg mb-10 max-w-2xl mx-auto opacity-90">
            Join thousands of retailers who trust us for quality wholesale fashion
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                variant="secondary"
                className="px-10 py-6 text-lg"
                data-testid="button-cta-register"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/products">
              <Button
                size="lg"
                variant="outline"
                className="px-10 py-6 text-lg border-2 border-white/30 text-white hover:bg-white/10"
                data-testid="button-cta-browse"
              >
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
