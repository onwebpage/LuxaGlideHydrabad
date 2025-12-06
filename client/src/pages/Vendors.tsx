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
    { icon: Shield, value: "500+", label: "Happy Vendors" },
    { icon: Users, value: "10K+", label: "Happy Customers" },
    { icon: Package, value: "50K+", label: "Products" },
    { icon: TrendingUp, value: "98%", label: "Satisfaction" }
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
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-primary/20 border-primary/30 px-6 py-2" data-testid="badge-vendors">
              <Shield className="w-4 h-4 mr-2" />
              KYC Verified Vendors
            </Badge>
            
            <h1 className="font-serif text-5xl md:text-7xl font-semibold mb-6">
              Meet Our Trusted
              <span className="block text-primary">Vendor Partners</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with KYC-verified vendors offering premium quality products, competitive pricing, and reliable delivery across India.
            </p>

            <div className="mb-10">
              <Link href="/register?role=vendor">
                <Button size="lg" className="text-lg px-10 py-6" data-testid="button-become-vendor-hero">
                  Apply as a Vendor
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
          </div>
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

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-4">
              Why Buy from Our Vendors
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience the benefits of shopping with verified vendor partners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title}>
                <Card className="h-full hover-elevate">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                      <benefit.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-6">
              Apply as a Vendor Partner
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join our platform and reach thousands of buyers across India.
            </p>
            <Link href="/register?role=vendor">
              <Button size="lg" className="text-lg px-10 py-6" data-testid="button-become-vendor">
                Apply as Vendor
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
