import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Target, Users, TrendingUp, Shield, Zap, Heart, Globe, Sparkles, ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "wouter";

// Animated Counter Component
function AnimatedCounter({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration]);

  return <div ref={ref}>{count}</div>;
}

export default function About() {
  const heroRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const { scrollYProgress: missionProgress } = useScroll({
    target: missionRef,
    offset: ["start end", "end start"]
  });

  const heroY = useTransform(heroProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(heroProgress, [0, 0.5, 1], [1, 0.8, 0.3]);
  const missionY = useTransform(missionProgress, [0, 1], ["0%", "20%"]);

  const values = [
    {
      icon: Shield,
      title: "Trust & Security",
      description: "We verify every vendor through rigorous KYC processes to ensure safe and secure transactions for all our partners."
    },
    {
      icon: Heart,
      title: "Customer First",
      description: "Our buyers and vendors are at the heart of everything we do. We strive to exceed expectations in every interaction."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We continuously evolve our platform with cutting-edge technology to provide the best B2B marketplace experience."
    },
    {
      icon: Globe,
      title: "Sustainability",
      description: "We're committed to supporting sustainable fashion practices and connecting ethical vendors with conscious buyers."
    }
  ];

  const stats = [
    { icon: Users, value: 500, suffix: "+", label: "Verified Vendors" },
    { icon: TrendingUp, value: 50, suffix: "K+", label: "Product Listings" },
    { icon: Award, value: 10, suffix: "K+", label: "Active Buyers" },
    { icon: Target, value: 98, suffix: "%", label: "Satisfaction Rate" }
  ];

  const milestones = [
    { year: "2020", title: "Foundation", description: "LuxeWholesale was founded with a vision to revolutionize B2B fashion commerce" },
    { year: "2021", title: "Growth", description: "Expanded to 100+ vendors and launched our verified vendor program" },
    { year: "2022", title: "Innovation", description: "Introduced advanced RFQ system and bulk pricing features" },
    { year: "2023", title: "Expansion", description: "Reached 500+ vendors and 10,000+ buyers across India" },
    { year: "2024", title: "Excellence", description: "Became India's leading wholesale fashion marketplace" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/5 to-background">
      {/* Hero Section with Enhanced Parallax */}
      <section ref={heroRef} className="relative min-h-[85vh] flex items-center justify-center overflow-hidden" style={{ position: "relative" }}>
        {/* Animated Background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/20 to-primary/5"
          style={{ y: heroY }}
        >
          {/* Floating Elements */}
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
        
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 container mx-auto px-6 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            >
              <Badge className="mb-8 px-8 py-3 text-base font-medium shadow-lg" data-testid="badge-about">
                <Sparkles className="w-4 h-4 mr-2 inline" />
                About Us
              </Badge>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif text-6xl md:text-8xl font-bold mb-8 leading-tight"
            >
              Transforming Wholesale
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                Fashion Commerce
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              We're building India's most trusted B2B marketplace, connecting premium fashion vendors with retailers nationwide.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/products">
                <Button size="lg" className="text-lg px-8 py-6 shadow-xl" data-testid="button-explore">
                  Explore Products
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6" data-testid="button-contact">
                  Contact Us
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 bg-primary rounded-full"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/10 to-primary/5" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Our Impact in Numbers
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Trusted by thousands across India
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 40, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                  delay: index * 0.15,
                  duration: 0.7,
                  type: "spring",
                  stiffness: 100
                }}
                className="relative group"
              >
                <Card className="h-full hover-elevate active-elevate-2 transition-all duration-500 border-2 overflow-hidden">
                  <CardContent className="p-8 text-center relative">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
                    </div>

                    {/* Icon */}
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 mb-6 shadow-lg"
                    >
                      <stat.icon className="w-10 h-10 text-primary" />
                    </motion.div>

                    {/* Animated Value */}
                    <div className="text-5xl font-serif font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      <AnimatedCounter end={stat.value} />
                      {stat.suffix}
                    </div>

                    {/* Label */}
                    <div className="text-sm text-muted-foreground uppercase tracking-widest font-medium">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Mission & Vision Section */}
      <section ref={missionRef} className="py-32 relative overflow-hidden" style={{ position: "relative" }}>
        <motion.div
          style={{ y: missionY }}
          className="absolute inset-0 opacity-10"
        >
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary rounded-full blur-3xl" />
        </motion.div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="h-full p-10 border-2 shadow-2xl hover-elevate transition-all duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-primary/10">
                    <Target className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="font-serif text-4xl md:text-5xl font-bold">
                    Our Mission
                  </h2>
                </div>
                <div className="space-y-4">
                  <p className="text-lg leading-relaxed">
                    To empower fashion businesses across India by creating a transparent, efficient, and trustworthy B2B marketplace that connects quality vendors with ambitious retailers.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    We believe in democratizing access to premium wholesale fashion, enabling small and medium retailers to compete with larger players through fair pricing, verified quality, and seamless logistics.
                  </p>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="h-full p-10 border-2 shadow-2xl hover-elevate transition-all duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-primary/10">
                    <Sparkles className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="font-serif text-4xl md:text-5xl font-bold">
                    Our Vision
                  </h2>
                </div>
                <div className="space-y-4">
                  <p className="text-lg leading-relaxed">
                    To become the most trusted and innovative B2B fashion platform in India, setting new standards for quality, transparency, and customer success.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    We envision a future where every fashion retailer has access to premium products, verified suppliers, and tools that help them grow their business sustainably.
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Values Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/10 via-background to-secondary/10" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge className="mb-4 px-6 py-2">Our Values</Badge>
            <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6">
              What We Stand For
            </h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
              The principles that guide everything we do and define who we are
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 60, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: index * 0.15,
                  duration: 0.7,
                  type: "spring",
                  stiffness: 100
                }}
                className="group"
              >
                <Card className="h-full hover-elevate active-elevate-2 transition-all duration-500 border-2 overflow-hidden" data-testid={`card-value-${index}`}>
                  <CardContent className="p-8 text-center relative">
                    {/* Hover Background Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Icon */}
                    <motion.div
                      whileHover={{ 
                        scale: 1.15,
                        rotate: [0, -5, 5, -5, 0]
                      }}
                      transition={{ duration: 0.5 }}
                      className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 mb-6 shadow-lg border-2 border-primary/20"
                    >
                      <value.icon className="w-12 h-12 text-primary" />
                    </motion.div>
                    
                    {/* Title */}
                    <h3 className="relative font-serif text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                      {value.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="relative text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Timeline Section */}
      <section className="py-32 bg-secondary/10">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge className="mb-4 px-6 py-2">Our Story</Badge>
            <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6">
              The Journey So Far
            </h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
              Every milestone that brought us closer to our vision
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -80 : 80, scale: 0.9 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  delay: index * 0.15, 
                  duration: 0.7,
                  type: "spring",
                  stiffness: 100
                }}
                className="relative pl-12 md:pl-16 pb-16 border-l-4 border-primary/20 last:pb-0 group"
              >
                {/* Timeline Dot */}
                <motion.div
                  whileHover={{ scale: 1.5, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="absolute -left-[13px] md:-left-[17px] top-0 w-7 h-7 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 border-4 border-background shadow-lg z-10"
                />

                {/* Glow Effect on Hover */}
                <div className="absolute -left-1 top-0 w-2 h-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Content Card */}
                <Card className="hover-elevate transition-all duration-500 border-2">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                      <Badge className="bg-primary text-primary-foreground shadow-md w-fit text-base px-4 py-2">
                        {milestone.year}
                      </Badge>
                      <h3 className="font-serif text-3xl font-bold">
                        {milestone.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {milestone.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-secondary/10 to-primary/15">
          <motion.div
            className="absolute top-10 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
            animate={{
              x: [0, -50, 0],
              y: [0, -30, 0],
              scale: [1.1, 1, 1.1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-5xl mx-auto"
          >
            <Card className="border-2 shadow-2xl overflow-hidden">
              <CardContent className="p-12 md:p-16 text-center relative">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl" />
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-secondary/5 rounded-full blur-2xl" />

                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <Badge className="mb-6 px-6 py-2 text-base">Join Us Today</Badge>
                </motion.div>

                <h2 className="font-serif text-5xl md:text-7xl font-bold mb-8 leading-tight relative">
                  Join Our Growing
                  <br />
                  <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                    Community
                  </span>
                </h2>

                <p className="text-muted-foreground text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed relative">
                  Be part of India's most trusted wholesale fashion marketplace and grow your business with us.
                </p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center relative"
                >
                  <Link href="/register">
                    <Button size="lg" className="text-lg px-10 py-7 shadow-2xl" data-testid="button-get-started">
                      Get Started Now
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/vendors">
                    <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-2" data-testid="button-browse-vendors">
                      Browse Vendors
                      <ChevronRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </motion.div>

                {/* Stats Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="mt-16 pt-12 border-t-2 border-border/50 relative"
                >
                  <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                    <div>
                      <div className="text-3xl font-bold text-primary mb-1">500+</div>
                      <div className="text-sm text-muted-foreground uppercase tracking-wider">Vendors</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-primary mb-1">50K+</div>
                      <div className="text-sm text-muted-foreground uppercase tracking-wider">Products</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-primary mb-1">10K+</div>
                      <div className="text-sm text-muted-foreground uppercase tracking-wider">Buyers</div>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
