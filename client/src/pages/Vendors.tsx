import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, MapPin, Package, Award, TrendingUp, Shield, Search, Filter, CheckCircle, Users, Sparkles, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Vendor } from "@shared/schema";

export default function Vendors() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const vendorsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  
  // In-view detection for scroll reveals
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });
  const filtersInView = useInView(filtersRef, { once: true, margin: "-100px" });
  const vendorsInView = useInView(vendorsRef, { once: true, margin: "-150px" });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" });

  // Global scroll progress
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
  const heroScale = useTransform(heroProgress, [0, 1], [1, 1.15]);
  const heroRotate = useTransform(heroProgress, [0, 1], [0, 2]);

  // Stats section parallax
  const { scrollYProgress: statsProgress } = useScroll({
    target: statsRef,
    offset: ["start end", "end start"]
  });
  const statsY = useTransform(statsProgress, [0, 1], ["15%", "-15%"]);

  // Vendors section 3D parallax
  const { scrollYProgress: vendorsProgress } = useScroll({
    target: vendorsRef,
    offset: ["start end", "end start"]
  });
  const vendorsY = useTransform(vendorsProgress, [0, 1], ["10%", "-10%"]);
  const vendorsRotateX = useTransform(vendorsProgress, [0, 0.5, 1], [10, 0, -10]);

  // Fetch real vendors from database
  const { data: vendors = [], isLoading: vendorsLoading } = useQuery<Vendor[]>({
    queryKey: ['/api/vendors'],
    queryFn: async () => {
      const response = await fetch('/api/vendors?kycStatus=approved');
      if (!response.ok) throw new Error('Failed to fetch vendors');
      return response.json();
    }
  });

  const stats = [
    { icon: Shield, value: "500+", label: "Verified Vendors", color: "from-blue-500/20 to-blue-500/5" },
    { icon: Star, value: "4.8", label: "Avg. Rating", color: "from-yellow-500/20 to-yellow-500/5" },
    { icon: Package, value: "50K+", label: "Products", color: "from-purple-500/20 to-purple-500/5" },
    { icon: TrendingUp, value: "98%", label: "Satisfaction", color: "from-green-500/20 to-green-500/5" }
  ];

  const categories = [
    { name: "All Vendors", count: 500 },
    { name: "Ethnic Wear", count: 180 },
    { name: "Western Wear", count: 120 },
    { name: "Party Wear", count: 95 },
    { name: "Bridal Wear", count: 65 },
    { name: "Casual Wear", count: 140 }
  ];

  const benefits = [
    {
      icon: CheckCircle,
      title: "KYC Verified",
      description: "All vendors undergo strict verification"
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Protected transactions with escrow"
    },
    {
      icon: Award,
      title: "Quality Guaranteed",
      description: "Premium products with quality assurance"
    },
    {
      icon: Users,
      title: "Dedicated Support",
      description: "24/7 customer service for buyers"
    }
  ];

  // Animation variants
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
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.6,
        ease: [0.6, 0.05, 0.01, 0.9]
      }
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
          opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 0.3, 0])
        }}
        animate={{
          x: [0, 30, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{
          repeat: Infinity,
          duration: 20,
          ease: "easeInOut"
        }}
      />

      {/* Hero Section - Premium 3D Parallax */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden" style={{ position: "relative" }}>
        {/* Animated Gradient Background */}
        <motion.div
          className="absolute inset-0"
          style={{ 
            y: heroY,
            scale: heroScale,
            rotate: heroRotate
          }}
        >
          <motion.div
            animate={{
              background: [
                "linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 50%, rgba(0, 0, 0, 0.05) 100%)",
                "linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 50%, rgba(0, 0, 0, 0.05) 100%)",
                "linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 50%, rgba(0, 0, 0, 0.05) 100%)"
              ]
            }}
            transition={{ repeat: Infinity, duration: 10 }}
            className="absolute inset-0"
          />
        </motion.div>

        {/* Floating Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/15 blur-3xl"
          style={{
            y: useTransform(heroProgress, [0, 1], [0, -150]),
            x: useTransform(heroProgress, [0, 1], [0, 100]),
            opacity: useTransform(heroProgress, [0, 0.5, 1], [0.4, 0.2, 0])
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: 15,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-primary/10 blur-3xl"
          style={{
            y: useTransform(heroProgress, [0, 1], [0, 150]),
            x: useTransform(heroProgress, [0, 1], [0, -100]),
            opacity: useTransform(heroProgress, [0, 0.5, 1], [0.4, 0.2, 0])
          }}
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, -90, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: 12,
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
            className="max-w-5xl mx-auto"
          >
            {/* Premium Badge */}
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
            >
              <Badge className="mb-8 bg-primary/20 backdrop-blur-xl border-2 border-primary/30 px-8 py-3 text-base shadow-2xl shadow-primary/30" data-testid="badge-vendors">
                <Shield className="w-4 h-4 mr-2" />
                KYC Verified Vendors
              </Badge>
            </motion.div>
            
            {/* Animated Title */}
            <motion.div className="mb-8">
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 1, ease: [0.6, 0.05, 0.01, 0.9] }}
                className="font-serif text-6xl md:text-8xl font-semibold leading-tight mb-4"
              >
                Meet Our Trusted
              </motion.h1>
              <motion.h1
                initial={{ opacity: 0, x: -30, rotateY: -90 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                transition={{ 
                  delay: 0.9, 
                  duration: 1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{
                  scale: 1.05,
                  textShadow: "0 0 40px rgba(212, 175, 55, 0.8)",
                  transition: { duration: 0.3 }
                }}
                className="font-serif text-6xl md:text-8xl font-semibold text-primary"
                style={{
                  transformStyle: "preserve-3d",
                  textShadow: "0 0 30px rgba(212, 175, 55, 0.5)"
                }}
              >
                Vendor Partners
              </motion.h1>
            </motion.div>
            
            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Connect with KYC-verified vendors offering premium quality products, competitive wholesale pricing, and reliable delivery across India.
            </motion.p>

            {/* Become a Vendor Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.8 }}
              className="mb-12"
            >
              <Link href="/register?role=vendor">
                <Button size="lg" className="text-lg px-10 py-6" data-testid="button-become-vendor-hero">
                  Become a Vendor
                </Button>
              </Link>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.8 }}
              className="max-w-2xl mx-auto"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative"
              >
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search vendors by name, location, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-16 pr-6 py-7 text-lg rounded-full shadow-2xl border-2 backdrop-blur-xl bg-background/80"
                  data-testid="input-search-vendors"
                />
              </motion.div>
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
            className="w-8 h-12 border-2 border-foreground/30 rounded-full flex justify-center pt-2 backdrop-blur-sm bg-background/10"
          >
            <motion.div 
              className="w-2 h-2 bg-foreground/50 rounded-full"
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
                  className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} mb-6 shadow-xl`}
                  whileHover={{ 
                    rotate: 360,
                    boxShadow: "0 25px 50px rgba(212, 175, 55, 0.3)"
                  }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon className="w-12 h-12 text-primary" />
                </motion.div>
                <motion.div
                  className="text-5xl md:text-6xl font-serif font-semibold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
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

      {/* Categories Filter - Scroll Reveal */}
      <section ref={filtersRef} className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate={filtersInView ? "visible" : "hidden"}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-4">Browse by Category</h2>
            <p className="text-muted-foreground text-lg">Filter vendors by their specialization</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={filtersInView ? "visible" : "hidden"}
            className="flex flex-wrap justify-center gap-4"
          >
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                variants={scaleIn}
                whileHover={{ 
                  scale: 1.1, 
                  y: -5,
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={index === 0 ? "default" : "outline"}
                  className="px-8 py-6 text-base rounded-full shadow-lg hover:shadow-xl"
                  data-testid={`button-category-${index}`}
                >
                  {category.name}
                  <Badge variant="secondary" className="ml-2">{category.count}</Badge>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Vendors Grid - 3D Cards with Parallax */}
      <motion.section 
        ref={vendorsRef}
        className="py-32 bg-secondary/20 relative overflow-hidden"
        style={{ 
          y: vendorsY,
          rotateX: vendorsRotateX,
          transformStyle: "preserve-3d",
          position: "relative"
        }}
      >
        <motion.div 
          className="absolute inset-0 opacity-5"
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
              Browse our curated selection of verified wholesale fashion vendors
            </p>
          </motion.div>

          {vendorsLoading ? (
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate={vendorsInView ? "visible" : "hidden"}
              className="text-center py-12"
            >
              <p className="text-muted-foreground text-xl">Loading vendors...</p>
            </motion.div>
          ) : vendors.length === 0 ? (
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate={vendorsInView ? "visible" : "hidden"}
              className="text-center py-12"
            >
              <p className="text-muted-foreground text-xl mb-6">No verified vendors available yet.</p>
              <Link href="/register?role=vendor">
                <Button size="lg" data-testid="button-become-first-vendor">
                  Become Our First Vendor
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate={vendorsInView ? "visible" : "hidden"}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {vendors.map((vendor, index) => {
                const logoInitials = vendor.businessName
                  .split(' ')
                  .map(word => word[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <motion.div
                    key={vendor.id}
                    variants={fadeInUp}
                    whileHover={{ 
                      y: -25,
                      rotateY: 10,
                      rotateX: 5,
                      scale: 1.03,
                      transition: { duration: 0.4, ease: "easeOut" }
                    }}
                    style={{
                      transformStyle: "preserve-3d",
                      perspective: 1200
                    }}
                  >
                    <Card className="h-full hover-elevate transition-all duration-500 cursor-pointer backdrop-blur-sm bg-card/90 shadow-xl hover:shadow-2xl border-2 relative overflow-hidden" data-testid={`card-vendor-${vendor.id}`}>
                      <CardContent className="p-8">
                        {/* Vendor Logo and Verification */}
                        <div className="flex items-start justify-between mb-6">
                          {vendor.logo ? (
                            <motion.div
                              whileHover={{ 
                                scale: 1.2, 
                                rotate: 360,
                                transition: { duration: 0.8 }
                              }}
                              className="w-24 h-24 rounded-full overflow-hidden shadow-lg border-2 border-primary/20"
                            >
                              <img src={vendor.logo} alt={vendor.businessName} className="w-full h-full object-cover" />
                            </motion.div>
                          ) : (
                            <motion.div
                              whileHover={{ 
                                scale: 1.2, 
                                rotate: 360,
                                transition: { duration: 0.8 }
                              }}
                              className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 via-primary/15 to-primary/5 flex items-center justify-center text-3xl font-serif font-semibold text-primary shadow-lg border-2 border-primary/20"
                            >
                              {logoInitials}
                            </motion.div>
                          )}
                          {vendor.kycStatus === 'approved' && (
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                              transition={{ duration: 0.5 }}
                            >
                              <Badge className="bg-primary/10 text-primary border-2 border-primary/30 shadow-lg">
                                <Award className="w-4 h-4 mr-1" />
                                Verified
                              </Badge>
                            </motion.div>
                          )}
                        </div>

                        {/* Vendor Name */}
                        <h3 className="font-serif text-2xl font-semibold mb-2 group-hover:text-primary transition-colors">
                          {vendor.businessName}
                        </h3>
                        {vendor.gstNumber && (
                          <p className="text-sm text-muted-foreground mb-4">GST: {vendor.gstNumber}</p>
                        )}

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-6">
                          <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full">
                            <Star className="w-5 h-5 fill-primary text-primary" />
                            <span className="font-semibold text-lg">{Number(vendor.rating).toFixed(1)}</span>
                          </div>
                        </div>

                        {/* Description */}
                        {vendor.description && (
                          <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-3">
                            {vendor.description}
                          </p>
                        )}

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t-2">
                          {vendor.businessAddress && (
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                                <MapPin className="w-4 h-4" />
                              </div>
                              <p className="text-sm font-medium line-clamp-1">{vendor.businessAddress}</p>
                            </div>
                          )}
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                              <TrendingUp className="w-4 h-4" />
                            </div>
                            <p className="text-sm font-medium">{vendor.totalSales || 0} Sales</p>
                          </div>
                        </div>

                        {/* Action Button */}
                        <Link href={`/vendors/${vendor.id}`}>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button className="w-full group" data-testid={`button-view-vendor-${vendor.id}`}>
                              View Store
                              <motion.div
                                className="ml-2"
                                animate={{ x: [0, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                              >
                                <ArrowRight className="w-4 h-4" />
                              </motion.div>
                            </Button>
                          </motion.div>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Benefits Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="font-serif text-5xl md:text-6xl font-semibold mb-6">
              Why Buy from Our Vendors
            </h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
              Experience the benefits of working with verified wholesale partners
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: index * 0.15,
                  duration: 0.6,
                  type: "spring"
                }}
                whileHover={{ 
                  y: -15,
                  rotateY: 10,
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <Card className="h-full hover-elevate border-2 shadow-lg hover:shadow-2xl">
                  <CardContent className="p-8 text-center">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-6 shadow-md"
                    >
                      <benefit.icon className="w-10 h-10 text-primary" />
                    </motion.div>
                    <h3 className="font-serif text-2xl font-semibold mb-3">{benefit.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Animated Gradient */}
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
              Become a Vendor Partner
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={ctaInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-xl mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Join our platform and reach thousands of buyers across India. Grow your wholesale business with our verified marketplace.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/register?role=vendor">
                <motion.div 
                  whileHover={{ 
                    scale: 1.08, 
                    rotateZ: [0, -2, 2, 0],
                    boxShadow: "0 25px 50px rgba(212, 175, 55, 0.4)"
                  }} 
                  whileTap={{ scale: 0.95 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <Button size="lg" className="text-lg px-12 py-6 shadow-2xl shadow-primary/30" data-testid="button-become-vendor">
                    Apply as Vendor
                    <ArrowRight className="ml-2 w-5 h-5" />
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
