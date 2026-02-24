import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ArrowRight, LayoutGrid, List, Search, ChevronDown, ChevronUp, Package, X, SlidersHorizontal, Zap, Filter, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { AdBanner } from "@/components/AdBanner";
import type { Vendor, Product, Category, AllCmsSettings } from "@shared/schema";
import { useCategories } from "@/hooks/use-categories";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import bannerImage1 from "@assets/Brown_Women_Clothing_Review_Youtube_Thumbnail_1767125962914.png";
import bannerImage2 from "@assets/Brown_Women_Clothing_Review_Youtube_Thumbnail_1767125626200.png";
import bannerImage3 from "@assets/Brown_Women_Clothing_Review_Youtube_Thumbnail_(1)_1767125824209.png";
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [brandSearch, setBrandSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedHeights, setSelectedHeights] = useState<string[]>([]);
  const [, setLocation] = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);

  const banners = [bannerImage1, bannerImage2, bannerImage3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Fetch filter settings from CMS
  const { data: cmsSettings } = useQuery<AllCmsSettings>({
    queryKey: ['/api/cms/public'],
  });

  const filterSettings = cmsSettings?.filterSettings || {
    category: true,
    priceRange: true,
    brand: true,
    size: true,
    height: true,
  };

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const heights = ["4 - 4.5", "4.5 - 5", "5 - 5.5", "5.5 - Above"];

  const toggleFilter = (list: string[], setList: (val: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const clearFilters = () => {
    setBrandSearch("");
    setPriceRange([0, 50000]);
    setSelectedCategory("all");
    setSelectedSizes([]);
    setSelectedHeights([]);
  };

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
  
  const { data: apiCategories } = useCategories();

  const dynamicShopCategories = useMemo(() => {
    if (!apiCategories || apiCategories.length === 0) return [];
    return apiCategories.slice(0, 12).map((cat: any) => ({
      name: cat.name.toUpperCase(),
      image: cat.image || defaultCategoryImages[cat.slug] || suitImage,
      slug: cat.slug,
    }));
  }, [apiCategories]);

  const products = useMemo(() => {
    if (!homepageProductsData?.products) return [];
    return homepageProductsData.products.map(product => ({
      ...product,
      price: parseFloat(product.price),
      rating: parseFloat(product.rating || '0'),
    }));
  }, [homepageProductsData?.products]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    
    if (brandSearch) {
      result = result.filter(p => p.name.toLowerCase().includes(brandSearch.toLowerCase()));
    }

    if (selectedCategory !== "all") {
      const catId = apiCategories?.find(c => c.slug === selectedCategory)?.id;
      if (catId) {
        result = result.filter(p => p.categoryId === catId);
      }
    }

    // Mock filtering for size, occasion, fabric as they might not be in the product schema yet
    // or we can just filter if they match the name for demo purposes if properties don't exist
    // In a real app, these would be columns in the products table.

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
    return result;
  }, [products, priceRange, brandSearch, sortBy]);

  const fallbackCategories = [
    { name: "SUITS", image: suitImage, slug: "suits" },
    { name: "NEW ARRIVALS", image: newArrivalsImage, slug: "new-arrivals" },
    { name: "KURTAS", image: kurtaImage, slug: "kurtas" },
    { name: "DRESSES", image: dressImage, slug: "dresses" },
    { name: "SHIRTS", image: shirtImage, slug: "shirts" },
    { name: "CO-ORDS", image: coordsImage, slug: "co-ords" },
    { name: "LOUNGEWEAR", image: loungewearImage, slug: "loungewear" },
    { name: "BOTTOMS", image: bottomsImage, slug: "bottoms" },
    { name: "SHAWLS", image: shawlImage, slug: "shawls" },
    { name: "PARTY WEAR", image: partyWearImage, slug: "party-wear" },
  ];

  const shopCategories = useMemo(() => {
    const dbCategories = dynamicShopCategories.length > 0 ? dynamicShopCategories : [];
    if (dbCategories.length >= 8) return dbCategories;
    
    const dbSlugs = new Set(dbCategories.map(c => c.slug));
    const additionalCategories = fallbackCategories.filter(c => !dbSlugs.has(c.slug));
    return [...dbCategories, ...additionalCategories].slice(0, 11);
  }, [dynamicShopCategories, fallbackCategories]);

  const testimonials = [
    { name: "Priya Sharma", role: "Verified Buyer, Delhi", content: "Love shopping here! The quality is amazing and delivery is super fast.", rating: 5 },
    { name: "Rajesh Kumar", role: "Happy Customer, Mumbai", content: "Great variety of products from different sellers. Excellent customer service.", rating: 5 },
    { name: "Anjali Patel", role: "Fashion Enthusiast", content: "Finally found a marketplace with trendy styles at affordable prices.", rating: 5 },
  ];

  const FilterContent = ({ isMobile = false }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#d4af37]" />
                <h3 className="text-lg font-bold text-[#4a3700] dark:text-foreground">Filters</h3>
              </div>
        {(brandSearch || priceRange[0] > 0 || priceRange[1] < 50000 || selectedCategory !== "all" || selectedSizes.length > 0 || selectedHeights.length > 0) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-primary"
          >
            Clear All
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {brandSearch && (
          <Badge variant="secondary" className="gap-1 px-2 py-1">
            Brand: {brandSearch}
            <X className="w-3 h-3 cursor-pointer" onClick={() => setBrandSearch("")} />
          </Badge>
        )}
        {selectedCategory !== "all" && (
          <Badge variant="secondary" className="gap-1 px-2 py-1">
            Category: {selectedCategory}
            <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory("all")} />
          </Badge>
        )}
        {(priceRange[0] > 0 || priceRange[1] < 50000) && (
          <Badge variant="secondary" className="gap-1 px-2 py-1">
            ₹{priceRange[0]} - ₹{priceRange[1]}
            <X className="w-3 h-3 cursor-pointer" onClick={() => setPriceRange([0, 50000])} />
          </Badge>
        )}
      </div>

      <Accordion type="multiple" defaultValue={["category", "price", "brand", "size", "height"]} className="w-full">
        {filterSettings.category && (
          <AccordionItem value="category" className="border-none">
            <AccordionTrigger className="hover:no-underline py-4">
              <span className="text-sm font-semibold text-[#8a6d1e] dark:text-foreground uppercase tracking-widest">Category</span>
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-muted/30 border-none">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {apiCategories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>
        )}

        {filterSettings.priceRange && (
          <AccordionItem value="price" className="border-none">
            <AccordionTrigger className="hover:no-underline py-4">
              <span className="text-sm font-semibold text-[#8a6d1e] dark:text-foreground uppercase tracking-widest">Price Range</span>
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-4">
              <div className="space-y-6">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>₹{priceRange[0].toLocaleString()}</span>
                  <span>₹{priceRange[1].toLocaleString()}</span>
                </div>
                <div className="px-2">
                  <Slider
                    min={0}
                    max={50000}
                    step={1}
                    value={priceRange}
                    onValueChange={(val) => setPriceRange(val as [number, number])}
                    className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-white"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">₹</span>
                    <Input 
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="bg-muted/30 border-none pl-7 pr-2 h-10 text-sm font-medium"
                    />
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">₹</span>
                    <Input 
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 50000])}
                      className="bg-muted/30 border-none pl-7 pr-2 h-10 text-sm font-medium"
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {filterSettings.brand && (
          <AccordionItem value="brand" className="border-none">
            <AccordionTrigger className="hover:no-underline py-4">
              <span className="text-sm font-semibold text-[#8a6d1e] dark:text-foreground uppercase tracking-widest">Brand</span>
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search brand..." 
                  className="pl-9 bg-muted/30 border-none h-10 text-sm focus-visible:ring-1 focus-visible:ring-primary" 
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {filterSettings.size && (
          <AccordionItem value="size" className="border-none">
            <AccordionTrigger className="hover:no-underline py-4">
              <span className="text-sm font-semibold text-[#8a6d1e] dark:text-foreground uppercase tracking-widest">Size</span>
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-4">
              <div className="grid grid-cols-3 gap-2">
                {sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSizes.includes(size) ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-9"
                    onClick={() => toggleFilter(selectedSizes, setSelectedSizes, size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {filterSettings.height && (
          <AccordionItem value="height" className="border-none">
            <AccordionTrigger className="hover:no-underline py-4">
              <span className="text-sm font-semibold text-[#8a6d1e] dark:text-foreground uppercase tracking-widest">Height</span>
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-4">
              <div className="space-y-2">
                {heights.map((height) => (
                  <div key={height} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`height-${height}`} 
                      checked={selectedHeights.includes(height)}
                      onCheckedChange={() => toggleFilter(selectedHeights, setSelectedHeights, height)}
                    />
                    <label htmlFor={`height-${height}`} className="text-sm font-medium leading-none cursor-pointer">
                      {height} ft
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );

  return (
    <div className="min-h-screen">
      <section 
        className="relative min-h-[300px] sm:min-h-[500px] h-[50vh] sm:h-[70vh] flex items-center overflow-hidden w-full cursor-grab active:cursor-grabbing"
        data-testid="section-hero-with-outfit"
        onMouseDown={(e) => { setIsDragging(true); setStartX(e.clientX); }}
        onMouseMove={(e) => { if (isDragging) setTranslateX(e.clientX - startX); }}
        onMouseUp={() => {
          if (isDragging) {
            setIsDragging(false);
            if (translateX > 100) setCurrentSlide((p) => (p - 1 + 3) % 3);
            else if (translateX < -100) setCurrentSlide((p) => (p + 1) % 3);
            setTranslateX(0);
          }
        }}
        onMouseLeave={() => {
          if (isDragging) {
            setIsDragging(false);
            setTranslateX(0);
          }
        }}
      >
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            style={{
              backgroundImage: `url(${banner})`,
              backgroundSize: 'cover',
              backgroundPosition: 'top center',
            }}
          >
            <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
          </div>
        ))}
        <button onClick={() => setCurrentSlide((p) => (p - 1 + 3) % 3)} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={() => setCurrentSlide((p) => (p + 1) % 3)} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all">
          <ChevronRight className="w-6 h-6" />
        </button>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {banners.map((_, index) => (
            <button key={index} onClick={() => setCurrentSlide(index)} className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? 'bg-[#bf953f] w-8' : 'bg-white/50'}`} />
          ))}
        </div>
        <div className="relative z-20 container mx-auto px-4 sm:px-6 flex items-center justify-start w-full h-full">
          <div className="max-w-lg flex flex-col justify-center text-white text-left overflow-hidden">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-[#bf953f]/50 mb-6 w-fit">
              <Sparkles className="w-4 h-4 text-[#bf953f]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white">AI-Powered Fashion</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-4 sm:mb-8 luxury-gold-text drop-shadow-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              Feel Like a Queen, Every Day
            </h1>
            <h2 className="text-xs sm:text-base max-w-xs sm:max-w-sm leading-relaxed mb-6 sm:mb-8 font-medium text-white drop-shadow-md">
              Discover Height Specific stunning Casual, Traditional, Ethnic Women’s Wear and trendy fashion from India's most trusted vendors.
            </h2>
            <Button 
              className="w-full sm:w-fit px-8 py-3 rounded-full text-sm sm:text-base bg-[#bf953f] hover:bg-[#b8962d] text-white shadow-xl shadow-[#bf953f]/20 btn-shiny"
              data-testid="button-shop-now"
              onClick={() => {
                const productsSection = document.getElementById('products-section');
                if (productsSection) {
                  productsSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                  setLocation('/products');
                }
              }}
            >
              SHOP NOW
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Top Ad Banner */}
      <section className="py-6 bg-background">
        <div className="container mx-auto px-4">
          <AdBanner position="home_top" />
        </div>
      </section>

      {/* Quick Category Icons */}
      <section className="py-12 bg-background border-b border-[#bf953f]/20">
        <div className="container mx-auto px-4">
          <div className="flex justify-start sm:justify-center gap-4 sm:gap-10 md:gap-14 lg:gap-16 overflow-x-auto scrollbar-hide pb-4 px-2">
            {shopCategories.slice(0, 15).map((category, index) => (
              <Link key={category.name} href={`/products?category=${category.slug}`}>
                <div className="flex flex-col items-center gap-3 sm:gap-4 min-w-[85px] sm:min-w-[100px] cursor-pointer group" data-testid={`quick-category-${index}`}>
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 hexagon-clip overflow-hidden border-2 border-transparent group-hover:border-[#bf953f] transition-all duration-500 group-hover:scale-110 shadow-sm group-hover:shadow-[0_0_20px_rgba(191,149,63,0.3)] bg-muted">
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    {/* Hover Explore Text */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#bf953f] text-white text-[8px] font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 whitespace-nowrap shadow-lg">
                      Explore →
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-bold tracking-wide text-[#4a3700] dark:text-foreground group-hover:text-[#bf953f] transition-colors duration-300">
                    {category.name.split(' ').map((word: string) => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Middle Ad Banner */}
      <section className="py-6 bg-background">
        <div className="container mx-auto px-4">
          <AdBanner position="home_middle" />
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-8 sm:py-12 md:py-16 bg-background">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <p className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#8a6d1e] dark:text-muted-foreground mb-2 sm:mb-4 font-bold">
              SHOP BY CATEGORIES
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
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

      <section id="products-section" className="py-12 bg-background">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
             <div className="flex items-center gap-2 text-sm text-[#bf953f]">
               <Link href="/" className="hover:text-[#bf953f]">Home</Link>
               <span>&gt;</span>
               <span className="text-[#8a6d1e]">Products</span>
             </div>
             <div className="flex items-center gap-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden gap-2">
                      <Filter className="w-4 h-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:max-w-md p-6 overflow-y-auto">
                    <SheetHeader className="mb-6">
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <FilterContent isMobile />
                    <SheetFooter className="mt-8 border-t pt-6">
                      <SheetClose asChild>
                        <Button className="w-full">Show Results</Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-muted shadow-sm border' : 'text-muted-foreground hover:bg-muted/50'}`}
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-muted shadow-sm border' : 'text-muted-foreground hover:bg-muted/50'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
             </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar Filter */}
            <aside className="hidden lg:block w-full lg:w-72 flex-shrink-0">
              <div className="sticky top-24">
                <FilterContent />
              </div>
            </aside>

            {/* Right Side Content */}
            <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-[#4a3700] dark:text-foreground">Products For You</h2>
                  <p className="text-sm text-[#8a6d1e] dark:text-muted-foreground font-medium">Showing {filteredProducts.length} results</p>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#8a6d1e] dark:text-muted-foreground font-bold uppercase tracking-widest">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px] border-none bg-transparent font-bold h-auto p-0 focus:ring-0 text-[#4a3700] dark:text-foreground uppercase tracking-widest text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-[#d4af37]/20">
                      <SelectItem value="popular" className="text-xs font-bold uppercase tracking-widest">Popular</SelectItem>
                      <SelectItem value="price-low" className="text-xs font-bold uppercase tracking-widest">Price: Low to High</SelectItem>
                      <SelectItem value="price-high" className="text-xs font-bold uppercase tracking-widest">Price: High to Low</SelectItem>
                      <SelectItem value="rating" className="text-xs font-bold uppercase tracking-widest">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                {productsLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[250/325] rounded-xl" />
                  ))
                ) : filteredProducts.length === 0 ? (
                  <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl">
                    <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground">No products match your filters</p>
                    <Button variant="ghost" onClick={() => { setPriceRange([0, 50000]); setBrandSearch(""); }}>Clear all filters</Button>
                  </div>
                ) : (
                  filteredProducts.slice(0, 12).map((product) => (
                    <ProductCard key={product.id} product={product as any} />
                  ))
                )}
              </div>
              
              {filteredProducts.length > 0 && (
                <div className="text-center mt-12">
                  <Link href="/products">
                    <Button variant="outline" size="lg" className="rounded-full px-8">
                      <span className="text-sm font-bold tracking-[0.2em] uppercase mr-2 drop-shadow-md text-[#4a3700] dark:text-white">View All Products</span>
                      <ArrowRight className="ml-2 w-4 h-4 text-[#4a3700] dark:text-white drop-shadow-md" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Ad Banner */}
      <section className="py-6 bg-background">
        <div className="container mx-auto px-4">
          <AdBanner position="home_bottom" />
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-center mb-12">What Our Customers Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4 text-primary">
                    {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="italic mb-6">"{t.content}"</p>
                  <div>
                    <p className="font-bold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
