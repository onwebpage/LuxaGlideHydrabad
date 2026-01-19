import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Shield, CheckCircle, Users, ArrowRight, FileText, Gavel, Scale, Zap, TrendingUp, Gem, Package, HeartHandshake } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Vendor } from "@shared/schema";

export default function Vendors() {
  const { data: vendors = [], isLoading: vendorsLoading } = useQuery<Vendor[]>({
    queryKey: ['/api/vendors/approved'],
  });

  const onboardingReasons = [
    {
      icon: TrendingUp,
      title: "10x Sales Boost",
      description: "Queen4feet is an established platform, trusted by thousands of genuine customers. We can help you boost sales and increase revenue."
    },
    {
      icon: Users,
      title: "Brand Visibility",
      description: "Boost your brand visibility by showing your products to the right audience at the right time. Branding via our platform increases authenticity."
    },
    {
      icon: Gem,
      title: "More Profit",
      description: "In this competitive market, high commission is a burden. We assure low commission rates, so you profit more from sales. We always charge fairly!"
    },
    {
      icon: Zap,
      title: "Zero Marketing Cost",
      description: "Worry no more about marketing teams! We take care of all marketing needs, ensuring your brands and products reach the right people."
    },
    {
      icon: Package,
      title: "You Ship, We Manage",
      description: "You are the best people to ship your own products. Offer self-shipping via your preferred partners, convey details, we handle the rest!"
    },
    {
      icon: HeartHandshake,
      title: "Support, Its Our Job!",
      description: "Don't worry about customer calls. We have total customer support coverage, from marketing to fulfillment. You ship, we handle customers."
    }
  ];

  const lifetimePerks = [
    "Free Promotion",
    "Xpert Support",
    "Pro Assistance",
    "100 Products added for FREE!",
    "PRO-Onboarding Service",
    "Free Marketing for Sales Boost"
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
              Accessible for KYC-verified offering premium quality products, competitive pricing, and reliable delivery across India.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-10">
              <Link href="/register?role=vendor">
                <Button size="lg" className="text-lg px-10 py-6" data-testid="button-become-vendor-hero">
                  Apply as a Vendor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Lifetime FREE Offer Section */}
      <section className="py-20 bg-[#bf953f]/5 border-y border-[#bf953f]/10">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6 text-[#bf953f]">
                  Lifetime FREE!
                </h2>
                <h3 className="text-2xl font-semibold mb-4">Host your vendor page completely free for lifetime!</h3>
                <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                  We support you, and as a part of that, you can host your store free for LIFETIME! Only pay if you need Xtra, its your choice! If you don't need Xtra, you can continue on the STARTER PLAN!
                </p>
                <div className="bg-white/50 dark:bg-zinc-900/50 p-6 rounded-xl border border-[#bf953f]/20 shadow-sm">
                  <p className="font-bold text-xl mb-4 text-[#bf953f]">Lifetime Perks</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {lifetimePerks.slice(0, 3).map((perk) => (
                      <div key={perk} className="flex items-center gap-2">
                        <Gem className="w-4 h-4 text-[#bf953f]" />
                        <span className="text-sm font-medium">{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <Card className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-[#bf953f]/30 shadow-2xl p-8 hover-elevate transition-all">
                  <h3 className="text-3xl font-serif font-bold mb-4 text-center">100-4-100 Offer</h3>
                  <p className="text-center font-bold text-primary mb-6">Register Now, First 100 get 100 Products added 4 Free!</p>
                  <p className="text-muted-foreground mb-8 text-center">
                    The first 100 sellers who register on Queen4feet will get 100 products added for free! Avoid the hassle of adding products. Hurry, get registered now and avail this offer!
                  </p>
                  <div className="space-y-4 mb-8">
                    {lifetimePerks.slice(3).map((perk) => (
                      <div key={perk} className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                        <span className="font-medium text-sm">{perk}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/register?role=vendor">
                    <Button className="w-full py-6 text-lg btn-shiny" data-testid="button-register-offer">
                      Register Now
                    </Button>
                  </Link>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why On-Board Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-4">
              Why On-Board Queen4feet?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Super-Charge your Sales with our established B2B platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {onboardingReasons.map((reason, index) => (
              <Card key={reason.title} className="hover-elevate luxury-card h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary mb-4">
                      <reason.icon className="w-6 h-6" />
                    </div>
                    <span className="text-4xl font-serif text-primary/10 font-bold">0{index + 1}</span>
                  </div>
                  <CardTitle className="text-2xl font-serif">{reason.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {reason.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-4">
              Quality Commitment
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience the benefits of shopping with verified vendor partners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title}>
                <Card className="h-full hover-elevate border-none shadow-sm">
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
      <section className="py-20">
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
      <section className="py-20 bg-[#bf953f]/5">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-6">
              Join Queen4feet Today
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Become a part of the premium wholesale segment. Connect with verified vendors and grow your business.
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
