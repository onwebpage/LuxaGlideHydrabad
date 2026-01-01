import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal, Package2, X, ChevronRight, LayoutGrid } from "lucide-react";
import { useLocation, Link } from "wouter";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/ProductCard";
import { useProducts, type Product as ProductType } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";

export default function Products() {
  const [location] = useLocation();
  
  // Get search query from URL params
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const initialSearch = urlParams.get('search') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFabric, setSelectedFabric] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Fetch products and categories from API
  const { data: apiProducts, isLoading: productsLoading } = useProducts();
  const { data: apiCategories, isLoading: categoriesLoading } = useCategories();

  // Find category by slug with flexible matching
  const findCategoryBySlug = useMemo(() => {
    if (!apiCategories) return (slug: string) => null;
    
    return (slug: string): string | null => {
      const normalizedSlug = slug.toLowerCase().replace(/-/g, ' ');
      for (const cat of apiCategories) {
        const catSlug = cat.slug?.toLowerCase() || cat.name.toLowerCase().replace(/\s+/g, '-');
        const catNameLower = cat.name.toLowerCase();
        if (catSlug === slug || catSlug === normalizedSlug) return cat.name;
        if (catNameLower === normalizedSlug || catNameLower.includes(normalizedSlug)) return cat.name;
      }
      return null;
    };
  }, [apiCategories]);

  // Update search query and category when URL changes
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const categoryParam = urlParams.get('category') || '';
    if (categoryParam && apiCategories && apiCategories.length > 0) {
      const categoryName = findCategoryBySlug(categoryParam);
      if (categoryName) setSelectedCategory(categoryName);
    }
  }, [location, apiCategories, findCategoryBySlug]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedFabric, priceRange, sortBy]);

  // Transform API products
  const products = useMemo(() => {
    if (!apiProducts) return [];
    return apiProducts.map(product => ({
      ...product,
      price: parseFloat(product.price),
      rating: parseFloat(product.rating || '0'),
    }));
  }, [apiProducts]);

  // Dynamic categories from API
  const categories = useMemo(() => {
    if (!apiCategories) return ["all"];
    return ["all", ...apiCategories.map(cat => cat.name)];
  }, [apiCategories]);

  // Dynamic fabrics from products
  const fabrics = useMemo(() => {
    if (!products || products.length === 0) return ["all"];
    const uniqueFabrics = Array.from(new Set(products.map(p => p.fabric).filter(Boolean)));
    return ["all", ...uniqueFabrics];
  }, [products]);

  // Create a category name to ID mapping
  const categoryMap = useMemo(() => {
    if (!apiCategories) return new Map();
    return new Map(apiCategories.map(cat => [cat.name, cat.id]));
  }, [apiCategories]);

  // Memoize filtered and sorted products
  const sortedProducts = useMemo(() => {
    const filteredProducts = products.filter((product) => {
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedCategory !== "all") {
        const categoryId = categoryMap.get(selectedCategory);
        if (product.categoryId !== categoryId) return false;
      }
      if (selectedFabric !== "all" && product.fabric !== selectedFabric) return false;
      if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
      return true;
    });

    return [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case "price-low": return a.price - b.price;
        case "price-high": return b.price - a.price;
        case "rating": return b.rating - a.rating;
        case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default: return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });
  }, [products, searchQuery, selectedCategory, selectedFabric, priceRange, sortBy, categoryMap]);

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = sortedProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Hero Header */}
      <section className="relative h-[300px] flex items-center overflow-hidden bg-black text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1445205170230-053b830c6050?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-60" />
        
        <div className="relative z-20 container mx-auto px-4 lg:px-6">
          <nav className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-300 mb-6 font-medium">
            <Link href="/" className="hover:text-[#d4af37] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#d4af37]">Shop</span>
          </nav>
          
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-black font-serif mb-4 leading-tight tracking-tight text-white">
              Curated Collections
            </h1>
            <p className="text-gray-300 text-sm md:text-base max-w-lg leading-relaxed font-light uppercase tracking-widest">
              Exquisite designer wear tailored for the modern queen.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 lg:px-6 py-12 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Enhanced Sticky Filters Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-28 space-y-8 p-8 border border-white/5 rounded-2xl bg-[#fafafa] dark:bg-[#121212] shadow-xl shadow-black/5">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#d4af37]/10 rounded-lg">
                    <SlidersHorizontal className="w-4 h-4 text-[#d4af37]" />
                  </div>
                  <h3 className="font-bold tracking-tight text-lg">Filters</h3>
                </div>
                {(searchQuery || selectedCategory !== "all" || selectedFabric !== "all" || priceRange[0] > 0 || priceRange[1] < 50000) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setSearchQuery("");
                      setPriceRange([0, 50000]);
                      setSelectedCategory("all");
                      setSelectedFabric("all");
                    }}
                    className="h-8 px-2 text-xs font-bold text-[#d4af37] hover:bg-[#d4af37]/10"
                  >
                    Reset
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="bg-[#d4af37]/10 text-[#d4af37] border-none gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold">
                    {searchQuery}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                  </Badge>
                )}
              </div>

              <Accordion type="multiple" defaultValue={["search", "category", "price"]} className="w-full">
                <AccordionItem value="search" className="border-none mb-4">
                  <AccordionTrigger className="hover:no-underline py-3 text-sm font-bold uppercase tracking-widest">
                    Search
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="relative group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" />
                      <Input
                        placeholder="Look for style..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/50 dark:bg-black/20 border-white/10 focus:border-[#d4af37] h-11 rounded-xl text-sm transition-all"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="category" className="border-none mb-4">
                  <AccordionTrigger className="hover:no-underline py-3 text-sm font-bold uppercase tracking-widest">
                    Category
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="bg-white/50 dark:bg-black/20 border-white/10 h-11 rounded-xl focus:ring-[#d4af37]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-white/5 shadow-2xl">
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat} className="rounded-lg">{cat === "all" ? "All Categories" : cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="price" className="border-none">
                  <AccordionTrigger className="hover:no-underline py-3 text-sm font-bold uppercase tracking-widest">
                    Price Range
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 px-2 space-y-6">
                    <Slider
                      min={0}
                      max={50000}
                      step={500}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="[&_[role=slider]]:bg-[#d4af37] [&_[role=slider]]:border-white [&_[role=slider]]:shadow-lg"
                    />
                    <div className="flex justify-between items-center bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-white/5">
                      <div className="text-center">
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Min</p>
                        <p className="text-sm font-black text-[#d4af37]">₹{priceRange[0]}</p>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="text-center">
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Max</p>
                        <p className="text-sm font-black text-[#d4af37]">₹{priceRange[1]}</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </aside>

          {/* Enhanced Results Grid */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#d4af37]/10 rounded-2xl">
                  <LayoutGrid className="w-5 h-5 text-[#d4af37]" />
                </div>
                <div>
                  <h2 className="font-bold text-xl tracking-tight text-foreground">Luxury Gallery</h2>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                    {sortedProducts.length} Exceptional Pieces Found
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest hidden sm:block">Sort By</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[220px] bg-[#fafafa] dark:bg-[#121212] border-white/5 h-11 rounded-xl shadow-lg focus:ring-[#d4af37]">
                    <SelectValue placeholder="Featured" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-white/5">
                    <SelectItem value="featured">Featured Selections</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Top Rated Only</SelectItem>
                    <SelectItem value="newest">Fresh Arrivals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {productsLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4.5] rounded-2xl bg-white/5 shadow-2xl" />
                ))
              ) : sortedProducts.length === 0 ? (
                <div className="col-span-full py-32 text-center bg-[#fafafa] dark:bg-[#121212] rounded-3xl border border-dashed border-white/10">
                  <Package2 className="w-20 h-20 mx-auto mb-6 text-gray-500/20" />
                  <p className="text-gray-400 text-xl font-serif italic">No matching styles found in our boutique</p>
                  <Button 
                    variant="link" 
                    className="text-[#d4af37] mt-4 font-bold tracking-widest uppercase text-xs"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setPriceRange([0, 50000]);
                    }}
                  >
                    View All Collections
                  </Button>
                </div>
              ) : (
                paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product as any} />
                ))
              )}
            </div>

            {/* Premium Pagination */}
            {totalPages > 1 && (
              <div className="mt-20 flex justify-center items-center gap-4">
                <Button
                  variant="ghost"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="text-xs font-bold uppercase tracking-widest hover:text-[#d4af37]"
                >
                  Prev
                </Button>
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === i + 1 ? "default" : "ghost"}
                      className={`w-10 h-10 rounded-full text-xs font-bold ${
                        currentPage === i + 1 
                          ? "bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20" 
                          : "text-gray-500 hover:text-[#d4af37]"
                      }`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="text-xs font-bold uppercase tracking-widest hover:text-[#d4af37]"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
