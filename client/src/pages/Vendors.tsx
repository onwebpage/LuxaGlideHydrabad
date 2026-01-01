import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Shield, CheckCircle, Users, ArrowRight, FileText, Gavel, Scale } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Vendor } from "@shared/schema";

export default function Vendors() {
  const { data: vendors = [], isLoading: vendorsLoading } = useQuery<Vendor[]>({
    queryKey: ['/api/vendors/approved'],
  });

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

  const policies = [
    {
      icon: FileText,
      title: "Verification Policy",
      description: "All vendors must submit valid business registration, PAN card, and GST details for mandatory KYC verification."
    },
    {
      icon: Gavel,
      title: "Quality Standards",
      description: "Products must meet Queen4feet quality benchmarks. Vendors must maintain a minimum 4-star rating to remain on the platform."
    },
    {
      icon: Scale,
      title: "Fair Trade Policy",
      description: "Transparent pricing, honest product descriptions, and ethical sourcing are non-negotiable requirements for all partners."
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

      {/* Vendor Policy Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-4">
              Vendor Policy
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our commitment to excellence and reliability through strict guidelines
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {policies.map((policy) => (
              <Card key={policy.title} className="bg-background border-none shadow-sm hover-elevate">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary">
                      <policy.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold">{policy.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {policy.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Join Queen4feet Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-6">
              Join Queen4feet
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Become a part of new segment of women fashion. Connect with verified vendors and grow your business.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register?role=vendor">
                <Button size="lg" className="text-lg px-10 py-6" data-testid="button-become-vendor">
                  Apply as Vendor
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="text-lg px-10 py-6" data-testid="button-register-buyer">
                  Register as Buyer
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
