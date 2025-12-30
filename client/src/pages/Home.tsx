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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ArrowRight, Star, TrendingUp, Users, Package, CheckCircle, Sparkles, Search, ChevronUp, ChevronDown, Truck, ChevronLeft, ChevronRight, Heart, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import type { Vendor, Product, Category, AllCmsSettings } from "@shared/schema";
import { useCategories } from "@/hooks/use-categories";
import bannerImage from "@assets/Brown_Women_Clothing_Review_Youtube_Thumbnail_1767125962914.png";
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

  const dynamicShopCategories = useMemo(() => {
    if (!apiCategories || apiCategories.length === 0) return [];
    return apiCategories.slice(0, 12).map((cat: Category) => ({
      name: cat.name.toUpperCase(),
      image: cat.image || defaultCategoryImages[cat.slug] || suitImage,
      slug: cat.slug,
    }));
  }, [apiCategories]);

  const products = useMemo(() => {
    if (!homepageProductsData?.products) return [];
    return homepageProductsData.products.map(product => {
      const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      return {
        ...product,
        image: Array.isArray(images) && images.length > 0 ? images[0] : '/placeholder.jpg',
        price: parseFloat(product.price),
        rating: parseFloat(product.rating || '0'),
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
      result = result.filter(p => p.categoryId && selectedCategories.has(p.categoryId));
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
    return result;
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

  const shopCategories = useMemo(() => {
    return dynamicShopCategories.length >= 8 ? dynamicShopCategories : dynamicShopCategories;
  }, [dynamicShopCategories]);

  const testimonials = [
    { name: "Priya Sharma", role: "Verified Buyer, Delhi", content: "Love shopping here! The quality is amazing and delivery is super fast.", rating: 5 },
    { name: "Rajesh Kumar", role: "Happy Customer, Mumbai", content: "Great variety of products from different sellers. Excellent customer service.", rating: 5 },
    { name: "Anjali Patel", role: "Fashion Enthusiast", content: "Finally found a marketplace with trendy styles at affordable prices.", rating: 5 },
  ];

  return (
    <div className="min-h-screen">
      <section 
        className="relative min-h-[500px] h-[70vh] flex items-center overflow-hidden"
        style={{
          backgroundImage: `url(${bannerImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        data-testid="section-hero-with-outfit"
      >
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 flex items-center justify-start w-full h-full">
          <div className="max-w-lg flex flex-col justify-center text-white">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
              Feel Like a Queen, Every Day
            </h1>
            <p className="text-sm sm:text-base max-w-sm leading-relaxed mb-8 opacity-90">
              Discover stunning ethnic wear and trendy fashion from India's most trusted vendors.
            </p>
            <Button 
              variant="shiny"
              className="w-fit px-8 py-3 rounded-full text-sm sm:text-base"
              data-testid="button-shop-now"
            >
              SHOP NOW
              <svg className="ml-2 w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" clipRule="evenodd" />
              </svg>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-serif font-bold">Products For You</h2>
              <p className="text-muted-foreground mt-2">Curated selection from our top vendors</p>
            </div>
            <Link href="/products">
              <Button variant="ghost" className="text-primary">
                View All <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {productsLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[250/325] rounded-xl" />
              ))
            ) : (
              filteredProducts.slice(0, 10).map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))
            )}
          </div>
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
