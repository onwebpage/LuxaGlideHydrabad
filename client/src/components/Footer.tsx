import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Mail, Phone, MapPin, Send, ShieldCheck, RefreshCcw, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCmsSettings } from "@/hooks/use-cms-settings";
import logoImage from "@assets/Untitled_design-removebg-preview_1765148207646.png";

export function Footer() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const { data: cmsSettings } = useCmsSettings();
  
  const siteName = cmsSettings?.siteMeta?.siteName || "LuxeFashion";
  const contactEmail = cmsSettings?.siteMeta?.contactEmail || "support@luxefashion.com";
  const contactPhone = cmsSettings?.siteMeta?.contactPhone || "+91 98765 43210";
  const address = cmsSettings?.siteMeta?.address || "Mumbai, Maharashtra, India";
  const copyrightText = cmsSettings?.footer?.copyrightText || `${new Date().getFullYear()} ${siteName}. All rights reserved.`;
  const socialLinks = cmsSettings?.footer?.socialLinks || [];
  
  const getSocialIcon = (platform: string) => {
    const icons: Record<string, typeof Facebook> = {
      facebook: Facebook,
      instagram: Instagram,
      twitter: Twitter,
      linkedin: Linkedin,
      youtube: Youtube,
    };
    return icons[platform.toLowerCase()] || Facebook;
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Subscribed!",
        description: "Welcome to the elite fashion circle.",
      });
      setEmail("");
    }
  };

  return (
    <footer className="relative mt-20 bg-black text-white">
      {/* Soft Dark Gradient Wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#121212] to-black opacity-95 pointer-events-none" />
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-16 pb-8">
        {/* Top Section: Brand & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16 items-start">
          {/* Brand Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4" data-testid="link-footer-home">
              <span className="text-2xl font-serif font-black tracking-tighter text-[#d4af37]">
                {siteName.toUpperCase()}
              </span>
            </Link>
            <p className="text-[#d4af37] font-serif italic text-lg mb-6 tracking-wide">
              "Feel Like a Queen, Every Day"
            </p>
            <div className="flex gap-4">
              {socialLinks.length > 0 ? (
                socialLinks.filter(link => link.isVisible !== false).map((link, index) => {
                  const Icon = getSocialIcon(link.platform);
                  return (
                    <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="group">
                      <div className="p-2 rounded-full border border-white/10 group-hover:border-[#d4af37] group-hover:bg-[#d4af37]/10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                        <Icon className="w-5 h-5 text-gray-400 group-hover:text-[#d4af37]" />
                      </div>
                    </a>
                  );
                })
              ) : (
                ['instagram', 'facebook', 'twitter', 'youtube'].map((platform) => {
                  const Icon = getSocialIcon(platform);
                  return (
                    <a key={platform} href="#" className="group">
                      <div className="p-2 rounded-full border border-white/10 group-hover:border-[#d4af37] group-hover:bg-[#d4af37]/10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                        <Icon className="w-5 h-5 text-gray-400 group-hover:text-[#d4af37]" />
                      </div>
                    </a>
                  );
                })
              )}
            </div>
          </div>

          {/* Newsletter Box */}
          <div className="lg:col-span-2 bg-[#1a1a1a] p-8 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold mb-2 tracking-tight text-white">Get exclusive fashion drops & offers</h3>
                <p className="text-gray-300 text-sm">Join our luxury community for early access and special rewards.</p>
              </div>
              <form onSubmit={handleNewsletterSubmit} className="flex w-full md:w-auto gap-2">
                <Input 
                  type="email" 
                  placeholder="Email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/50 border-white/10 focus:border-[#d4af37] h-11 w-full md:w-64"
                />
                <Button type="submit" className="bg-[#d4af37] hover:bg-[#b8962d] text-black font-bold px-6 h-11">
                  SUBSCRIBE
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-10 border-y border-white/5 mb-16">
          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="p-3 bg-white/5 rounded-xl"><ShieldCheck className="w-6 h-6 text-[#d4af37]" /></div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-white">Secure Payments</h4>
              <p className="text-xs text-gray-400">100% Protected Transactions</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center">
            <div className="p-3 bg-white/5 rounded-xl"><RefreshCcw className="w-6 h-6 text-[#d4af37]" /></div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-white">Easy Returns</h4>
              <p className="text-xs text-gray-400">7-Day Hassle-Free Policy</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center sm:justify-end">
            <div className="p-3 bg-white/5 rounded-xl"><UserCheck className="w-6 h-6 text-[#d4af37]" /></div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-white">Trusted Vendors</h4>
              <p className="text-xs text-gray-400">Verified Quality Standards</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-[0.2em] mb-6">Collections</h4>
            <ul className="space-y-4">
              <li><Link href="/products" className="text-gray-300 hover:text-[#d4af37] transition-all duration-300 text-sm">All Products</Link></li>
              <li><Link href="/products?category=sarees" className="text-gray-300 hover:text-[#d4af37] transition-all duration-300 text-sm">Sarees</Link></li>
              <li><Link href="/products?category=kurtis" className="text-gray-300 hover:text-[#d4af37] transition-all duration-300 text-sm">Kurtis</Link></li>
              <li><Link href="/products?category=dresses" className="text-gray-300 hover:text-[#d4af37] transition-all duration-300 text-sm">Dresses</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-[0.2em] mb-6">Company</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-gray-300 hover:text-[#d4af37] transition-all duration-300 text-sm">Our Story</Link></li>
              <li><Link href="/vendors" className="text-gray-300 hover:text-[#d4af37] transition-all duration-300 text-sm">Our Vendors</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-[#d4af37] transition-all duration-300 text-sm">Contact Us</Link></li>
              <li><Link href="/register?role=vendor" className="text-gray-300 hover:text-[#d4af37] transition-all duration-300 text-sm">Sell with Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-[0.2em] mb-6">Support</h4>
            <ul className="space-y-4">
              <li><Link href="/shipping-policy" className="text-gray-300 hover:text-[#d4af37] transition-all duration-300 text-sm">Shipping Policy</Link></li>
              <li><Link href="/refund-policy" className="text-gray-300 hover:text-[#d4af37] transition-all duration-300 text-sm">Return Center</Link></li>
              <li><Link href="/terms-of-service" className="text-gray-300 hover:text-[#d4af37] transition-all duration-300 text-sm">Order Tracking</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-[#d4af37] transition-all duration-300 text-sm">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-[0.2em] mb-6">Get In Touch</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-gray-300"><Mail className="w-4 h-4 text-[#d4af37]" /> {contactEmail}</li>
              <li className="flex items-center gap-3 text-sm text-gray-300"><Phone className="w-4 h-4 text-[#d4af37]" /> {contactPhone}</li>
              <li className="flex items-start gap-3 text-sm text-gray-300"><MapPin className="w-4 h-4 text-[#d4af37] mt-1" /> {address}</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#d4af37]/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-gray-500 font-medium">
              &copy; {copyrightText}
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              <Link href="/privacy-policy" className="text-xs text-gray-500 hover-elevate transition-colors uppercase tracking-widest">Privacy Policy</Link>
              <Link href="/terms-of-service" className="text-xs text-gray-500 hover-elevate transition-colors uppercase tracking-widest">Terms of Service</Link>
              <Link href="/refund-policy" className="text-xs text-gray-500 hover-elevate transition-colors uppercase tracking-widest">Refund Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
