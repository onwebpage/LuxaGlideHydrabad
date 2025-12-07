import { useState, useMemo, useEffect, useCallback } from "react";
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
import { ArrowRight, Star, TrendingUp, Users, Package, CheckCircle, Sparkles, Search, ChevronUp, ChevronDown, Truck, ChevronLeft, ChevronRight, Heart, LayoutGrid, List } from "lucide-react";
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
  const [sortBy, setSortBy] = useState("popular");
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);

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

  // Ensure we always have at least 8 categories for the quick icons
  const shopCategories = useMemo(() => {
    const dbCategories = dynamicShopCategories.length > 0 ? dynamicShopCategories : [];
    if (dbCategories.length >= 8) return dbCategories;
    
    // Fill in with fallback categories that aren't already in dbCategories
    const dbSlugs = new Set(dbCategories.map(c => c.slug));
    const additionalCategories = fallbackCategories.filter(c => !dbSlugs.has(c.slug));
    return [...dbCategories, ...additionalCategories].slice(0, 11);
  }, [dynamicShopCategories, fallbackCategories]);

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Verified Buyer, Delhi",
      content: "Love shopping here! The quality is amazing and delivery is super fast. Already ordered multiple times!",
      rating: 5,
    },
    {
      name: "Rajesh Kumar",
      role: "Happy Customer, Mumbai",
      content: "Great variety of products from different sellers. Easy returns and excellent customer service.",
      rating: 5,
    },
    {
      name: "Anjali Patel",
      role: "Fashion Enthusiast",
      content: "Finally found a marketplace with trendy styles at affordable prices. The seller options are fantastic!",
      rating: 5,
    },
  ];

  const brandPartners = [
    { name: "FashionFirst", color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-100 dark:bg-orange-900/30", initial: "FF" },
    { name: "StyleKart", color: "text-red-600 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30", initial: "SK" },
    { name: "TrendyFab", color: "text-violet-600 dark:text-violet-400", bgColor: "bg-violet-100 dark:bg-violet-900/30", initial: "TF" },
    { name: "EleganceHub", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-100 dark:bg-amber-900/30", initial: "EH" },
    { name: "FabricWorld", color: "text-purple-700 dark:text-purple-400", bgColor: "bg-purple-100 dark:bg-purple-900/30", initial: "FW" },
    { name: "SilkCraft", color: "text-pink-600 dark:text-pink-400", bgColor: "bg-pink-100 dark:bg-pink-900/30", initial: "SC" },
    { name: "TextileHub", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/30", initial: "TH" },
    { name: "WeaveMaster", color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-100 dark:bg-emerald-900/30", initial: "WM" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Banner - Compact Meesho Style */}
      <section className="relative h-[280px] sm:h-[320px] md:h-[420px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6">
          <div className="max-w-xl">
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-white leading-tight mb-4">
              Elevate Your Fashion
            </h1>
          </div>
        </div>
      </section>

      {/* Quick Category Icons - Meesho Style */}
      <section className="py-4 sm:py-6 md:py-8 bg-background">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex justify-start sm:justify-center gap-3 sm:gap-6 md:gap-10 lg:gap-12 overflow-x-auto scrollbar-hide pb-2 px-2">
            {shopCategories.slice(0, 8).map((category, index) => (
              <Link key={category.name} href={`/products?category=${category.slug}`}>
                <div className="flex flex-col items-center gap-2 sm:gap-3 min-w-[70px] sm:min-w-[90px] cursor-pointer group" data-testid={`quick-category-${index}`}>
                  <div className="w-16 h-20 sm:w-20 sm:h-24 md:w-24 md:h-28 lg:w-28 lg:h-32 rounded-t-full bg-pink-100 dark:bg-pink-900/30 overflow-hidden">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <span className="text-xs sm:text-sm md:text-base text-center text-foreground font-medium leading-tight">
                    {category.name.split(' ').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category - Image Grid */}
      <section className="py-8 sm:py-12 md:py-16 bg-background">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <p className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground mb-2 sm:mb-4">
              SHOP BY CATEGORIES
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
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
                  
                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4">
                    <h3 className="text-white font-semibold text-[10px] sm:text-xs md:text-sm lg:text-base tracking-wide uppercase text-center leading-tight">
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
      <section className="py-10 sm:py-14 md:py-20 bg-gradient-to-b from-secondary/20 to-background" data-testid="section-why-choose-us">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-2 sm:mb-4">
              Why Shop With Us
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
              Discover the best fashion from multiple trusted sellers, all in one place
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            <div className="text-center p-3 sm:p-4 md:p-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6">
                <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="font-serif text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-1 sm:mb-2 md:mb-3">Trusted Sellers</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                Every seller is verified to ensure you receive authentic, quality products
              </p>
            </div>

            <div className="text-center p-3 sm:p-4 md:p-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="font-serif text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-1 sm:mb-2 md:mb-3">Quality Products</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                Curated collections featuring the finest fabrics and trendy designs
              </p>
            </div>

            <div className="text-center p-3 sm:p-4 md:p-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6">
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="font-serif text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-1 sm:mb-2 md:mb-3">Great Prices</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                Competitive prices with regular deals and discounts on your favorite styles
              </p>
            </div>

            <div className="text-center p-3 sm:p-4 md:p-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6">
                <Truck className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="font-serif text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-1 sm:mb-2 md:mb-3">Fast Delivery</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                Quick and secure shipping across India with real-time order tracking
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products For You Section */}
      <section className="py-12 bg-background" data-testid="section-products-for-you">
        <div className="container mx-auto px-4 lg:px-6">
          {/* Section Header */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-1">Home &gt; Products</p>
            <h2 className="text-xl font-medium text-foreground">
              {products.length} results for products
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar - Filters */}
            <aside className="w-full lg:w-56 shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Filter Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground">Filter</h3>
                  <button className="text-sm text-muted-foreground hover:text-foreground">Advanced</button>
                </div>

                {/* Brand/Category Section */}
                <div className="space-y-4">
                  <button
                    className="flex items-center justify-between w-full"
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    data-testid="button-toggle-categories"
                  >
                    <h4 className="font-medium text-sm text-foreground">Brand</h4>
                    {showAllCategories ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>

                  {/* Category Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search brand..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="pl-9 h-9 text-sm bg-muted/30 border-0"
                      data-testid="input-category-search"
                    />
                  </div>

                  {/* Category Checkboxes */}
                  <div className="space-y-2.5 max-h-48 overflow-y-auto">
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
                            className="rounded-sm border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors flex-1">
                            {category.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {Math.floor(Math.random() * 50) + 10}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-4 pt-4 border-t">
                  <button className="flex items-center justify-between w-full">
                    <h4 className="font-medium text-sm text-foreground">Price</h4>
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  </button>
                  
                  <div className="space-y-3">
                    {/* Dual Range Slider */}
                    <div className="relative h-2 pt-4 pb-4">
                      {/* Track background */}
                      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      
                      {/* Active track */}
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-amber-500 rounded-full"
                        style={{ 
                          left: `${(priceRange[0] / 50000) * 100}%`, 
                          right: `${100 - (priceRange[1] / 50000) * 100}%` 
                        }}
                      />
                      
                      {/* Min slider */}
                      <input
                        type="range"
                        min="0"
                        max="50000"
                        step="500"
                        value={priceRange[0]}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value < priceRange[1]) {
                            setPriceRange([value, priceRange[1]]);
                          }
                        }}
                        className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-amber-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-amber-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md"
                        data-testid="slider-price-min"
                      />
                      
                      {/* Max slider */}
                      <input
                        type="range"
                        min="0"
                        max="50000"
                        step="500"
                        value={priceRange[1]}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value > priceRange[0]) {
                            setPriceRange([priceRange[0], value]);
                          }
                        }}
                        className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-amber-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-amber-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md"
                        data-testid="slider-price-max"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>₹0</span>
                      <span>₹50,000</span>
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        type="number" 
                        value={priceRange[0]} 
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          if (value < priceRange[1]) {
                            setPriceRange([value, priceRange[1]]);
                          }
                        }}
                        className="h-8 text-xs text-center"
                        data-testid="input-price-min"
                      />
                      <Input 
                        type="number" 
                        value={priceRange[1]} 
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 50000;
                          if (value > priceRange[0]) {
                            setPriceRange([priceRange[0], value]);
                          }
                        }}
                        className="h-8 text-xs text-center"
                        data-testid="input-price-max"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </aside>

            {/* Right Side - Product Grid */}
            <div className="flex-1">
              {/* Top Bar */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-muted' : 'hover:bg-muted/50'}`}
                    data-testid="button-view-grid"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-muted' : 'hover:bg-muted/50'}`}
                    data-testid="button-view-list"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32 h-9 bg-background border-0 font-medium" data-testid="select-sort-products">
                      <SelectValue placeholder="Popular" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Popular</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Product Grid */}
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
                {productsLoading ? (
                  Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  ))
                ) : filteredProducts.length === 0 ? (
                  <div className="col-span-full py-12 text-center">
                    <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground">No products found</p>
                  </div>
                ) : (
                  filteredProducts.map((product, index) => (
                    <Link key={product.id} href={`/products/${product.id}`}>
                      <div
                        className="group cursor-pointer"
                        data-testid={`card-product-for-you-${product.id}`}
                      >
                        {/* Product Image */}
                        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 mb-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          
                          {/* New Arrival Badge */}
                          {index < 3 && (
                            <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs px-2 py-1 rounded">
                              New Arrival
                            </div>
                          )}
                          
                          {/* Wishlist Heart */}
                          <button 
                            className="absolute top-3 right-3 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            data-testid={`button-wishlist-${product.id}`}
                          >
                            <Heart className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
                          </button>
                        </div>

                        {/* Product Details */}
                        <div className="space-y-1">
                          {/* Brand */}
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Queen 4Feel</span>
                          </div>
                          
                          {/* Product Name */}
                          <h3 className="text-sm font-medium text-foreground truncate leading-tight">
                            {product.name}
                          </h3>

                          {/* Price */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-pink-600 dark:text-pink-400">
                              ₹{product.price.toLocaleString()}
                            </span>
                          </div>

                          {/* Items Left */}
                          <div className="flex items-center gap-1">
                            <Package className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {Math.floor(Math.random() * 20) + 5} items left
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              {/* View All Products Link */}
              {products.length > 10 && (
                <div className="text-center mt-10">
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
              What Our Customers Say
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Trusted by thousands of customers across India
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
            Join thousands of customers who trust us for quality fashion
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
            <Link href="/register?role=vendor">
              <Button
                size="lg"
                variant="outline"
                className="px-10 py-6 text-lg border-2 border-white/30 text-white hover:bg-white/10"
                data-testid="button-cta-vendor"
              >
                Apply as a Vendor
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
