import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCmsSettings } from "@/hooks/use-cms-settings";

export function Footer() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const { data: cmsSettings } = useCmsSettings();
  
  const siteName = cmsSettings?.siteMeta?.siteName || "LuxeWholesale";
  const tagline = cmsSettings?.siteMeta?.tagline || "India's premier B2B wholesale marketplace for women's fashion. Connect with verified vendors and grow your retail business.";
  const contactEmail = cmsSettings?.siteMeta?.contactEmail || "support@luxewholesale.com";
  const contactPhone = cmsSettings?.siteMeta?.contactPhone || "+91 98765 43210";
  const address = cmsSettings?.siteMeta?.address || "Mumbai, Maharashtra, India";
  const copyrightText = cmsSettings?.footer?.copyrightText || `${new Date().getFullYear()} ${siteName}. All rights reserved.`;
  const showNewsletter = cmsSettings?.footer?.showNewsletter !== false;
  const newsletterTitle = cmsSettings?.footer?.newsletterTitle || "Stay Updated";
  const newsletterDescription = cmsSettings?.footer?.newsletterDescription || "Get exclusive wholesale deals, new arrivals, and industry insights delivered to your inbox.";
  const socialLinks = cmsSettings?.footer?.socialLinks || [];
  
  const getSocialIcon = (platform: string) => {
    const icons: Record<string, typeof Facebook> = {
      facebook: Facebook,
      instagram: Instagram,
      twitter: Twitter,
      linkedin: Linkedin,
    };
    return icons[platform.toLowerCase()] || Facebook;
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setEmail("");
    }
  };

  return (
    <footer className="relative mt-32">
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
      
      {/* Main Footer Content */}
      <div className="bg-gradient-to-b from-secondary/30 via-background to-card">
        <div className="container mx-auto px-6 pt-20 pb-12">
          {/* Top Section - Brand & Newsletter */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Brand Section */}
            <div>
              <h3 className="font-serif text-3xl font-semibold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {siteName}
              </h3>
              <p className="text-muted-foreground text-lg mb-8 max-w-md leading-relaxed">
                {tagline}
              </p>
              <div className="flex gap-3">
                {socialLinks.length > 0 ? (
                  socialLinks.filter(link => link.isVisible !== false).map((link, index) => {
                    const Icon = getSocialIcon(link.platform);
                    return (
                      <a key={index} href={link.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="icon" className="hover-elevate" data-testid={`button-social-${link.platform.toLowerCase()}`}>
                          <Icon className="w-5 h-5" />
                        </Button>
                      </a>
                    );
                  })
                ) : (
                  <>
                    <Button variant="outline" size="icon" className="hover-elevate" data-testid="button-facebook">
                      <Facebook className="w-5 h-5" />
                    </Button>
                    <Button variant="outline" size="icon" className="hover-elevate" data-testid="button-instagram">
                      <Instagram className="w-5 h-5" />
                    </Button>
                    <Button variant="outline" size="icon" className="hover-elevate" data-testid="button-twitter">
                      <Twitter className="w-5 h-5" />
                    </Button>
                    <Button variant="outline" size="icon" className="hover-elevate" data-testid="button-linkedin">
                      <Linkedin className="w-5 h-5" />
                    </Button>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* Links Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-6 text-foreground">Quick Links</h4>
              <ul className="space-y-4">
                <li>
                  <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors text-sm" data-testid="link-footer-products">
                    Collections
                  </Link>
                </li>
                <li>
                  <Link href="/vendors" className="text-muted-foreground hover:text-primary transition-colors text-sm" data-testid="link-footer-vendors">
                    Vendors
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm" data-testid="link-footer-about">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm" data-testid="link-footer-contact">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Business */}
            <div>
              <h4 className="font-semibold mb-6 text-foreground">For Business</h4>
              <ul className="space-y-4">
                <li>
                  <Link href="/register?role=vendor" className="text-muted-foreground hover:text-primary transition-colors text-sm" data-testid="link-footer-become-vendor">
                    Apply as a Vendor
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-6 text-foreground">Support</h4>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    Returns
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    Track Order
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold mb-6 text-foreground">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-2">
                  <Mail className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">{contactEmail}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">{contactPhone}</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">{address}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-sm text-muted-foreground text-center md:text-left">
                &copy; {copyrightText}
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Refund Policy
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
