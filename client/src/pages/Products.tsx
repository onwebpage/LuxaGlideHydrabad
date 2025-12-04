import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ShoppingCart, Search, SlidersHorizontal, Star, Package2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts, type Product } from "@/hooks/use-products";
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
        
        if (catSlug === slug || catSlug === normalizedSlug) {
          return cat.name;
        }
        if (catNameLower === normalizedSlug || catNameLower.includes(normalizedSlug)) {
          return cat.name;
        }
        const slugWords = normalizedSlug.split(' ');
        if (slugWords.some(word => catNameLower.includes(word) && word.length > 2)) {
          return cat.name;
        }
      }
      return null;
    };
  }, [apiCategories]);

  // Update search query and category when URL changes
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const searchParam = urlParams.get('search') || '';
    const categoryParam = urlParams.get('category') || '';
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    if (categoryParam && apiCategories && apiCategories.length > 0) {
      const categoryName = findCategoryBySlug(categoryParam);
      if (categoryName) {
        setSelectedCategory(categoryName);
      }
    }
  }, [location, apiCategories, findCategoryBySlug]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedFabric, priceRange, sortBy]);

  // Transform API products to include parsed JSON fields
  const products = useMemo(() => {
    if (!apiProducts) return [];
    
    return apiProducts.map(product => {
      const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      const colors = product.colors ? (typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors) : [];
      const sizes = product.sizes ? (typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes) : [];
      
      return {
        ...product,
        image: Array.isArray(images) && images.length > 0 ? images[0] : '/placeholder.jpg',
        price: parseFloat(product.price),
        rating: parseFloat(product.rating || '0'),
        colors: colors,
        sizes: sizes,
      };
    });
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

  // Memoize filtered and sorted products for performance
  const sortedProducts = useMemo(() => {
    // Filter products based on selected filters
    const filteredProducts = products.filter((product) => {
      // Search filter
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategory !== "all") {
        const categoryId = categoryMap.get(selectedCategory);
        if (product.categoryId !== categoryId) {
          return false;
        }
      }

      // Fabric filter
      if (selectedFabric !== "all" && product.fabric !== selectedFabric) {
        return false;
      }

      // Price range filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      return true;
    });

    // Sort filtered products based on selected sort option
    return [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "featured":
        default:
          if (a.featured !== b.featured) return b.featured ? 1 : -1;
          return b.rating - a.rating || b.price - a.price;
      }
    });
  }, [products, searchQuery, selectedCategory, selectedFabric, priceRange, sortBy, categoryMap]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 3; i++) pages.push(i);
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i);
      } else {
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
      }
    }
    return pages;
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif text-5xl md:text-6xl font-semibold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Shop Now
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Discover our exquisite wholesale range of designer wear
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-80 shrink-0">
            <Card className="sticky top-24 border-2 shadow-lg">
              <CardContent className="p-8 space-y-8">
                <div>
                  <h3 className="font-semibold text-xl mb-2 flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-primary" />
                    Filters
                  </h3>
                  <p className="text-xs text-muted-foreground">Refine your search</p>
                </div>

                {/* Search */}
                <div>
                  <Label className="text-xs uppercase tracking-widest mb-3 block font-medium">
                    Search Products
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="Search by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-product-search"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <Label className="text-xs uppercase tracking-widest mb-3 block font-medium">
                    Category
                  </Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat === "all" ? "All Categories" : cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Fabric */}
                <div>
                  <Label className="text-xs uppercase tracking-widest mb-3 block font-medium">
                    Fabric Type
                  </Label>
                  <Select value={selectedFabric} onValueChange={setSelectedFabric}>
                    <SelectTrigger data-testid="select-fabric">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fabrics.map((fabric) => (
                        <SelectItem key={fabric} value={fabric}>
                          {fabric === "all" ? "All Fabrics" : fabric}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <Label className="text-xs uppercase tracking-widest mb-4 block font-medium">
                    Price Range
                  </Label>
                  <div className="flex items-center gap-2 mb-4 text-sm">
                    <span className="font-semibold">₹{priceRange[0]}</span>
                    <span className="text-muted-foreground">—</span>
                    <span className="font-semibold">₹{priceRange[1]}</span>
                  </div>
                  <Slider
                    min={0}
                    max={10000}
                    step={100}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mb-2"
                  />
                </div>

                <div>
                  <Button
                    className="w-full"
                    variant="outline"
                    data-testid="button-reset-filters"
                    onClick={() => {
                      setSearchQuery("");
                      setPriceRange([0, 10000]);
                      setSelectedCategory("all");
                      setSelectedFabric("all");
                    }}
                  >
                    Reset All Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
              <div className="flex items-center gap-3">
                <Package2 className="w-5 h-5 text-primary" />
                <p className="text-muted-foreground">
                  Showing{" "}
                  <span className="font-semibold text-foreground text-lg">
                    {sortedProducts.length}
                  </span>{" "}
                  {sortedProducts.length === products.length ? "premium products" : `of ${products.length} products`}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      className="lg:hidden"
                      data-testid="button-mobile-filters"
                    >
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filter Products</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                      <div>
                        <Label className="text-xs uppercase tracking-wider mb-2 block">
                          Search
                        </Label>
                        <Input
                          placeholder="Product name..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs uppercase tracking-wider mb-2 block">
                          Category
                        </Label>
                        <Select
                          value={selectedCategory}
                          onValueChange={setSelectedCategory}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat === "all" ? "All Categories" : cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs uppercase tracking-wider mb-2 block">
                          Fabric
                        </Label>
                        <Select value={selectedFabric} onValueChange={setSelectedFabric}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fabrics.map((fabric) => (
                              <SelectItem key={fabric} value={fabric}>
                                {fabric === "all" ? "All Fabrics" : fabric}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs uppercase tracking-wider mb-4 block">
                          Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                        </Label>
                        <Slider
                          min={0}
                          max={10000}
                          step={100}
                          value={priceRange}
                          onValueChange={setPriceRange}
                          className="mb-2"
                        />
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger
                    className="w-[200px]"
                    data-testid="select-sort"
                  >
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest Arrivals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
              {productsLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden h-full flex flex-col">
                    <Skeleton className="aspect-[3/4] w-full" />
                    <CardContent className="p-6 flex-1 flex flex-col space-y-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))
              ) : sortedProducts.length === 0 ? (
                <div className="col-span-full py-20 text-center">
                  <Package2 className="w-20 h-20 mx-auto mb-4 text-muted-foreground/30" />
                  <h3 className="text-xl font-semibold mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters to see more results
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setPriceRange([0, 10000]);
                      setSelectedCategory("all");
                      setSelectedFabric("all");
                    }}
                    data-testid="button-clear-filters"
                  >
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                paginatedProducts.map((product, index) => (
                <div key={product.id}>
                  <Card
                    className="group hover-elevate active-elevate-2 transition-all duration-500 overflow-hidden h-full flex flex-col border-2"
                    data-testid={`card-product-${product.id}`}
                  >
                    <Link href={`/products/${product.id}`}>
                      <div
                        className="relative aspect-[3/4] overflow-hidden transition-all duration-500"
                      >
                        {/* Product Image */}
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* MOQ Badge */}
                        <Badge className="absolute top-2 left-2 md:top-4 md:left-4 bg-primary/90 text-primary-foreground backdrop-blur-sm shadow-md text-xs">
                          MOQ: {product.moq}
                        </Badge>

                        {/* Rating Badge */}
                        <Badge className="absolute bottom-2 left-2 md:bottom-4 md:left-4 bg-background/90 backdrop-blur-sm border shadow-md flex items-center gap-1 text-xs">
                          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                          <span className="font-semibold">{product.rating}</span>
                        </Badge>
                      </div>
                    </Link>

                    <CardContent className="p-3 md:p-6 flex-1 flex flex-col">
                      {/* Product Name */}
                      <Link href={`/products/${product.id}`}>
                        <h3
                          className="font-serif font-semibold text-sm md:text-xl mb-1 md:mb-3 hover:text-primary transition-colors cursor-pointer leading-tight line-clamp-2"
                          data-testid={`link-product-${product.id}`}
                        >
                          {product.name}
                        </h3>
                      </Link>

                      {/* Price */}
                      <div className="flex items-baseline gap-1 md:gap-2 mb-2 md:mb-4">
                        <span className="text-lg md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                          ₹{product.price.toLocaleString()}
                        </span>
                        <span className="text-xs md:text-sm text-muted-foreground">/piece</span>
                      </div>

                      {/* Colors - Hidden on mobile */}
                      {product.colors && product.colors.length > 0 && (
                        <div className="hidden md:flex items-center gap-3 mb-6">
                          <div className="flex gap-2 flex-wrap">
                            {product.colors.slice(0, 5).map((color: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {color}
                              </Badge>
                            ))}
                          </div>
                          {product.colors.length > 5 && (
                            <span className="text-xs text-muted-foreground font-medium">
                              +{product.colors.length - 5} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Fabric Badge - Hidden on mobile */}
                      <Badge variant="outline" className="hidden md:inline-flex mb-4 w-fit">
                        {product.fabric}
                      </Badge>

                      {/* Add to Cart Button */}
                      <div className="mt-auto">
                        <Button
                          className="w-full font-semibold text-xs md:text-sm"
                          size="default"
                          data-testid={`button-add-cart-${product.id}`}
                        >
                          <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                          <span className="hidden md:inline">Add to Cart</span>
                          <span className="md:hidden">Add</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  data-testid="button-prev-page"
                >
                  Previous
                </Button>
                
                {currentPage > 3 && totalPages > 5 && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(1)}
                      data-testid="button-page-1"
                    >
                      1
                    </Button>
                    <span className="text-muted-foreground">...</span>
                  </>
                )}
                
                {getPageNumbers().map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant="outline"
                    className={currentPage === pageNum ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90" : ""}
                    onClick={() => setCurrentPage(pageNum)}
                    data-testid={`button-page-${pageNum}`}
                  >
                    {pageNum}
                  </Button>
                ))}
                
                {currentPage < totalPages - 2 && totalPages > 5 && (
                  <>
                    <span className="text-muted-foreground">...</span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(totalPages)}
                      data-testid={`button-page-${totalPages}`}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
                
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  data-testid="button-next-page"
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
