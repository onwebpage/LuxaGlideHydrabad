import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, MapPin, Package, Award, TrendingUp, Shield, Search, CheckCircle, Users, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Vendor } from "@shared/schema";

export default function Vendors() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: vendors = [], isLoading: vendorsLoading } = useQuery<Vendor[]>({
    queryKey: ['/api/vendors/approved'],
  });

  const stats = [
    { icon: Shield, value: "500+", label: "Verified Vendors" },
    { icon: Star, value: "4.8", label: "Avg. Rating" },
    { icon: Package, value: "50K+", label: "Products" },
    { icon: TrendingUp, value: "98%", label: "Satisfaction" }
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <Badge className="mb-6 bg-primary/20 border-primary/30 px-6 py-2" data-testid="badge-vendors">
              <Shield className="w-4 h-4 mr-2" />
              KYC Verified Vendors
            </Badge>
            
            <h1 className="font-serif text-5xl md:text-7xl font-semibold mb-6">
              Meet Our Trusted
              <span className="block text-primary">Vendor Partners</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with KYC-verified vendors offering premium quality products, competitive wholesale pricing, and reliable delivery across India.
            </p>

            <div className="mb-10">
              <Link href="/register?role=vendor">
                <Button size="lg" className="text-lg px-10 py-6" data-testid="button-become-vendor-hero">
                  Become a Vendor
                </Button>
              </Link>
            </div>

            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search vendors by name, location, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-base rounded-full border-2"
                  data-testid="input-search-vendors"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-4xl font-serif font-semibold mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">Browse by Category</h2>
            <p className="text-muted-foreground">Filter vendors by their specialization</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {categories.map((category, index) => (
              <Button
                key={category.name}
                variant={index === 0 ? "default" : "outline"}
                className="px-6 py-5 rounded-full"
                data-testid={`button-category-${index}`}
              >
                {category.name}
                <Badge variant="secondary" className="ml-2">{category.count}</Badge>
              </Button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Vendors Grid */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-4">
              Featured Vendors
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Browse our curated selection of verified wholesale fashion vendors
            </p>
          </motion.div>

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
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {vendors.map((vendor) => {
                const logoInitials = vendor.businessName
                  .split(' ')
                  .map(word => word[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <Card key={vendor.id} className="h-full hover-elevate transition-shadow duration-300 cursor-pointer" data-testid={`card-vendor-${vendor.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        {vendor.logo ? (
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20">
                            <img src={vendor.logo} alt={vendor.businessName} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-serif font-semibold text-primary border-2 border-primary/20">
                            {logoInitials}
                          </div>
                        )}
                        {vendor.kycStatus === 'approved' && (
                          <Badge className="bg-primary/10 text-primary border-primary/30">
                            <Award className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-serif text-xl font-semibold mb-1">
                        {vendor.businessName}
                      </h3>
                      {vendor.gstNumber && (
                        <p className="text-sm text-muted-foreground mb-3">GST: {vendor.gstNumber}</p>
                      )}

                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                          <Star className="w-4 h-4 fill-primary text-primary" />
                          <span className="font-medium">{Number(vendor.rating).toFixed(1)}</span>
                        </div>
                      </div>

                      {vendor.description && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {vendor.description}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-3 mb-4 pt-3 border-t">
                        {vendor.businessAddress && (
                          <div className="text-center">
                            <MapPin className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                            <p className="text-xs text-muted-foreground line-clamp-1">{vendor.businessAddress}</p>
                          </div>
                        )}
                        <div className="text-center">
                          <TrendingUp className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                          <p className="text-xs text-muted-foreground">{vendor.totalSales || 0} Sales</p>
                        </div>
                      </div>

                      <Link href={`/vendors/${vendor.id}`}>
                        <Button className="w-full" data-testid={`button-view-vendor-${vendor.id}`}>
                          View Store
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-4">
              Why Buy from Our Vendors
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience the benefits of working with verified wholesale partners
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover-elevate">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                      <benefit.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-6">
              Become a Vendor Partner
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join our platform and reach thousands of buyers across India. Grow your wholesale business with our verified marketplace.
            </p>
            <Link href="/register?role=vendor">
              <Button size="lg" className="text-lg px-10 py-6" data-testid="button-become-vendor">
                Apply as Vendor
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
