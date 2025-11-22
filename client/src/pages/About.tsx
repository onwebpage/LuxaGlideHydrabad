import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Target, Users, TrendingUp, Shield, Zap, Heart, Globe } from "lucide-react";

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
    { icon: Users, value: "500+", label: "Verified Vendors" },
    { icon: TrendingUp, value: "50K+", label: "Product Listings" },
    { icon: Award, value: "10K+", label: "Active Buyers" },
    { icon: Target, value: "98%", label: "Satisfaction Rate" }
  ];

  const milestones = [
    { year: "2020", title: "Foundation", description: "LuxeWholesale was founded with a vision to revolutionize B2B fashion commerce" },
    { year: "2021", title: "Growth", description: "Expanded to 100+ vendors and launched our verified vendor program" },
    { year: "2022", title: "Innovation", description: "Introduced advanced RFQ system and bulk pricing features" },
    { year: "2023", title: "Expansion", description: "Reached 500+ vendors and 10,000+ buyers across India" },
    { year: "2024", title: "Excellence", description: "Became India's leading wholesale fashion marketplace" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Parallax */}
      <section ref={heroRef} className="relative h-[70vh] flex items-center justify-center overflow-hidden" style={{ position: "relative" }}>
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/30 to-accent/20"
          style={{ y: heroY }}
        />
        
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
            <Badge className="mb-6 px-6 py-2" data-testid="badge-about">
              About Us
            </Badge>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1 }}
              className="font-serif text-5xl md:text-7xl font-semibold mb-8 leading-tight"
            >
              Transforming Wholesale
              <br />
              <span className="text-primary">Fashion Commerce</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              We're building India's most trusted B2B marketplace, connecting premium fashion vendors with retailers nationwide.
            </motion.p>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.6,
                  type: "spring"
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
                <div className="text-4xl font-serif font-semibold mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section with Parallax */}
      <section ref={missionRef} className="py-32 relative overflow-hidden" style={{ position: "relative" }}>
        <motion.div
          style={{ y: missionY }}
          className="absolute inset-0 opacity-5"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
        </motion.div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                To empower fashion businesses across India by creating a transparent, efficient, and trustworthy B2B marketplace that connects quality vendors with ambitious retailers.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We believe in democratizing access to premium wholesale fashion, enabling small and medium retailers to compete with larger players through fair pricing, verified quality, and seamless logistics.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-6">
                Our Vision
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                To become the most trusted and innovative B2B fashion platform in India, setting new standards for quality, transparency, and customer success.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We envision a future where every fashion retailer has access to premium products, verified suppliers, and tools that help them grow their business sustainably.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-32 bg-secondary/20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="font-serif text-5xl md:text-6xl font-semibold mb-6">
              Our Core Values
            </h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.6,
                  type: "spring"
                }}
                whileHover={{ y: -10, rotateY: 5 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <Card className="h-full hover-elevate transition-all duration-500" data-testid={`card-value-${index}`}>
                  <CardContent className="p-8 text-center">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6"
                    >
                      <value.icon className="w-10 h-10 text-primary" />
                    </motion.div>
                    <h3 className="font-serif text-2xl font-semibold mb-4">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="font-serif text-5xl md:text-6xl font-semibold mb-6">
              Our Journey
            </h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
              Milestones that shaped our story
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="relative pl-8 pb-12 border-l-2 border-primary/30 last:pb-0"
              >
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-primary border-4 border-background"
                />
                <div className="mb-2">
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    {milestone.year}
                  </Badge>
                </div>
                <h3 className="font-serif text-2xl font-semibold mb-2">{milestone.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{milestone.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="font-serif text-5xl md:text-6xl font-semibold mb-8">
              Join Our Growing Community
            </h2>
            <p className="text-muted-foreground text-xl mb-12 leading-relaxed">
              Be part of India's most trusted wholesale fashion marketplace and grow your business with us.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
