import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, TrendingUp, Users, Package, CheckCircle, Sparkles, Shield, Zap } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import heroImage from "@assets/generated_images/luxury_fashion_boutique_hero.png";

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.3]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const featuredVendors = [
    { id: "1", name: "Elite Fashion Co.", rating: 4.8, products: 250, logo: "EF" },
    { id: "2", name: "Trends Wholesale", rating: 4.9, products: 180, logo: "TW" },
    { id: "3", name: "Premium Textiles", rating: 4.7, products: 320, logo: "PT" },
    { id: "4", name: "Style Studios", rating: 4.9, products: 195, logo: "SS" },
  ];

  const categories = [
    { name: "Sarees & Lehengas", count: 1200, icon: Sparkles },
    { name: "Kurtis & Suits", count: 850, icon: Star },
    { name: "Western Wear", count: 640, icon: TrendingUp },
    { name: "Ethnic Wear", count: 920, icon: Package },
    { name: "Winter Collection", count: 450, icon: Shield },
    { name: "Party Wear", count: 380, icon: Zap },
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

  const features = [
    {
      icon: Shield,
      title: "Verified Vendors",
      description: "All vendors are KYC verified for secure transactions"
    },
    {
      icon: Zap,
      title: "Fast Delivery",
      description: "Express shipping on bulk orders across India"
    },
    {
      icon: Star,
      title: "Quality Assured",
      description: "Premium quality products with detailed specifications"
    },
    {
      icon: TrendingUp,
      title: "Best Prices",
      description: "Competitive wholesale pricing with bulk discounts"
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section with Parallax */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden" style={{ position: "relative" }}>
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${heroImage})`,
            y: heroY,
            scale: heroScale
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 container mx-auto px-6 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <Badge className="mb-6 bg-primary/20 backdrop-blur-md border border-primary/30 text-white px-6 py-2" data-testid="badge-hero">
                Premium Wholesale Marketplace
              </Badge>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="font-serif text-6xl md:text-8xl font-semibold text-white mb-8 leading-tight"
            >
              Elevate Your Fashion
              <br />
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="text-primary"
              >
                Business
              </motion.span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="text-xl md:text-2xl text-white/95 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Connect with verified vendors, access exclusive wholesale pricing, and grow your retail business with premium women's clothing.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/products">
                <Button size="lg" className="text-base px-10 py-6 text-lg group" data-testid="button-explore-collection">
                  Explore Collection
                  <motion.div
                    className="ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </Button>
              </Link>
              <Link href="/register?role=vendor">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-10 py-6 text-lg bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20"
                  data-testid="button-become-vendor"
                >
                  Become a Vendor
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2"
          >
            <motion.div className="w-1.5 h-1.5 bg-white rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section with Stagger Animation */}
      <section className="py-20 bg-card relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                  delay: index * 0.15,
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4"
                >
                  <stat.icon className="w-8 h-8 text-primary" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.3, type: "spring" }}
                  className="text-4xl md:text-5xl font-serif font-semibold mb-2"
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-muted-foreground uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with Parallax Cards */}
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="font-serif text-5xl md:text-6xl font-semibold mb-6">
              Why Choose Us
            </h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
              Experience the future of wholesale fashion with our premium platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.6,
                  type: "spring"
                }}
                whileHover={{ y: -10 }}
              >
                <Card className="h-full hover-elevate transition-all duration-500 border-2" data-testid={`card-feature-${index}`}>
                  <CardContent className="p-8 text-center">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6"
                    >
                      <feature.icon className="w-10 h-10 text-primary" />
                    </motion.div>
                    <h3 className="font-serif text-2xl font-semibold mb-4">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vendors with Enhanced Animation */}
      <section className="py-32 bg-secondary/30 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0]
            }}
            transition={{ repeat: Infinity, duration: 20 }}
            className="absolute -top-48 -left-48 w-96 h-96 bg-primary rounded-full blur-3xl"
          />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="font-serif text-5xl md:text-6xl font-semibold mb-6">
              Featured Vendors
            </h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
              Partner with trusted suppliers offering premium quality products
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredVendors.map((vendor, index) => (
              <motion.div
                key={vendor.id}
                initial={{ opacity: 0, y: 50, rotateY: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: index * 0.15,
                  duration: 0.8,
                  type: "spring"
                }}
                whileHover={{ y: -15, rotateY: 5 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <Card className="hover-elevate transition-all duration-500 cursor-pointer backdrop-blur-sm" data-testid={`card-vendor-${vendor.id}`}>
                  <CardContent className="p-8 text-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-6 text-3xl font-serif font-semibold text-primary"
                    >
                      {vendor.logo}
                    </motion.div>
                    <h3 className="font-serif text-xl font-semibold mb-3">{vendor.name}</h3>
                    <div className="flex items-center justify-center gap-1 mb-3">
                      <Star className="w-5 h-5 fill-primary text-primary" />
                      <span className="text-lg font-medium">{vendor.rating}</span>
                    </div>
                    <p className="text-muted-foreground mb-6">
                      {vendor.products} Products
                    </p>
                    <Button variant="outline" className="w-full" data-testid={`button-view-vendor-${vendor.id}`}>
                      View Store
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories with Icon Animation */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="font-serif text-5xl md:text-6xl font-semibold mb-6">
              Trending Categories
            </h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
              Explore our diverse collection of women's fashion
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: index * 0.08,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 150
                }}
                whileHover={{ scale: 1.05, y: -8 }}
              >
                <Card className="hover-elevate transition-all duration-300 cursor-pointer overflow-hidden group" data-testid={`card-category-${index}`}>
                  <CardContent className="p-6 text-center">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.6 }}
                      className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4"
                    >
                      <category.icon className="w-8 h-8 text-primary" />
                    </motion.div>
                    <h3 className="font-medium text-sm mb-2 group-hover:text-primary transition-colors">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">{category.count} items</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials with Scroll Animation */}
      <section className="py-32 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="font-serif text-5xl md:text-6xl font-semibold mb-6">
              What Our Clients Say
            </h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
              Trusted by thousands of retailers across India
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50, rotateY: -10 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: index * 0.2,
                  duration: 0.8,
                  type: "spring"
                }}
                whileHover={{ y: -10, rotateY: 5 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <Card className="h-full backdrop-blur-sm border-2 hover-elevate transition-all duration-500" data-testid={`card-testimonial-${index}`}>
                  <CardContent className="p-8">
                    <motion.div 
                      className="flex gap-1 mb-6"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: index * 0.2 + 0.3 }}
                    >
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, rotate: -180 }}
                          whileInView={{ scale: 1, rotate: 0 }}
                          transition={{ delay: index * 0.2 + 0.4 + i * 0.1, type: "spring" }}
                        >
                          <Star className="w-5 h-5 fill-primary text-primary" />
                        </motion.div>
                      ))}
                    </motion.div>
                    <p className="text-muted-foreground mb-8 italic leading-relaxed text-lg">
                      "{testimonial.content}"
                    </p>
                    <div>
                      <div className="font-serif font-semibold text-lg">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Gradient Animation */}
      <section className="py-32 relative overflow-hidden">
        <motion.div
          animate={{
            background: [
              "linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)",
              "linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.1) 100%)",
              "linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)"
            ]
          }}
          transition={{ repeat: Infinity, duration: 8 }}
          className="absolute inset-0"
        />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="font-serif text-5xl md:text-6xl font-semibold mb-8"
            >
              Ready to Transform Your Business?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-muted-foreground text-xl mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Join thousands of successful retailers and vendors on India's fastest-growing wholesale fashion platform.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Link href="/register?role=buyer">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="text-lg px-12 py-6" data-testid="button-register-buyer">
                    Start Buying Wholesale
                  </Button>
                </motion.div>
              </Link>
              <Link href="/register?role=vendor">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="outline" className="text-lg px-12 py-6" data-testid="button-register-vendor">
                    Start Selling
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
