import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, TrendingUp, Users, Package, CheckCircle, Sparkles, Shield, Zap } from "lucide-react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { useRef } from "react";
import heroImage from "@assets/generated_images/luxury_fashion_boutique_hero.png";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const vendorsRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  
  // In-view detection for scroll reveals
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });
  const featuresInView = useInView(featuresRef, { once: true, margin: "-150px" });
  const vendorsInView = useInView(vendorsRef, { once: true, margin: "-100px" });
  const categoriesInView = useInView(categoriesRef, { once: true, margin: "-100px" });
  const testimonialsInView = useInView(testimonialsRef, { once: true, margin: "-100px" });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" });

  // Global scroll progress with spring physics
  const { scrollYProgress } = useScroll();
  const scaleProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Hero parallax with multiple layers
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(heroProgress, [0, 1], ["0%", "60%"]);
  const heroOpacity = useTransform(heroProgress, [0, 0.5, 1], [1, 0.7, 0]);
  const heroScale = useTransform(heroProgress, [0, 1], [1, 1.2]);
  const heroRotate = useTransform(heroProgress, [0, 1], [0, 3]);
  const heroBlur = useTransform(heroProgress, [0, 1], ["blur(0px)", "blur(10px)"]);

  // Stats section parallax
  const { scrollYProgress: statsProgress } = useScroll({
    target: statsRef,
    offset: ["start end", "end start"]
  });
  const statsY = useTransform(statsProgress, [0, 1], ["20%", "-20%"]);

  // Features section 3D parallax
  const { scrollYProgress: featuresProgress } = useScroll({
    target: featuresRef,
    offset: ["start end", "end start"]
  });
  const featuresY = useTransform(featuresProgress, [0, 1], ["15%", "-15%"]);
  const featuresRotateX = useTransform(featuresProgress, [0, 0.5, 1], [15, 0, -15]);

  // Vendors section rotating parallax
  const { scrollYProgress: vendorsProgress } = useScroll({
    target: vendorsRef,
    offset: ["start end", "end start"]
  });
  const vendorsY = useTransform(vendorsProgress, [0, 1], ["10%", "-10%"]);
  const vendorsRotate = useTransform(vendorsProgress, [0, 0.5, 1], [-5, 0, 5]);

  // Categories section scale parallax
  const { scrollYProgress: categoriesProgress } = useScroll({
    target: categoriesRef,
    offset: ["start end", "end start"]
  });
  const categoriesY = useTransform(categoriesProgress, [0, 1], ["12%", "-12%"]);
  const categoriesScale = useTransform(categoriesProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  // Testimonials section 3D parallax
  const { scrollYProgress: testimonialsProgress } = useScroll({
    target: testimonialsRef,
    offset: ["start end", "end start"]
  });
  const testimonialsY = useTransform(testimonialsProgress, [0, 1], ["15%", "-15%"]);
  const testimonialsRotateY = useTransform(testimonialsProgress, [0, 0.5, 1], [10, 0, -10]);

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

  // Scroll reveal animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.6,
        ease: [0.6, 0.05, 0.01, 0.9]
      }
    }
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }
    }
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen overflow-hidden">
      {/* Premium Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary to-primary/50 z-50 origin-left shadow-lg shadow-primary/50"
        style={{ scaleX: scaleProgress }}
      />

      {/* 3D Floating Decorative Orbs */}
      <motion.div
        className="fixed top-20 right-10 w-40 h-40 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-3xl pointer-events-none z-0"
        style={{
          y: useTransform(scrollYProgress, [0, 1], [0, -400]),
          opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 0.3, 0]),
          scale: useTransform(scrollYProgress, [0, 1], [1, 1.5])
        }}
        animate={{
          x: [0, 30, 0],
          rotate: [0, 90, 0]
        }}
        transition={{
          repeat: Infinity,
          duration: 20,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="fixed bottom-20 left-10 w-48 h-48 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 blur-3xl pointer-events-none z-0"
        style={{
          y: useTransform(scrollYProgress, [0, 1], [0, 300]),
          opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 0.3, 0]),
          scale: useTransform(scrollYProgress, [0, 1], [1, 1.3])
        }}
        animate={{
          x: [0, -30, 0],
          rotate: [0, -90, 0]
        }}
        transition={{
          repeat: Infinity,
          duration: 15,
          ease: "easeInOut"
        }}
      />

      {/* Hero Section - Advanced Multi-Layer Parallax */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden" style={{ position: "relative" }}>
        {/* Background with 3D Parallax */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center will-change-transform"
          style={{ 
            backgroundImage: `url(${heroImage})`,
            y: heroY,
            scale: heroScale,
            rotate: heroRotate,
            filter: heroBlur
          }}
        >
          <motion.div 
            className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"
            style={{
              opacity: useTransform(heroProgress, [0, 1], [1, 0.5])
            }}
          />
        </motion.div>

        {/* Animated Gradient Orbs - 3D Feel */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/20 blur-3xl"
          style={{
            y: useTransform(heroProgress, [0, 1], [0, -200]),
            x: useTransform(heroProgress, [0, 1], [0, 150]),
            opacity: useTransform(heroProgress, [0, 0.5, 1], [0.4, 0.2, 0]),
            scale: useTransform(heroProgress, [0, 1], [1, 1.5])
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-primary/15 blur-3xl"
          style={{
            y: useTransform(heroProgress, [0, 1], [0, 200]),
            x: useTransform(heroProgress, [0, 1], [0, -150]),
            opacity: useTransform(heroProgress, [0, 0.5, 1], [0.4, 0.2, 0]),
            scale: useTransform(heroProgress, [0, 1], [1, 1.4])
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.4, 0.3]
          }}
          transition={{
            repeat: Infinity,
            duration: 10,
            ease: "easeInOut"
          }}
        />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 container mx-auto px-6 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 1.2, 
              ease: [0.6, 0.05, 0.01, 0.9],
              delay: 0.2
            }}
            className="max-w-4xl mx-auto"
          >
            {/* Premium Badge with 3D Effect */}
            <motion.div
              initial={{ opacity: 0, scale: 0, rotateX: -90 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.4,
                type: "spring",
                stiffness: 200
              }}
              whileHover={{ 
                scale: 1.1, 
                rotateZ: [0, -5, 5, 0],
                transition: { duration: 0.5 }
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <Badge className="mb-8 bg-primary/20 backdrop-blur-xl border-2 border-primary/30 text-white px-8 py-3 text-base shadow-2xl shadow-primary/30" data-testid="badge-hero">
                Premium Wholesale Marketplace
              </Badge>
            </motion.div>
            
            {/* Animated Title with Stagger */}
            <motion.div className="mb-8">
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 1, ease: [0.6, 0.05, 0.01, 0.9] }}
                className="font-serif text-6xl md:text-8xl font-semibold text-white leading-tight"
              >
                <motion.span
                  className="inline-block"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                >
                  Elevate Your Fashion
                </motion.span>
                <br />
                <motion.span
                  className="text-primary inline-block"
                  initial={{ opacity: 0, x: -30, rotateY: -90 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  transition={{ 
                    delay: 1, 
                    duration: 1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{
                    scale: 1.05,
                    textShadow: "0 0 40px rgba(212, 175, 55, 0.8)",
                    transition: { duration: 0.3 }
                  }}
                  style={{
                    transformStyle: "preserve-3d",
                    textShadow: "0 0 30px rgba(212, 175, 55, 0.5)"
                  }}
                >
                  Business
                </motion.span>
              </motion.h1>
            </motion.div>
            
            {/* Description with Fade In */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="text-xl md:text-2xl text-white/95 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Connect with verified vendors, access exclusive wholesale pricing, and grow your retail business with premium women's clothing.
            </motion.p>
            
            {/* CTA Buttons with 3D Hover */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/products">
                <motion.div
                  whileHover={{ 
                    scale: 1.05,
                    rotateX: 5,
                    rotateY: 5,
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <Button size="lg" className="text-base px-10 py-6 text-lg group shadow-2xl shadow-primary/30" data-testid="button-explore-collection">
                    Explore Collection
                    <motion.div
                      className="ml-2 inline-block"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </Button>
                </motion.div>
              </Link>
              <Link href="/register?role=vendor">
                <motion.div
                  whileHover={{ 
                    scale: 1.05,
                    rotateX: -5,
                    rotateY: -5,
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-base px-10 py-6 text-lg bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white hover:bg-white/20 shadow-2xl"
                    data-testid="button-become-vendor"
                  >
                    Become a Vendor
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Animated Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-8 h-12 border-2 border-white/50 rounded-full flex justify-center pt-2 backdrop-blur-sm bg-white/5"
          >
            <motion.div 
              className="w-2 h-2 bg-white rounded-full"
              animate={{ 
                y: [0, 20, 0],
                opacity: [1, 0.3, 1]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section - Scroll Reveal with Stagger */}
      <motion.section 
        ref={statsRef}
        className="py-24 bg-card relative overflow-hidden"
        style={{ 
          y: statsY,
          position: "relative"
        }}
      >
        <motion.div 
          className="absolute inset-0 opacity-5"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(212, 175, 55, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(212, 175, 55, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(212, 175, 55, 0.3) 0%, transparent 50%)"
            ]
          }}
          transition={{ repeat: Infinity, duration: 10 }}
        />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={statsInView ? "visible" : "hidden"}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={scaleIn}
                whileHover={{ 
                  scale: 1.15,
                  rotateY: 360,
                  transition: { 
                    rotateY: { duration: 0.8, ease: "easeInOut" },
                    scale: { duration: 0.3 }
                  }
                }}
                style={{ transformStyle: "preserve-3d" }}
                className="text-center"
              >
                <motion.div
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-6 shadow-lg"
                  whileHover={{ 
                    rotate: 360,
                    boxShadow: "0 20px 40px rgba(212, 175, 55, 0.3)"
                  }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon className="w-10 h-10 text-primary" />
                </motion.div>
                <motion.div
                  className="text-5xl font-serif font-semibold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
                  initial={{ scale: 0 }}
                  animate={statsInView ? { scale: 1 } : { scale: 0 }}
                  transition={{ 
                    delay: index * 0.15 + 0.3, 
                    type: "spring",
                    stiffness: 200,
                    damping: 10
                  }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-muted-foreground uppercase tracking-widest font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section - 3D Cards with Parallax */}
      <motion.section 
        ref={featuresRef}
        className="py-32 relative overflow-hidden"
        style={{ 
          y: featuresY,
          rotateX: featuresRotateX,
          transformStyle: "preserve-3d",
          position: "relative"
        }}
      >
        <div className="container mx-auto px-6">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            className="text-center mb-20"
          >
            <motion.h2
              className="font-serif text-5xl md:text-7xl font-semibold mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              Why Choose Us
            </motion.h2>
            <motion.p
              className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={featuresInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.3 }}
            >
              Experience the future of wholesale fashion with our premium platform
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                whileHover={{ 
                  y: -20,
                  rotateY: 15,
                  rotateX: 10,
                  scale: 1.05,
                  transition: { duration: 0.4, ease: "easeOut" }
                }}
                style={{
                  transformStyle: "preserve-3d",
                  perspective: 1000
                }}
              >
                <Card className="h-full hover-elevate transition-all duration-500 border-2 backdrop-blur-sm bg-card/50 shadow-xl hover:shadow-2xl" data-testid={`card-feature-${index}`}>
                  <CardContent className="p-8 text-center">
                    <motion.div
                      whileHover={{ 
                        scale: 1.3, 
                        rotate: 360,
                        transition: { duration: 0.8, ease: "easeInOut" }
                      }}
                      className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-6 shadow-lg"
                    >
                      <feature.icon className="w-12 h-12 text-primary" />
                    </motion.div>
                    <h3 className="font-serif text-2xl font-semibold mb-4">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Featured Vendors - 3D Carousel Effect */}
      <motion.section 
        ref={vendorsRef}
        className="py-32 bg-secondary/30 relative overflow-hidden"
        style={{ 
          y: vendorsY,
          rotate: vendorsRotate,
          position: "relative"
        }}
      >
        <motion.div 
          className="absolute inset-0 opacity-10"
          animate={{ 
            background: [
              "radial-gradient(circle at 30% 30%, rgba(212, 175, 55, 0.4) 0%, transparent 70%)",
              "radial-gradient(circle at 70% 70%, rgba(212, 175, 55, 0.4) 0%, transparent 70%)",
              "radial-gradient(circle at 30% 30%, rgba(212, 175, 55, 0.4) 0%, transparent 70%)"
            ]
          }}
          transition={{ repeat: Infinity, duration: 15 }}
        />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate={vendorsInView ? "visible" : "hidden"}
            className="text-center mb-20"
          >
            <h2 className="font-serif text-5xl md:text-7xl font-semibold mb-6">
              Featured Vendors
            </h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
              Partner with trusted suppliers offering premium quality products
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={vendorsInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {featuredVendors.map((vendor, index) => (
              <motion.div
                key={vendor.id}
                variants={slideInLeft}
                whileHover={{ 
                  y: -25, 
                  rotateY: 15,
                  rotateZ: 2,
                  scale: 1.08,
                  transition: { duration: 0.4, ease: "easeOut" }
                }}
                style={{ 
                  transformStyle: "preserve-3d",
                  perspective: 1200
                }}
              >
                <Card className="hover-elevate transition-all duration-500 cursor-pointer backdrop-blur-sm bg-card/80 shadow-xl hover:shadow-2xl" data-testid={`card-vendor-${vendor.id}`}>
                  <CardContent className="p-8 text-center">
                    <motion.div
                      whileHover={{ 
                        scale: 1.3, 
                        rotate: 360,
                        boxShadow: "0 20px 40px rgba(212, 175, 55, 0.4)"
                      }}
                      transition={{ duration: 0.8 }}
                      className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/30 via-primary/15 to-primary/5 flex items-center justify-center mx-auto mb-6 text-4xl font-serif font-semibold text-primary shadow-lg"
                    >
                      {vendor.logo}
                    </motion.div>
                    <h3 className="font-serif text-2xl font-semibold mb-3">{vendor.name}</h3>
                    <div className="flex items-center justify-center gap-1 mb-3">
                      <Star className="w-6 h-6 fill-primary text-primary" />
                      <span className="text-xl font-medium">{vendor.rating}</span>
                    </div>
                    <p className="text-muted-foreground mb-6 text-lg">
                      {vendor.products} Products
                    </p>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="outline" className="w-full" data-testid={`button-view-vendor-${vendor.id}`}>
                        View Store
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Categories - Floating 3D Grid */}
      <motion.section 
        ref={categoriesRef}
        className="py-32 relative overflow-hidden"
        style={{ 
          y: categoriesY,
          scale: categoriesScale,
          position: "relative"
        }}
      >
        <div className="container mx-auto px-6">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate={categoriesInView ? "visible" : "hidden"}
            className="text-center mb-20"
          >
            <h2 className="font-serif text-5xl md:text-7xl font-semibold mb-6">
              Trending Categories
            </h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
              Explore our diverse collection of women's fashion
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={categoriesInView ? "visible" : "hidden"}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
          >
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                variants={scaleIn}
                whileHover={{ 
                  scale: 1.15, 
                  y: -15,
                  rotateZ: [0, -10, 10, 0],
                  rotateY: 360,
                  transition: { 
                    rotateY: { duration: 0.8 },
                    scale: { duration: 0.3 },
                    y: { duration: 0.3 }
                  }
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <Card className="hover-elevate transition-all duration-300 cursor-pointer overflow-hidden group shadow-lg hover:shadow-2xl" data-testid={`card-category-${index}`}>
                  <CardContent className="p-6 text-center">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.4 }}
                      transition={{ duration: 0.6 }}
                      className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-4 shadow-md"
                    >
                      <category.icon className="w-10 h-10 text-primary" />
                    </motion.div>
                    <h3 className="font-medium text-sm mb-2 group-hover:text-primary transition-colors">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">{category.count} items</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonials - 3D Rotating Cards */}
      <motion.section 
        ref={testimonialsRef}
        className="py-32 bg-gradient-to-b from-background to-secondary/20 relative overflow-hidden"
        style={{ 
          y: testimonialsY,
          rotateY: testimonialsRotateY,
          transformStyle: "preserve-3d",
          position: "relative"
        }}
      >
        <div className="container mx-auto px-6">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate={testimonialsInView ? "visible" : "hidden"}
            className="text-center mb-20"
          >
            <h2 className="font-serif text-5xl md:text-7xl font-semibold mb-6">
              What Our Clients Say
            </h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
              Trusted by thousands of retailers across India
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={testimonialsInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={index % 2 === 0 ? slideInLeft : slideInRight}
                whileHover={{ 
                  y: -20, 
                  rotateY: 15,
                  rotateX: 10,
                  scale: 1.05,
                  transition: { duration: 0.4 }
                }}
                style={{ transformStyle: "preserve-3d", perspective: 1000 }}
              >
                <Card className="h-full backdrop-blur-sm bg-card/80 border-2 hover-elevate transition-all duration-500 shadow-xl hover:shadow-2xl" data-testid={`card-testimonial-${index}`}>
                  <CardContent className="p-8">
                    <motion.div 
                      className="flex gap-1 mb-6"
                      initial={{ opacity: 0 }}
                      animate={testimonialsInView ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ delay: index * 0.2 + 0.3 }}
                    >
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={testimonialsInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
                          transition={{ 
                            delay: index * 0.2 + 0.4 + i * 0.1, 
                            type: "spring",
                            stiffness: 200
                          }}
                          whileHover={{ 
                            scale: 1.5, 
                            rotate: 360,
                            transition: { duration: 0.5 }
                          }}
                        >
                          <Star className="w-6 h-6 fill-primary text-primary" />
                        </motion.div>
                      ))}
                    </motion.div>
                    <p className="text-muted-foreground mb-8 italic leading-relaxed text-lg">
                      "{testimonial.content}"
                    </p>
                    <div>
                      <div className="font-serif font-semibold text-xl">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section - Animated Gradient Background */}
      <motion.section 
        ref={ctaRef}
        className="py-32 relative overflow-hidden"
      >
        <motion.div
          animate={{
            background: [
              "linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%)",
              "linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.15) 100%)",
              "linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%)"
            ]
          }}
          transition={{ repeat: Infinity, duration: 8 }}
          className="absolute inset-0"
        />

        {/* 3D Floating Shapes */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
          className="absolute top-20 left-20 w-40 h-40 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-2xl"
        />
        <motion.div
          animate={{
            y: [0, 30, 0],
            x: [0, -20, 0],
            rotate: [360, 180, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
          className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 blur-2xl"
        />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate={ctaInView ? "visible" : "hidden"}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.h2
              className="font-serif text-5xl md:text-7xl font-semibold mb-8"
              whileHover={{ scale: 1.05 }}
            >
              Ready to Transform Your Business?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={ctaInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-xl mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Join thousands of successful retailers and vendors on India's fastest-growing wholesale fashion platform.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Link href="/register?role=buyer">
                <motion.div 
                  whileHover={{ 
                    scale: 1.08, 
                    rotateZ: [0, -2, 2, 0],
                    boxShadow: "0 25px 50px rgba(212, 175, 55, 0.4)"
                  }} 
                  whileTap={{ scale: 0.95 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <Button size="lg" className="text-lg px-12 py-6 shadow-2xl shadow-primary/30" data-testid="button-register-buyer">
                    Start Buying Wholesale
                  </Button>
                </motion.div>
              </Link>
              <Link href="/register?role=vendor">
                <motion.div 
                  whileHover={{ 
                    scale: 1.08, 
                    rotateZ: [0, 2, -2, 0],
                    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.2)"
                  }} 
                  whileTap={{ scale: 0.95 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <Button size="lg" variant="outline" className="text-lg px-12 py-6 border-2 shadow-xl" data-testid="button-register-vendor">
                    Start Selling
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
