import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Package, Award, TrendingUp, Shield } from "lucide-react";

export default function Vendors() {
  const heroRef = useRef<HTMLDivElement>(null);
  const vendorsRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const { scrollYProgress: vendorsProgress } = useScroll({
    target: vendorsRef,
    offset: ["start end", "end start"]
  });

  const heroY = useTransform(heroProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(heroProgress, [0, 0.5, 1], [1, 0.8, 0.3]);
  const vendorsY = useTransform(vendorsProgress, [0, 1], ["0%", "15%"]);

  // Mock vendor data - will be replaced with API calls
  const vendors = [
    {
      id: "1",
      name: "Elite Fashion Co.",
      businessName: "Elite Fashion Private Limited",
      logo: "EF",
      rating: 4.8,
      reviewCount: 245,
      products: 250,
      location: "Mumbai, Maharashtra",
      description: "Premium women's ethnic wear manufacturer with 15+ years of experience",
      tags: ["Ethnic Wear", "Premium Quality", "Fast Delivery"],
      verified: true
    },
    {
      id: "2",
      name: "Trends Wholesale",
      businessName: "Trends Wholesale Hub",
      logo: "TW",
      rating: 4.9,
      reviewCount: 312,
      products: 180,
      location: "Delhi, NCR",
      description: "Leading supplier of contemporary fashion and western wear",
      tags: ["Western Wear", "Bulk Orders", "Nationwide Shipping"],
      verified: true
    },
    {
      id: "3",
      name: "Premium Textiles",
      businessName: "Premium Textiles & Fabrics",
      logo: "PT",
      rating: 4.7,
      reviewCount: 198,
      products: 320,
      location: "Surat, Gujarat",
      description: "Specialized in sarees, lehengas and traditional Indian wear",
      tags: ["Sarees", "Lehengas", "Custom Orders"],
      verified: true
    },
    {
      id: "4",
      name: "Style Studios",
      businessName: "Style Studios International",
      logo: "SS",
      rating: 4.9,
      reviewCount: 276,
      products: 195,
      location: "Bangalore, Karnataka",
      description: "Modern fusion wear and party collections for boutique owners",
      tags: ["Party Wear", "Designer Collection", "Quick Turnaround"],
      verified: true
    },
    {
      id: "5",
      name: "Royal Garments",
      businessName: "Royal Garments Pvt Ltd",
      logo: "RG",
      rating: 4.6,
      reviewCount: 167,
      products: 210,
      location: "Jaipur, Rajasthan",
      description: "Traditional Rajasthani wear and bridal collections",
      tags: ["Bridal Wear", "Handcrafted", "Traditional"],
      verified: true
    },
    {
      id: "6",
      name: "Urban Styles",
      businessName: "Urban Styles Fashion House",
      logo: "US",
      rating: 4.8,
      reviewCount: 289,
      products: 165,
      location: "Pune, Maharashtra",
      description: "Contemporary casual wear and office wear collections",
      tags: ["Casual Wear", "Office Wear", "Affordable"],
      verified: true
    }
  ];

  const stats = [
    { icon: Shield, value: "500+", label: "Verified Vendors" },
    { icon: Star, value: "4.8", label: "Avg. Rating" },
    { icon: Package, value: "50K+", label: "Products" },
    { icon: TrendingUp, value: "98%", label: "Satisfaction" }
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
            <Badge className="mb-6 px-6 py-2" data-testid="badge-vendors">
              Verified Vendors
            </Badge>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1 }}
              className="font-serif text-5xl md:text-7xl font-semibold mb-8 leading-tight"
            >
              Meet Our Trusted
              <br />
              <span className="text-primary">Vendor Partners</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Connect with KYC-verified vendors offering premium quality products and competitive wholesale pricing.
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

      {/* Vendors Grid with Parallax */}
      <section ref={vendorsRef} className="py-32 relative overflow-hidden" style={{ position: "relative" }}>
        <motion.div
          style={{ y: vendorsY }}
          className="absolute inset-0 opacity-5"
        >
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
        </motion.div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-5xl md:text-6xl font-semibold mb-6">
              Featured Vendors
            </h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
              Browse our curated selection of verified wholesale fashion vendors
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vendors.map((vendor, index) => (
              <motion.div
                key={vendor.id}
                initial={{ opacity: 0, y: 50, rotateY: -10 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.8,
                  type: "spring"
                }}
                whileHover={{ y: -10, rotateY: 3 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <Card className="h-full hover-elevate transition-all duration-500 cursor-pointer" data-testid={`card-vendor-${vendor.id}`}>
                  <CardContent className="p-8">
                    {/* Vendor Logo and Verification */}
                    <div className="flex items-start justify-between mb-6">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-2xl font-serif font-semibold text-primary"
                      >
                        {vendor.logo}
                      </motion.div>
                      {vendor.verified && (
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          <Award className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    {/* Vendor Name */}
                    <h3 className="font-serif text-2xl font-semibold mb-2">{vendor.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{vendor.businessName}</p>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-primary text-primary" />
                        <span className="font-medium text-lg">{vendor.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">({vendor.reviewCount} reviews)</span>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                      {vendor.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {vendor.tags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Location and Products */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-6 pt-4 border-t">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{vendor.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        <span>{vendor.products} products</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link href={`/vendor/${vendor.id}`}>
                      <Button className="w-full" data-testid={`button-view-vendor-${vendor.id}`}>
                        View Store
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
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
              Become a Vendor Partner
            </h2>
            <p className="text-muted-foreground text-xl mb-12 leading-relaxed">
              Join our platform and reach thousands of buyers across India. Get started today!
            </p>
            <Link href="/register?role=vendor">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="text-lg px-12 py-6" data-testid="button-become-vendor">
                  Apply as Vendor
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
