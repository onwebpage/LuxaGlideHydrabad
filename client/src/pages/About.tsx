import { useRef, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Target, Users, TrendingUp, Shield, Zap, Star, Globe, Sparkles, ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "wouter";

function AnimatedCounter({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
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
  }, [isVisible, end, duration]);

  return <div ref={ref}>{count}</div>;
}

export default function About() {
  const values = [
    {
      icon: Shield,
      title: "Trust & Security",
      description: "We verify every vendor through rigorous KYC processes to ensure safe and secure transactions for all our partners."
    },
    {
      icon: Star,
      title: "Customer First",
      description: "Our buyers and vendors are at the center of everything we do. We strive to exceed expectations in every interaction."
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
    { year: "2022", title: "Innovation", description: "Introduced advanced bulk pricing features and streamlined ordering" },
    { year: "2023", title: "Expansion", description: "Reached 500+ vendors and 10,000+ buyers across India" },
    { year: "2024", title: "Excellence", description: "Became India's leading wholesale fashion marketplace" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/5 to-background">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/20 to-primary/5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="max-w-5xl mx-auto">
            <Badge className="mb-8 px-8 py-3 text-base font-medium shadow-lg" data-testid="badge-about">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              About Us
            </Badge>
            
            <h1 className="font-serif text-6xl md:text-8xl font-bold mb-8 leading-tight">
              Transforming Wholesale
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                Fashion Commerce
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              We're building India's most trusted B2B marketplace, connecting premium fashion vendors with retailers nationwide.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
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
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/10 to-primary/5" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Our Impact in Numbers
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Trusted by thousands across India
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="relative group">
                <Card className="h-full hover-elevate active-elevate-2 transition-all duration-500 border-2 overflow-hidden">
                  <CardContent className="p-8 text-center relative">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
                    </div>

                    <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 mb-6 shadow-lg">
                      <stat.icon className="w-10 h-10 text-primary" />
                    </div>

                    <div className="text-5xl font-serif font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      <AnimatedCounter end={stat.value} />
                      {stat.suffix}
                    </div>

                    <div className="text-sm text-muted-foreground uppercase tracking-widest font-medium">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            <div>
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
            </div>

            <div>
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
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/10 via-background to-secondary/10" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <Badge className="mb-4 px-6 py-2">Our Values</Badge>
            <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6">
              What We Stand For
            </h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
              The principles that guide everything we do and define who we are
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={value.title} className="group">
                <Card className="h-full hover-elevate active-elevate-2 transition-all duration-500 border-2 overflow-hidden" data-testid={`card-value-${index}`}>
                  <CardContent className="p-8 text-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 mb-6 shadow-lg border-2 border-primary/20">
                      <value.icon className="w-12 h-12 text-primary" />
                    </div>
                    
                    <h3 className="relative font-serif text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                      {value.title}
                    </h3>
                    
                    <p className="relative text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-32 bg-secondary/10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <Badge className="mb-4 px-6 py-2">Our Story</Badge>
            <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6">
              The Journey So Far
            </h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
              Every milestone that brought us closer to our vision
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {milestones.map((milestone, index) => (
              <div
                key={milestone.year}
                className="relative pl-12 md:pl-16 pb-16 border-l-4 border-primary/20 last:pb-0 group"
              >
                <div className="absolute -left-[13px] md:-left-[17px] top-0 w-7 h-7 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 border-4 border-background shadow-lg z-10" />

                <div className="absolute -left-1 top-0 w-2 h-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-secondary/10 to-primary/15">
          <div className="absolute top-10 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto">
            <Card className="border-2 shadow-2xl overflow-hidden">
              <CardContent className="p-12 md:p-16 text-center relative">
                <div className="absolute top-0 left-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl" />
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-secondary/5 rounded-full blur-2xl" />

                <Badge className="mb-6 px-6 py-2 text-base">Join Us Today</Badge>

                <h2 className="font-serif text-5xl md:text-7xl font-bold mb-8 leading-tight relative">
                  Join Our Growing
                  <br />
                  <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                    Community
                  </span>
                </h2>

                <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed relative">
                  Whether you're a vendor looking to expand or a retailer seeking quality products, we're here to help you succeed.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative">
                  <Link href="/register">
                    <Button size="lg" className="text-lg px-10 py-6 shadow-xl" data-testid="button-join">
                      Get Started Today
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/vendors">
                    <Button size="lg" variant="outline" className="text-lg px-10 py-6" data-testid="button-vendors">
                      Browse Vendors
                      <ChevronRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
