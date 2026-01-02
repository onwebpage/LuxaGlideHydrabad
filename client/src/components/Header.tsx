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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [voiceOverlayOpen, setVoiceOverlayOpen] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  
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
      setVoiceOverlayOpen(true);
      setLiveTranscript("Listening...");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setLiveTranscript(transcript);
      setTimeout(() => {
        setSearchQuery(transcript);
        setShowSuggestions(true);
        setVoiceOverlayOpen(false);
        setIsListening(false);
        if (mobileSearchOpen) {
           // We are already in mobile search, so just update query
        } else if (window.innerWidth < 1024) {
           setMobileSearchOpen(true);
        }
      }, 1000);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setVoiceOverlayOpen(false);
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
    <header className="z-[100] w-full bg-[#bf953f]">
      {/* Main Header - Golden Background */}
      <div className="border-b border-black/10 shadow-sm">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-20 lg:h-24 gap-4">
            {/* Logo - Removed Image, showing Site Name */}
            <Link href="/" className="flex-shrink-0 flex items-center z-10" data-testid="link-home">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tighter text-[#fde68a] drop-shadow-sm truncate max-w-[150px] sm:max-w-none" style={{ fontFamily: "'Tagesschrift', system-ui" }}>
                {cmsSettings?.siteMeta?.siteName || "QUEEN 4FEET"}
              </h1>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:block flex-1 max-w-2xl mx-4 lg:mx-8 relative" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative group">
                
                <div className="relative flex items-center bg-gray-50/80 dark:bg-zinc-900/60 backdrop-blur-2xl border border-gray-200 dark:border-[#bf953f]/30 rounded-full px-6 h-14 transition-all duration-500 group-focus-within:border-[#bf953f] group-focus-within:bg-white dark:group-focus-within:bg-black">
                  <div className="flex items-center gap-3">
                    <Search className="w-6 h-6 text-gray-400 group-focus-within:text-[#bf953f] group-focus-within:scale-125 group-focus-within:rotate-12 transition-all duration-500 ease-out" />
                    
                    {/* AI Smart Search Indicator */}
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#bf953f]/15 border border-[#bf953f]/30 group-focus-within:hidden transition-all duration-300">
                      <Sparkles className="w-4 h-4 text-[#bf953f] animate-pulse" />
                      <span className="text-[10px] font-black text-[#bf953f] tracking-[0.2em] uppercase">AI SMART</span>
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
                    className="flex-1 bg-transparent border-none focus:ring-0 text-base px-5 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium tracking-wide outline-none h-full"
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
                      className={`rounded-full w-10 h-10 transition-all duration-300 ${isListening ? 'bg-[#bf953f] text-white animate-pulse shadow-lg shadow-[#bf953f]/30' : 'text-gray-400 hover:text-[#bf953f] hover:bg-[#bf953f]/10'}`}
                      title="Voice Search"
                      data-testid="button-voice-search"
                    >
                      <Mic className="w-5 h-5" />
                    </Button>

                    <Button 
                      type="submit" 
                      size="icon"
                      className="rounded-full w-10 h-10 bg-[#bf953f] hover:bg-[#f1d279] text-white shadow-lg shadow-[#bf953f]/30 transition-all active:scale-90 hover:scale-110"
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
                      <div className="p-6 border-b border-gray-50 dark:border-[#bf953f]/10 bg-gradient-to-br from-white to-gray-50 dark:from-black dark:to-zinc-900/50">
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="w-4 h-4 text-[#bf953f]" />
                          <p className="text-[10px] font-black text-[#bf953f] uppercase tracking-[0.3em]">Trending Now</p>
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
                              className="px-5 py-2.5 text-xs font-semibold rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-[#bf953f]/20 text-gray-700 dark:text-gray-200 hover:border-[#bf953f] hover:text-[#bf953f] hover:shadow-[0_0_15px_rgba(191,149,63,0.2)] transition-all active:scale-95"
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
                    <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#fde68a] hover:text-[#fde68a] transition-colors" data-testid="button-profile-dropdown">
                      <User className="w-5 h-5 text-[#fde68a]" />
                      <div className="hidden lg:flex flex-col leading-tight">
                        <span className="text-[10px] text-[#fde68a]/80 font-bold">Hello,</span>
                        <span className="font-black truncate max-w-[80px] text-[#fde68a]">{user?.fullName?.split(' ')[0] || 'User'}</span>
                      </div>
                      <ChevronDown className="w-4 h-4 hidden lg:block text-[#fde68a]" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white border-[#bf953f]/30">
                    <DropdownMenuItem asChild>
                      <Link 
                        href={user?.role === 'vendor' ? '/dashboard/vendor' : user?.role === 'buyer' ? '/dashboard/buyer' : '/dashboard'} 
                        className="flex items-center gap-2 cursor-pointer text-[#4a3700]"
                        data-testid="link-dashboard"
                      >
                        <User className="w-4 h-4" />
                        My Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#bf953f]/20" />
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
                <Link href="/login" className="flex items-center gap-2 px-3 py-2 text-sm text-[#fde68a] hover:text-[#fde68a] transition-colors" data-testid="link-login">
                  <User className="w-5 h-5 text-[#fde68a]" />
                  <div className="hidden lg:flex flex-col leading-tight">
                    <span className="text-[10px] text-[#fde68a]/80 uppercase font-black">Sign In</span>
                    <span className="font-black text-[#fde68a]">Profile</span>
                  </div>
                </Link>
              )}

              {/* Cart */}
              <Link href="/cart" className="flex items-center gap-2 px-3 py-2 text-sm text-[#fde68a] hover:text-[#fde68a] transition-colors relative" data-testid="link-cart">
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-[#fde68a]" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-[10px] bg-red-600 text-[#fde68a] border-none font-bold">
                      {cartItemCount}
                    </Badge>
                  )}
                </div>
                <div className="hidden lg:flex flex-col leading-tight">
                  <span className="text-[10px] text-[#fde68a]/80 uppercase font-black">Your</span>
                  <span className="font-black text-[#fde68a]">Cart</span>
                </div>
              </Link>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden ml-1 text-[#fde68a] hover:bg-white/10"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search Bar - Trigger */}
          <div className="lg:hidden px-2 pb-4 pt-1">
            <button 
              onClick={() => setMobileSearchOpen(true)}
              className="w-full relative flex items-center bg-gray-50/90 dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200 dark:border-[#bf953f]/30 rounded-full px-4 h-10 transition-all text-left"
              data-testid="button-mobile-search-trigger"
            >
              <Search className="w-4 h-4 text-gray-400 mr-3" />
              <span className="text-sm text-gray-400 flex-1">Search Kurtis, Brands or Product Code…</span>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#bf953f]/10 border border-[#bf953f]/20">
                <Sparkles className="w-3 h-3 text-[#bf953f]" />
                <span className="text-[8px] font-black text-[#bf953f] uppercase tracking-wider">AI</span>
              </div>
            </button>
          </div>

          {/* Mobile Search Overlay */}
          <AnimatePresence>
            {voiceOverlayOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex flex-col items-center justify-center p-6 text-center"
              >
                <div className="relative mb-12">
                  <div className="absolute inset-0 bg-[#bf953f]/20 blur-3xl rounded-full animate-pulse" />
                  <div className="relative w-24 h-24 rounded-full bg-[#bf953f] flex items-center justify-center shadow-[0_0_50px_rgba(191,149,63,0.5)]">
                    <Mic className="w-10 h-10 text-white" />
                  </div>
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute -inset-4 border-2 border-[#bf953f]/30 rounded-full" 
                  />
                </div>
                
                <h2 className="text-[#fde68a] text-2xl font-serif mb-4">Listening...</h2>
                <div className="max-w-md">
                  <p className="text-white text-3xl font-bold leading-tight tracking-tight min-h-[4rem]">
                    {liveTranscript || "Speak now"}
                  </p>
                </div>
                
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setVoiceOverlayOpen(false);
                    setIsListening(false);
                  }}
                  className="mt-12 text-white/50 hover:text-white"
                >
                  <X className="w-5 h-5 mr-2" />
                  Cancel
                </Button>
              </motion.div>
            )}

            {mobileSearchOpen && (
              <motion.div
                initial={{ opacity: 0, x: "100%" }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-0 bg-white dark:bg-background z-[150] flex flex-col"
              >
                {/* Overlay Header */}
                <div className="bg-[#bf953f] px-2 py-3 flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setMobileSearchOpen(false)}
                    className="text-[#fde68a] hover:bg-white/10 shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                  
                  <div className="flex-1 relative" ref={searchRef}>
                    <form onSubmit={handleSearch} className="relative group">
                      <div className="relative flex items-center bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-white/20 rounded-full px-3 h-11">
                        <Search className="w-4 h-4 text-[#bf953f] shrink-0" />
                        <input
                          type="text"
                          autoFocus
                          placeholder="Search Kurtis, Brands..."
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowSuggestions(true);
                          }}
                          onKeyDown={handleSearchKeyDown}
                          className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-2 text-gray-800 dark:text-gray-100 outline-none h-full min-w-0"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <Button 
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              startVoiceSearch();
                            }}
                            className={`rounded-full w-8 h-8 ${isListening ? 'text-[#bf953f] animate-pulse' : 'text-gray-400'}`}
                          >
                            <Mic className="w-4 h-4" />
                          </Button>
                          <button type="submit" className="p-1 text-[#bf953f]">
                            <ArrowRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Suggestions / Results area */}
                <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-zinc-950 p-4">
                  {/* AI Indicator */}
                  <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-gradient-to-r from-[#bf953f]/10 to-transparent border-l-4 border-[#bf953f]">
                    <Sparkles className="w-5 h-5 text-[#bf953f]" />
                    <div>
                      <p className="text-[10px] font-black text-[#bf953f] uppercase tracking-widest leading-none mb-1">AI SMART SEARCH ENABLED</p>
                      <p className="text-xs text-muted-foreground">Finding the perfect style for you...</p>
                    </div>
                  </div>

                  {/* Trending Tags */}
                  {!searchQuery && (
                    <div className="mb-8">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Trending Searches</p>
                      <div className="flex flex-wrap gap-2">
                        {['Banarasi Silk', 'Cotton Kurti', 'Wedding Wear', 'New Arrivals', 'Best Sellers'].map((tag) => (
                          <button
                            key={tag}
                            onClick={() => {
                              setSearchQuery(tag);
                              // First update suggestions if needed, but we'll just search
                              setMobileSearchOpen(false);
                              setLocation(`/products?search=${encodeURIComponent(tag)}`);
                            }}
                            className="px-4 py-2 text-sm font-medium rounded-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-gray-700 dark:text-gray-200"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search Results / Suggestions */}
                  {suggestions.length > 0 && (
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recommended Products</p>
                      {suggestions.map((product) => {
                        const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
                        const image = Array.isArray(images) && images.length > 0 ? images[0] : '/placeholder.jpg';
                        return (
                          <Link 
                            key={product.id} 
                            href={`/products/${product.id}`}
                            onClick={() => setMobileSearchOpen(false)}
                            className="flex items-center gap-4 p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-50 dark:border-zinc-800"
                          >
                            <div className="w-16 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                              <img src={image} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base font-semibold truncate text-gray-900 dark:text-gray-100">{product.name}</h4>
                              <p className="text-lg font-black text-[#bf953f]">₹{parseFloat(product.price).toLocaleString()}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <Badge variant="secondary" className="text-[10px] bg-[#bf953f]/10 text-[#bf953f] border-none">AI Suggested</Badge>
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-300" />
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Navigation - Scrollable */}
          <nav className="lg:hidden flex items-center justify-start gap-1 overflow-x-auto scrollbar-hide pb-3 px-2 font-sans">
            <Link 
              href="/" 
              className={`px-3 py-1.5 text-xs font-black whitespace-nowrap rounded-md transition-colors ${
                location === '/' ? 'text-white bg-black/30' : 'text-[#fde68a] hover:text-white hover:bg-white/10'
              }`}
              data-testid="link-mobile-home-nav"
            >
              Home
            </Link>
            <Link 
              href="/products" 
              className={`px-3 py-1.5 text-xs font-black whitespace-nowrap rounded-md transition-colors ${
                location === '/products' ? 'text-white bg-black/30' : 'text-[#fde68a] hover:text-white hover:bg-white/10'
              }`}
              data-testid="link-mobile-products-nav"
            >
              All Products
            </Link>
            <Link 
              href="/vendors" 
              className={`px-3 py-1.5 text-xs font-black whitespace-nowrap rounded-md transition-colors ${
                location === '/vendors' ? 'text-white bg-black/30' : 'text-[#fde68a] hover:text-white hover:bg-white/10'
              }`}
              data-testid="link-mobile-vendors-nav"
            >
              Vendor
            </Link>
            <Link 
              href="/about" 
              className={`px-3 py-1.5 text-xs font-black whitespace-nowrap rounded-md transition-colors ${
                location === '/about' ? 'text-white bg-black/30' : 'text-[#fde68a] hover:text-white hover:bg-white/10'
              }`}
              data-testid="link-mobile-about-nav"
            >
              About Us
            </Link>
            <Link 
              href="/contact" 
              className={`px-3 py-1.5 text-xs font-black whitespace-nowrap rounded-md transition-colors ${
                location === '/contact' ? 'text-white bg-black/30' : 'text-[#fde68a] hover:text-white hover:bg-white/10'
              }`}
              data-testid="link-mobile-contact-nav"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>

      {/* Category Navigation Bar - Desktop Only */}
      <div className="bg-[#bf953f] border-b border-black/10 hidden lg:block">
        <div className="container mx-auto px-4 lg:px-6">
          <nav className="flex items-center justify-center gap-1 overflow-x-auto scrollbar-hide py-2 font-sans">
            <Link 
              href="/" 
              className={`px-4 py-2 text-sm font-black whitespace-nowrap rounded-md transition-colors ${
                location === '/' ? 'text-[#fde68a] bg-black/30' : 'text-[#fde68a] hover:text-[#fde68a] hover:bg-white/10'
              }`}
              data-testid="link-home-nav"
            >
              Home
            </Link>
            <Link 
              href="/products" 
              className={`flex items-center gap-1 px-4 py-2 text-sm font-black whitespace-nowrap rounded-md transition-colors ${
                location === '/products' && !location.includes('category=') ? 'text-[#fde68a] bg-black/30' : 'text-[#fde68a] hover:text-[#fde68a] hover:bg-white/10'
              }`}
              data-testid="link-shop-now"
            >
              <LayoutGrid className="w-4 h-4" />
              All Products
            </Link>
            <Link 
              href="/vendors" 
              className={`px-4 py-2 text-sm font-black whitespace-nowrap rounded-md transition-colors ${
                location === '/vendors' ? 'text-[#fde68a] bg-black/30' : 'text-[#fde68a] hover:text-[#fde68a] hover:bg-white/10'
              }`}
              data-testid="link-vendors"
            >
              Vendors
            </Link>
            <Link 
              href="/about" 
              className={`px-4 py-2 text-sm font-black whitespace-nowrap rounded-md transition-colors ${
                location === '/about' ? 'text-[#fde68a] bg-black/30' : 'text-[#fde68a] hover:text-[#fde68a] hover:bg-white/10'
              }`}
              data-testid="link-about"
            >
              About Us
            </Link>
            <Link 
              href="/contact" 
              className={`px-4 py-2 text-sm font-black whitespace-nowrap rounded-md transition-colors ${
                location === '/contact' ? 'text-[#fde68a] bg-black/30' : 'text-[#fde68a] hover:text-[#fde68a] hover:bg-white/10'
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
            className="lg:hidden bg-white dark:bg-background border-b border-gray-200 dark:border-border overflow-hidden shadow-lg"
          >
            <div className="flex flex-col py-4">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <span className="text-sm font-bold text-gray-500 uppercase">Dark Mode</span>
                <ThemeToggle />
              </div>
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-6 py-4 text-sm font-bold tracking-widest uppercase transition-colors hover:bg-gray-50 ${
                  location === '/' ? 'text-[#bf953f] bg-gray-50 border-r-4 border-[#bf953f]' : 'text-gray-700'
                }`}
              >
                Home
              </Link>
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-6 py-4 text-sm font-bold tracking-widest uppercase transition-colors hover:bg-gray-50 ${
                  location === '/products' ? 'text-[#bf953f] bg-gray-50 border-r-4 border-[#bf953f]' : 'text-gray-700'
                }`}
              >
                All Products
              </Link>
              <Link
                href="/vendors"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-6 py-4 text-sm font-bold tracking-widest uppercase transition-colors hover:bg-gray-50 ${
                  location === '/vendors' ? 'text-[#bf953f] bg-gray-50 border-r-4 border-[#bf953f]' : 'text-gray-700'
                }`}
              >
                Vendors
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-6 py-4 text-sm font-bold tracking-widest uppercase transition-colors hover:bg-gray-50 ${
                  location === '/about' ? 'text-[#bf953f] bg-gray-50 border-r-4 border-[#bf953f]' : 'text-gray-700'
                }`}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-6 py-4 text-sm font-bold tracking-widest uppercase transition-colors hover:bg-gray-50 ${
                  location === '/contact' ? 'text-[#bf953f] bg-gray-50 border-r-4 border-[#bf953f]' : 'text-gray-700'
                }`}
              >
                Contact
              </Link>
            </div>

            <div className="border-t border-gray-100 dark:border-border pt-4 mt-4 px-6 pb-6">
              {isLoggedIn ? (
                <div className="space-y-2">
                  <Link
                    href={user?.role === 'vendor' ? '/dashboard/vendor' : user?.role === 'buyer' ? '/dashboard/buyer' : '/dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#bf953f] text-white rounded-lg font-medium"
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
                    className="flex-1 py-3 text-center border border-[#bf953f] text-[#bf953f] rounded-lg font-medium hover:bg-[#bf953f]/5 dark:hover:bg-[#bf953f]/10 transition-colors"
                    data-testid="link-mobile-login"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-3 text-center bg-[#bf953f] text-white rounded-lg font-medium hover:bg-[#bf953f]/90 transition-colors"
                    data-testid="link-mobile-register"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
