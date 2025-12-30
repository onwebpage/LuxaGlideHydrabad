import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import type { Vendor, Product, Category, AllCmsSettings } from "@shared/schema";
import { useCategories } from "@/hooks/use-categories";
import { Skeleton } from "@/components/ui/skeleton";
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
    return apiCategories.slice(0, 12).map((cat: Category) => ({
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

      {/* Quick Category Icons */}
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

      {/* Shop by Category */}
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
              products.slice(0, 10).map((product) => (
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
