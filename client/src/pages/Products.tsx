import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal, Package2 } from "lucide-react";
import { useLocation } from "wouter";
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
  const [priceRange, setPriceRange] = useState([0, 10000]);
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
    <div className="min-h-screen py-12 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-12">
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4">Shop Now</h1>
          <p className="text-muted-foreground text-lg">Discover our exquisite collection of designer wear</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-24 space-y-8 p-6 border rounded-xl bg-muted/30">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-xs uppercase tracking-widest font-bold">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat === "all" ? "All Categories" : cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-xs uppercase tracking-widest font-bold">Price Range</Label>
                <div className="pt-2">
                  <Slider
                    min={0}
                    max={10000}
                    step={100}
                    value={priceRange}
                    onValueChange={setPriceRange}
                  />
                  <div className="flex justify-between mt-4 text-sm font-medium">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setPriceRange([0, 10000]);
                  setSelectedCategory("all");
                  setSelectedFabric("all");
                }}
              >
                Reset Filters
              </Button>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
              <div className="flex items-center gap-3">
                <Package2 className="w-5 h-5 text-primary" />
                <p className="text-muted-foreground">Showing <span className="font-bold text-foreground">{sortedProducts.length}</span> products</p>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest Arrivals</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productsLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[250/325] rounded-xl" />
                ))
              ) : sortedProducts.length === 0 ? (
                <div className="col-span-full py-20 text-center">
                  <Package2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground text-lg">No products found</p>
                </div>
              ) : (
                paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product as any} />
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
