import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Shield, Zap, Star, Globe, Sparkles, ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function About() {
  const values = [
    {
      icon: Shield,
      title: "Trust & Security",
      description: "We verify every seller to ensure safe and secure transactions for all our customers."
    },
    {
      icon: Star,
      title: "Customer First",
      description: "Our customers are at the center of everything we do. We strive to exceed expectations in every interaction."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We continuously evolve our platform with cutting-edge technology to provide the best shopping experience."
    },
    {
      icon: Globe,
      title: "Sustainability",
      description: "We're committed to supporting sustainable fashion practices and connecting ethical sellers with conscious shoppers."
    }
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
              Your Destination for
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                Fashion Shopping
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              We're building India's most trusted multi-vendor marketplace, connecting you with premium fashion from sellers nationwide.
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
                    To make premium fashion accessible to everyone by creating a transparent, efficient, and trustworthy marketplace that connects quality sellers with fashion-conscious shoppers.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    We believe in democratizing access to stylish fashion through fair pricing, verified quality, and seamless delivery to your doorstep.
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
                    To become India's most loved fashion marketplace, setting new standards for quality, variety, and customer satisfaction.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    We envision a future where every fashion lover has access to premium styles from trusted sellers at prices that feel right.
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
                  Whether you're a seller looking to grow or a shopper seeking trendy styles, we're here to help you find what you love.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative">
                  <Link href="/register">
                    <Button size="lg" className="text-lg px-10 py-6 shadow-xl" data-testid="button-join">
                      Get Started Today
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/register?role=vendor">
                    <Button size="lg" variant="outline" className="text-lg px-10 py-6" data-testid="button-apply-vendor">
                      Apply as Vendor
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
