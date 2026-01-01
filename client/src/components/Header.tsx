import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { ShoppingCart, User, Search, Menu, X, ChevronDown, Shield, Store, LogOut, LayoutGrid, Truck, MessageSquare, Sparkles, ArrowRight, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useCmsSettings } from "@/hooks/use-cms-settings";
import { useCart } from "@/hooks/use-cart";
import ThemeToggle from "@/components/ThemeToggle";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
import logoImage from "@assets/Untitled_design-removebg-preview_1765148207646.png";

export function Header() {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { data: cmsSettings } = useCmsSettings();
  const { cartItemCount } = useCart();
  const isLoggedIn = !!user;
  
  // AI Smart Search logic
  const { data: suggestions = [] } = useQuery<Product[]>({
    queryKey: ['/api/ai/search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim() || searchQuery.length < 3) return [];
      const response = await fetch(`/api/ai/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      return response.json();
    },
    enabled: searchQuery.length >= 3,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive"
      });
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setShowSuggestions(true);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast({
        title: "Voice Error",
        description: "Could not recognize your voice. Please try again.",
        variant: "destructive"
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
      setShowSuggestions(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] md:relative md:top-auto">
      {/* Main Header - White Background with Gold Border */}
      <div className="bg-white dark:bg-black border-b border-[#d4af37]/30 dark:border-[#d4af37]/20 shadow-sm">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-20 lg:h-24 gap-4">
            {/* Logo - Removed Image, showing Site Name */}
            <Link href="/" className="flex-shrink-0 flex items-center" data-testid="link-home">
              <h1 className="text-xl lg:text-2xl font-serif font-black tracking-tighter luxury-gold-text drop-shadow-sm">
                {cmsSettings?.siteMeta?.siteName || "QUEEN 4FEET"}
              </h1>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:block flex-1 max-w-2xl mx-4 lg:mx-8 relative" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative group">
                
                <div className="relative flex items-center bg-gray-50/80 dark:bg-zinc-900/60 backdrop-blur-2xl border border-gray-200 dark:border-[#d4af37]/30 rounded-full px-6 h-14 transition-all duration-500 group-focus-within:border-[#d4af37] group-focus-within:bg-white dark:group-focus-within:bg-black">
                  <div className="flex items-center gap-3">
                    <Search className="w-6 h-6 text-gray-400 group-focus-within:text-[#d4af37] group-focus-within:scale-125 group-focus-within:rotate-12 transition-all duration-500 ease-out" />
                    
                    {/* AI Smart Search Indicator */}
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 group-focus-within:hidden transition-all duration-300">
                      <Sparkles className="w-4 h-4 text-[#d4af37] animate-pulse" />
                      <span className="text-[10px] font-black text-[#d4af37] tracking-[0.2em] uppercase">AI SMART</span>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Search Kurtis, Brands or Product Code…"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={handleSearchKeyDown}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-base px-5 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 font-light tracking-wide outline-none h-full"
                    data-testid="input-search"
                  />

                  <div className="flex items-center gap-2">
                    {/* Voice Search Feature */}
                    <Button 
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        startVoiceSearch();
                      }}
                      className={`rounded-full w-10 h-10 transition-all duration-300 ${isListening ? 'bg-[#d4af37] text-white animate-pulse shadow-lg shadow-[#d4af37]/30' : 'text-gray-400 hover:text-[#d4af37] hover:bg-[#d4af37]/10'}`}
                      title="Voice Search"
                      data-testid="button-voice-search"
                    >
                      <Mic className="w-5 h-5" />
                    </Button>

                    <Button 
                      type="submit" 
                      size="icon"
                      className="rounded-full w-10 h-10 bg-[#d4af37] hover:bg-[#f1d279] text-white shadow-lg shadow-[#d4af37]/30 transition-all active:scale-90 hover:scale-110"
                      data-testid="button-search-submit"
                    >
                      <ArrowRight className="w-6 h-6" />
                    </Button>
                  </div>
                </div>
              </form>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-background border border-gray-100 dark:border-border rounded-2xl shadow-2xl overflow-hidden z-[60] backdrop-blur-xl"
                  >
                    {/* Default Trending Suggestions when no query */}
                    {!searchQuery && (
                      <div className="p-6 border-b border-gray-50 dark:border-[#d4af37]/10 bg-gradient-to-br from-white to-gray-50 dark:from-black dark:to-zinc-900/50">
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="w-4 h-4 text-[#d4af37]" />
                          <p className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.3em]">Trending Now</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {['Banarasi Silk', 'Cotton Kurti', 'Wedding Collection', 'Under ₹1999'].map((tag) => (
                            <button
                              key={tag}
                              onClick={() => {
                                setSearchQuery(tag);
                                setLocation(`/products?search=${encodeURIComponent(tag)}`);
                                setShowSuggestions(false);
                              }}
                              className="px-5 py-2.5 text-xs font-semibold rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-[#d4af37]/20 text-gray-700 dark:text-gray-200 hover:border-[#d4af37] hover:text-[#d4af37] hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all active:scale-95"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {suggestions.length > 0 && (
                      <div className="p-2">
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-50 dark:border-border/50 mb-1">
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">AI Smart Suggestions</p>
                        </div>
                        {suggestions.map((product) => {
                        const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
                        const image = Array.isArray(images) && images.length > 0 ? images[0] : '/placeholder.jpg';
                        return (
                          <Link 
                            key={product.id} 
                            href={`/products/${product.id}`}
                            onClick={() => setShowSuggestions(false)}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-muted transition-colors rounded-md group"
                          >
                            <div className="w-12 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                              <img src={image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium truncate">{product.name}</h4>
                              <p className="text-sm font-bold text-primary">₹{parseFloat(product.price).toLocaleString()}</p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-300 -rotate-90" />
                          </Link>
                        );
                      })}
                      <Link 
                        href={`/products?search=${encodeURIComponent(searchQuery)}`}
                        onClick={() => setShowSuggestions(false)}
                        className="block w-full p-3 text-center text-sm font-medium text-primary hover:bg-primary/5 transition-colors border-t border-gray-50 mt-1"
                      >
                        See all results for "{searchQuery}"
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 lg:gap-2">
              {/* Profile */}
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors" data-testid="button-profile-dropdown">
                      <User className="w-5 h-5" />
                      <div className="hidden lg:flex flex-col leading-tight">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Hello,</span>
                        <span className="font-medium truncate max-w-[80px]">{user?.fullName?.split(' ')[0] || 'User'}</span>
                      </div>
                      <ChevronDown className="w-4 h-4 hidden lg:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link 
                        href={user?.role === 'vendor' ? '/dashboard/vendor' : user?.role === 'buyer' ? '/dashboard/buyer' : '/dashboard'} 
                        className="flex items-center gap-2 cursor-pointer"
                        data-testid="link-dashboard"
                      >
                        <User className="w-4 h-4" />
                        My Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={async () => {
                        await logout();
                        setLocation('/');
                      }}
                      className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                      data-testid="button-logout"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors" data-testid="link-login">
                  <User className="w-5 h-5" />
                  <div className="hidden lg:flex flex-col leading-tight">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Sign In</span>
                    <span className="font-medium">Profile</span>
                  </div>
                </Link>
              )}

              {/* Cart */}
              <Link href="/cart" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-primary transition-colors relative dark:text-gray-300" data-testid="link-cart">
                <div className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-[10px] bg-primary text-white">
                      {cartItemCount}
                    </Badge>
                  )}
                </div>
                <div className="hidden lg:flex flex-col leading-tight">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Your</span>
                  <span className="font-medium">Cart</span>
                </div>
              </Link>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden ml-1"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search - Hidden based on user request */}
          {/* <form onSubmit={handleSearch} className="md:hidden pb-2">
            <div className="relative flex">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 h-10 bg-gray-50 dark:bg-muted border-gray-200 dark:border-border rounded-l-lg rounded-r-none text-sm"
                  data-testid="input-search-mobile"
                />
              </div>
              <Button 
                type="submit" 
                size="sm"
                className="rounded-l-none rounded-r-lg px-4 h-10"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </form> */}

          {/* Mobile Navigation - Below Search Bar */}
          <nav className="md:hidden flex items-center justify-start gap-1 overflow-x-auto scrollbar-hide pb-2 px-2">
            <Link 
              href="/" 
              className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-md transition-colors ${
                location === '/' ? 'text-primary bg-primary/10' : 'text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-muted'
              }`}
              data-testid="link-mobile-home-nav"
            >
              Home
            </Link>
            <Link 
              href="/products" 
              className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-md transition-colors ${
                location === '/products' ? 'text-primary bg-primary/10' : 'text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-muted'
              }`}
              data-testid="link-mobile-products-nav"
            >
              All Products
            </Link>
            <Link 
              href="/vendors" 
              className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-md transition-colors ${
                location === '/vendors' ? 'text-primary bg-primary/10' : 'text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-muted'
              }`}
              data-testid="link-mobile-vendors-nav"
            >
              Vendor
            </Link>
            <Link 
              href="/about" 
              className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-md transition-colors ${
                location === '/about' ? 'text-primary bg-primary/10' : 'text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-muted'
              }`}
              data-testid="link-mobile-about-nav"
            >
              About Us
            </Link>
            <Link 
              href="/contact" 
              className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-md transition-colors ${
                location === '/contact' ? 'text-primary bg-primary/10' : 'text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-muted'
              }`}
              data-testid="link-mobile-contact-nav"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>

      {/* Category Navigation Bar - Desktop Only */}
      <div className="bg-white dark:bg-background border-b border-gray-100 dark:border-border hidden md:block">
        <div className="container mx-auto px-4 lg:px-6">
          <nav className="flex items-center justify-center gap-1 overflow-x-auto scrollbar-hide py-2">
            <Link 
              href="/" 
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
                location === '/' ? 'text-primary bg-primary/5' : 'text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-muted'
              }`}
              data-testid="link-home-nav"
            >
              Home
            </Link>
            <Link 
              href="/products" 
              className={`flex items-center gap-1 px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
                location === '/products' && !location.includes('category=') ? 'text-primary bg-primary/5' : 'text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-muted'
              }`}
              data-testid="link-shop-now"
            >
              <LayoutGrid className="w-4 h-4" />
              All Products
            </Link>
            <Link 
              href="/vendors" 
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
                location === '/vendors' ? 'text-primary bg-primary/5' : 'text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-muted'
              }`}
              data-testid="link-vendors"
            >
              Vendors
            </Link>
            <Link 
              href="/about" 
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
                location === '/about' ? 'text-primary bg-primary/5' : 'text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-muted'
              }`}
              data-testid="link-about"
            >
              About Us
            </Link>
            <Link 
              href="/contact" 
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
                location === '/contact' ? 'text-primary bg-primary/5' : 'text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-muted'
              }`}
              data-testid="link-contact"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-background border-b border-gray-200 dark:border-border overflow-hidden shadow-lg"
          >
            <div className="container mx-auto px-4 py-4">
              {/* Mobile Quick Links */}
              <div className="pb-4">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">Quick Links</h3>
                <div className="space-y-1">
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-muted transition-colors"
                    data-testid="link-mobile-home"
                  >
                    <LayoutGrid className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    Home
                  </Link>
                  <Link
                    href="/vendors"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-muted transition-colors"
                    data-testid="link-mobile-vendors"
                  >
                    <Store className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    Vendors
                  </Link>
                  <Link
                    href="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-muted transition-colors"
                    data-testid="link-mobile-about"
                  >
                    <Shield className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    About Us
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-muted transition-colors"
                    data-testid="link-mobile-contact"
                  >
                    <Truck className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    Contact
                  </Link>
                </div>
              </div>

              {/* Mobile Auth Actions */}
              <div className="border-t border-gray-100 dark:border-border pt-4 mt-4">
                {isLoggedIn ? (
                  <div className="space-y-2">
                    <Link
                      href={user?.role === 'vendor' ? '/dashboard/vendor' : user?.role === 'buyer' ? '/dashboard/buyer' : '/dashboard'}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-lg font-medium"
                      data-testid="link-mobile-dashboard"
                    >
                      <User className="w-4 h-4" />
                      Go to Dashboard
                    </Link>
                    <button
                      onClick={async () => {
                        await logout();
                        setMobileMenuOpen(false);
                        setLocation('/');
                      }}
                      className="flex items-center justify-center gap-2 w-full py-3 border border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      data-testid="button-mobile-logout"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 py-3 text-center border border-primary text-primary rounded-lg font-medium hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                      data-testid="link-mobile-login"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 py-3 text-center bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                      data-testid="link-mobile-register"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
