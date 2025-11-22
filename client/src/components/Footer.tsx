import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function Footer() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

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
    <footer className="bg-card border-t border-border mt-24">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-2xl font-semibold mb-4">LuxeWholesale</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Premium wholesale marketplace for women's fashion. Connect with verified vendors and grow your business.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" className="hover-elevate" data-testid="button-facebook">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover-elevate" data-testid="button-instagram">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover-elevate" data-testid="button-twitter">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover-elevate" data-testid="button-linkedin">
                <Linkedin className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-products">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/vendors" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-vendors">
                  Vendors
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-about">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-contact">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Business */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">For Business</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/register?role=vendor" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-become-vendor">
                  Become a Vendor
                </Link>
              </li>
              <li>
                <Link href="/register?role=buyer" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-wholesale-buyer">
                  Wholesale Buyer
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Bulk Orders
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Partnership
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to get special offers and updates.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background border-border"
                data-testid="input-newsletter-email"
              />
              <Button type="submit" className="w-full" data-testid="button-newsletter-submit">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>support@luxewholesale.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Mumbai, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} LuxeWholesale. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Refund Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
