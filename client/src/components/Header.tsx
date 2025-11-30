import { Link, useLocation } from "wouter";
import { ShoppingCart, User, Search, Menu, X, ChevronDown, Truck, Shield, BadgePercent, Store, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useCmsSettings } from "@/hooks/use-cms-settings";
import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";

export function Header() {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const { data: cmsSettings } = useCmsSettings();
  
  const siteName = cmsSettings?.siteMeta?.siteName || "FabricMart";
  
  const isLoggedIn = !!user;
  const cartItemCount = 0;

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  const trustBadges = [
    { icon: Truck, label: "Free Shipping on Bulk Orders" },
    { icon: Shield, label: "100% Genuine Products" },
    { icon: BadgePercent, label: "Best Wholesale Prices" },
  ];

  return (
    <header className="sticky top-0 z-50">
      {/* Main Header - White Background */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0" data-testid="link-home">
              {cmsSettings?.siteMeta?.logo ? (
                <img src={cmsSettings.siteMeta.logo} alt={siteName} className="h-8 lg:h-10 w-auto" />
              ) : (
                <h1 className="font-serif text-xl lg:text-2xl font-bold text-primary tracking-tight">
                  {siteName}
                </h1>
              )}
            </Link>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4 lg:mx-8">
              <div className="relative w-full flex">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Try Saree, Kurti or Search by Product Code"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="w-full pl-12 pr-4 h-11 bg-gray-50 border-gray-200 rounded-l-lg rounded-r-none focus:bg-white focus:border-primary focus-visible:ring-1 focus-visible:ring-primary text-sm"
                    data-testid="input-search"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="rounded-l-none rounded-r-lg px-6 h-11 bg-primary hover:bg-primary/90"
                  data-testid="button-search"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-1 lg:gap-2">
              {/* Become a Vendor - Desktop */}
              <Link href="/register" className="hidden lg:flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-primary transition-colors" data-testid="link-become-vendor">
                <Store className="w-4 h-4" />
                <div className="flex flex-col leading-tight">
                  <span className="text-xs text-gray-500">Become a</span>
                  <span className="font-medium">Vendor</span>
                </div>
              </Link>

              {/* Profile */}
              {isLoggedIn ? (
                <Link href={user?.role === 'vendor' ? '/dashboard/vendor' : user?.role === 'buyer' ? '/dashboard/buyer' : '/dashboard'} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-primary transition-colors" data-testid="link-profile">
                  <User className="w-5 h-5" />
                  <div className="hidden lg:flex flex-col leading-tight">
                    <span className="text-xs text-gray-500">Hello,</span>
                    <span className="font-medium truncate max-w-[80px]">{user?.fullName?.split(' ')[0] || 'User'}</span>
                  </div>
                </Link>
              ) : (
                <Link href="/login" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-primary transition-colors" data-testid="link-login">
                  <User className="w-5 h-5" />
                  <div className="hidden lg:flex flex-col leading-tight">
                    <span className="text-xs text-gray-500">Sign In</span>
                    <span className="font-medium">Profile</span>
                  </div>
                </Link>
              )}

              {/* Cart */}
              <Link href={isLoggedIn ? "/dashboard/buyer" : "/login"} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-primary transition-colors relative" data-testid="link-cart">
                <div className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-[10px] bg-primary text-white">
                      {cartItemCount}
                    </Badge>
                  )}
                </div>
                <div className="hidden lg:flex flex-col leading-tight">
                  <span className="text-xs text-gray-500">Your</span>
                  <span className="font-medium">Cart</span>
                </div>
              </Link>

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

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="md:hidden pb-3">
            <div className="relative flex">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 h-10 bg-gray-50 border-gray-200 rounded-l-lg rounded-r-none text-sm"
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
          </form>
        </div>
      </div>

      {/* Category Navigation Bar */}
      <div className="bg-white border-b border-gray-100 hidden md:block">
        <div className="container mx-auto px-4 lg:px-6">
          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
            <Link 
              href="/products" 
              className={`flex items-center gap-1 px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
                location === '/products' ? 'text-primary bg-primary/5' : 'text-gray-700 hover:text-primary hover:bg-gray-50'
              }`}
              data-testid="link-category-all"
            >
              <TrendingUp className="w-4 h-4" />
              Popular
            </Link>
            {categories.slice(0, 10).map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
                  location.includes(`category=${category.slug}`) ? 'text-primary bg-primary/5' : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                }`}
                data-testid={`link-category-${category.slug}`}
              >
                {category.name}
              </Link>
            ))}
            <Link 
              href="/vendors" 
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
                location === '/vendors' ? 'text-primary bg-primary/5' : 'text-gray-700 hover:text-primary hover:bg-gray-50'
              }`}
              data-testid="link-vendors"
            >
              All Vendors
            </Link>
            <Link 
              href="/about" 
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
                location === '/about' ? 'text-primary bg-primary/5' : 'text-gray-700 hover:text-primary hover:bg-gray-50'
              }`}
              data-testid="link-about"
            >
              About Us
            </Link>
            <Link 
              href="/contact" 
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
                location === '/contact' ? 'text-primary bg-primary/5' : 'text-gray-700 hover:text-primary hover:bg-gray-50'
              }`}
              data-testid="link-contact"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>

      {/* Trust Badges Bar */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-primary/10">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-center gap-6 lg:gap-12 py-2 overflow-x-auto scrollbar-hide">
            {trustBadges.map((badge, index) => (
              <div key={index} className="flex items-center gap-2 text-sm whitespace-nowrap">
                <badge.icon className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-gray-700 font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-200 overflow-hidden shadow-lg"
          >
            <div className="container mx-auto px-4 py-4">
              {/* Mobile Categories */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Categories</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                    data-testid="link-mobile-all-products"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Popular
                  </Link>
                  {categories.slice(0, 7).map((category) => (
                    <Link
                      key={category.id}
                      href={`/products?category=${category.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors truncate"
                      data-testid={`link-mobile-category-${category.slug}`}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile Quick Links */}
              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Quick Links</h3>
                <div className="space-y-1">
                  <Link
                    href="/vendors"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    data-testid="link-mobile-vendors"
                  >
                    <Store className="w-4 h-4 text-gray-500" />
                    All Vendors
                  </Link>
                  <Link
                    href="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    data-testid="link-mobile-about"
                  >
                    <Shield className="w-4 h-4 text-gray-500" />
                    About Us
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    data-testid="link-mobile-contact"
                  >
                    <Truck className="w-4 h-4 text-gray-500" />
                    Contact
                  </Link>
                </div>
              </div>

              {/* Mobile Auth Actions */}
              <div className="border-t border-gray-100 pt-4 mt-4">
                {isLoggedIn ? (
                  <Link
                    href={user?.role === 'vendor' ? '/dashboard/vendor' : user?.role === 'buyer' ? '/dashboard/buyer' : '/dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-lg font-medium"
                    data-testid="link-mobile-dashboard"
                  >
                    <User className="w-4 h-4" />
                    Go to Dashboard
                  </Link>
                ) : (
                  <div className="flex gap-3">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 py-3 text-center border border-primary text-primary rounded-lg font-medium hover:bg-primary/5 transition-colors"
                      data-testid="link-mobile-login"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 py-3 text-center bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
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
