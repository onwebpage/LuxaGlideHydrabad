import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, TrendingUp, Users, Package, CheckCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { Vendor } from "@shared/schema";
import heroImage from "@assets/generated_images/luxury_fashion_boutique_hero.png";
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

export default function Home() {
  const { data: vendors = [], isLoading: vendorsLoading } = useQuery<Vendor[]>({
    queryKey: ['/api/vendors'],
    queryFn: async () => {
      const response = await fetch('/api/vendors?kycStatus=approved&limit=4');
      if (!response.ok) throw new Error('Failed to fetch vendors');
      return response.json();
    }
  });

  const shopCategories = [
    { name: "SUITS", image: suitImage, slug: "suits" },
    { name: "NEW ARRIVALS", image: newArrivalsImage, slug: "new-arrivals", badge: "NEW" },
    { name: "KURTAS", image: kurtaImage, slug: "kurtas" },
    { name: "SAREES", image: sareeImage, slug: "sarees", badge: "UNDER", badgeValue: "1999" },
    { name: "DRESSES", image: dressImage, slug: "dresses" },
    { name: "SHIRTS", image: shirtImage, slug: "shirts" },
    { name: "CO-ORDS", image: coordsImage, slug: "co-ords" },
    { name: "LOUNGEWEAR", image: loungewearImage, slug: "loungewear" },
    { name: "BOTTOMS", image: bottomsImage, slug: "bottoms" },
    { name: "SHAWLS", image: shawlImage, slug: "shawls", badge: "SPECIAL", badgeValue: "OFFER" },
    { name: "PARTY WEAR", image: partyWearImage, slug: "party-wear", badge: "BUY 4", badgeValue: "2199" },
  ];

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
    { label: "Active Vendors", value: "500+", icon: Users },
    { label: "Products", value: "50K+", icon: Package },
    { label: "Happy Buyers", value: "10K+", icon: CheckCircle },
    { label: "Growth Rate", value: "200%", icon: TrendingUp },
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
            <Badge className="mb-8 bg-primary/20 backdrop-blur-xl border-2 border-primary/30 text-white px-8 py-3 text-base" data-testid="badge-hero">
              Premium Wholesale Marketplace
            </Badge>
            
            <h1 className="font-serif text-5xl md:text-7xl font-semibold text-white leading-tight mb-8">
              Elevate Your Fashion
              <br />
              <span className="text-primary">Business</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Connect with verified vendors, access exclusive wholesale pricing, and grow your retail business with premium women's clothing.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="text-base px-10 py-6 text-lg" data-testid="button-explore-collection">
                  Explore Collection
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/register?role=vendor">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-10 py-6 text-lg bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white hover:bg-white/20"
                  data-testid="button-become-vendor"
                >
                  Become a Vendor
                </Button>
              </Link>
            </div>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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

      {/* Premium Gold Collection Section - Meesho Style */}
      <section className="relative overflow-hidden" data-testid="section-gold-collection">
        <div className="absolute inset-0 bg-gradient-to-r from-[#2d1810] via-[#3d2518] to-[#4a2c1a]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(212, 175, 55, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)' }} />
        
        <div className="container mx-auto px-4 lg:px-6 py-12 lg:py-16 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Left Side - Branding & CTA */}
            <div className="flex-1 flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
              {/* Featured Image */}
              <div className="relative w-full max-w-sm lg:max-w-md">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                  <img 
                    src={sareeImage} 
                    alt="Premium Collection" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2d1810]/60 via-transparent to-transparent" />
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-amber-400/20 blur-2xl" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full bg-amber-300/15 blur-3xl" />
              </div>

              {/* Branding Text */}
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                  <Sparkles className="w-8 h-8 text-amber-400" />
                  <h2 className="font-serif text-4xl lg:text-5xl font-bold text-amber-400 tracking-tight">
                    Gold
                  </h2>
                </div>
                
                <p className="text-white/90 text-lg lg:text-xl mb-6 max-w-sm">
                  Products you Love. Quality we Trust.
                </p>
                
                <Link href="/products">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-2 border-amber-400 text-amber-400 bg-transparent hover:bg-amber-400/10 px-8 py-6 text-base font-semibold"
                    data-testid="button-shop-gold"
                  >
                    Shop Now
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Side - Category Cards in Arch Shape */}
            <div className="flex-1 grid grid-cols-2 gap-4 lg:gap-6 max-w-lg">
              <Link href="/products?category=sarees" className="group">
                <div className="relative bg-gradient-to-b from-[#4a3428]/80 to-[#3d2518]/80 rounded-t-full rounded-b-lg p-3 pt-6 backdrop-blur-sm border border-amber-900/30 hover:border-amber-400/50 transition-colors duration-300">
                  <div className="aspect-[3/4] rounded-t-full rounded-b-lg overflow-hidden mb-3">
                    <img 
                      src={partyWearImage} 
                      alt="Lehengas" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-center text-white font-medium text-sm">Lehengas</p>
                </div>
              </Link>

              <Link href="/products?category=kurtas" className="group">
                <div className="relative bg-gradient-to-b from-[#4a3428]/80 to-[#3d2518]/80 rounded-t-full rounded-b-lg p-3 pt-6 backdrop-blur-sm border border-amber-900/30 hover:border-amber-400/50 transition-colors duration-300">
                  <div className="aspect-[3/4] rounded-t-full rounded-b-lg overflow-hidden mb-3">
                    <img 
                      src={kurtaImage} 
                      alt="Kurtas" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-center text-white font-medium text-sm">Kurtas</p>
                </div>
              </Link>

              <Link href="/products?category=sarees" className="group">
                <div className="relative bg-gradient-to-b from-[#4a3428]/80 to-[#3d2518]/80 rounded-t-full rounded-b-lg p-3 pt-6 backdrop-blur-sm border border-amber-900/30 hover:border-amber-400/50 transition-colors duration-300">
                  <div className="aspect-[3/4] rounded-t-full rounded-b-lg overflow-hidden mb-3">
                    <img 
                      src={sareeImage} 
                      alt="Sarees" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-center text-white font-medium text-sm">Sarees</p>
                </div>
              </Link>

              <Link href="/products?category=jewellery" className="group">
                <div className="relative bg-gradient-to-b from-[#4a3428]/80 to-[#3d2518]/80 rounded-t-full rounded-b-lg p-3 pt-6 backdrop-blur-sm border border-amber-900/30 hover:border-amber-400/50 transition-colors duration-300">
                  <div className="aspect-[3/4] rounded-t-full rounded-b-lg overflow-hidden mb-3">
                    <img 
                      src={coordsImage} 
                      alt="Accessories" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-center text-white font-medium text-sm">Accessories</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vendors */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-4">
              Featured Vendors
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Partner with trusted suppliers offering premium quality products
            </p>
          </div>

          {vendorsLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Loading vendors...</p>
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-6">No verified vendors available yet.</p>
              <Link href="/register?role=vendor">
                <Button size="lg" data-testid="button-become-first-vendor">
                  Become Our First Vendor
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {vendors.map((vendor) => {
                const logoInitials = vendor.businessName
                  .split(' ')
                  .map(word => word[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <Card key={vendor.id} className="hover-elevate transition-shadow" data-testid={`card-vendor-${vendor.id}`}>
                    <CardContent className="p-6 text-center">
                      {vendor.logo ? (
                        <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden">
                          <img src={vendor.logo} alt={vendor.businessName} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl font-serif font-semibold text-primary">
                          {logoInitials}
                        </div>
                      )}
                      <h3 className="font-serif text-xl font-semibold mb-2">{vendor.businessName}</h3>
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span className="text-sm font-medium">{Number(vendor.rating).toFixed(1)}</span>
                      </div>
                      <p className="text-muted-foreground text-sm mb-4">
                        {vendor.totalSales || 0} Sales
                      </p>
                      <Link href={`/vendors/${vendor.id}`}>
                        <Button variant="outline" className="w-full" data-testid={`button-view-vendor-${vendor.id}`}>
                          View Store
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
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
