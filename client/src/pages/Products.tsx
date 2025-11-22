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
import { Heart, ShoppingCart, Search, SlidersHorizontal, Star, Package2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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

  // Update search query when URL changes
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const searchParam = urlParams.get('search') || '';
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location]);

  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  // Mock products - will be replaced with API
  const products = [
    {
      id: "1",
      name: "Designer Silk Saree",
      price: 2500,
      moq: 10,
      vendor: "Elite Fashion Co.",
      rating: 4.8,
      category: "Sarees",
      fabric: "Silk",
      colors: ["#DC2626", "#2563EB", "#D4AF37"],
      colorNames: ["Red", "Blue", "Gold"],
      imageColor: "#FEE2E2",
    },
    {
      id: "2",
      name: "Embroidered Kurti Set",
      price: 850,
      moq: 20,
      vendor: "Trends Wholesale",
      rating: 4.7,
      category: "Kurtis",
      fabric: "Cotton",
      colors: ["#FFFFFF", "#EC4899"],
      colorNames: ["White", "Pink"],
      imageColor: "#FCE7F3",
    },
    {
      id: "3",
      name: "Premium Lehenga",
      price: 4500,
      moq: 5,
      vendor: "Style Studios",
      rating: 4.9,
      category: "Lehenga",
      fabric: "Georgette",
      colors: ["#D4AF37", "#EC4899", "#10B981"],
      colorNames: ["Gold", "Pink", "Green"],
      imageColor: "#FEF3C7",
    },
    {
      id: "4",
      name: "Cotton Dress Material",
      price: 650,
      moq: 50,
      vendor: "Premium Textiles",
      rating: 4.6,
      category: "Suits",
      fabric: "Cotton",
      colors: ["#DC2626", "#2563EB", "#10B981", "#F59E0B"],
      colorNames: ["Multi"],
      imageColor: "#E0E7FF",
    },
    {
      id: "5",
      name: "Luxury Banarasi Silk",
      price: 3200,
      moq: 8,
      vendor: "Elite Fashion Co.",
      rating: 4.9,
      category: "Sarees",
      fabric: "Silk",
      colors: ["#7C3AED", "#D4AF37"],
      colorNames: ["Purple", "Gold"],
      imageColor: "#F3E8FF",
    },
    {
      id: "6",
      name: "Formal Blazer Set",
      price: 1850,
      moq: 15,
      vendor: "Trends Wholesale",
      rating: 4.5,
      category: "Western",
      fabric: "Cotton",
      colors: ["#1F2937", "#6B7280"],
      colorNames: ["Black", "Gray"],
      imageColor: "#F3F4F6",
    },
  ];

  const categories = ["all", "Sarees", "Kurtis", "Lehenga", "Suits", "Western"];
  const fabrics = ["all", "Cotton", "Silk", "Georgette", "Chiffon", "Crepe"];

  // Memoize filtered and sorted products for performance
  const sortedProducts = useMemo(() => {
    // Filter products based on selected filters
    const filteredProducts = products.filter((product) => {
      // Search filter
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategory !== "all" && product.category !== selectedCategory) {
        return false;
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
          // For now, sort by id (in real app, would use createdAt)
          return parseInt(b.id) - parseInt(a.id);
        case "featured":
        default:
          // Featured: sort by rating then price
          return b.rating - a.rating || b.price - a.price;
      }
    });
  }, [searchQuery, selectedCategory, selectedFabric, priceRange, sortBy]);

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif text-5xl md:text-6xl font-semibold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Premium Collections
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Discover our exquisite wholesale collection of designer wear
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedProducts.length === 0 ? (
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
                sortedProducts.map((product, index) => (
                <div key={product.id}>
                  <Card
                    className="group hover-elevate active-elevate-2 transition-all duration-500 overflow-hidden h-full flex flex-col border-2"
                    data-testid={`card-product-${product.id}`}
                  >
                    <Link href={`/products/${product.id}`}>
                      <div
                        className="relative aspect-[3/4] overflow-hidden transition-all duration-500 group-hover:scale-105"
                        style={{ backgroundColor: product.imageColor }}
                      >
                        {/* Image Placeholder */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center p-8">
                            <Package2
                              className="w-24 h-24 mx-auto mb-4 text-foreground/20"
                              strokeWidth={1}
                            />
                            <p className="text-sm text-muted-foreground font-medium">
                              {product.category}
                            </p>
                          </div>
                        </div>

                        {/* Wishlist Button */}
                        <div className="absolute top-4 right-4 z-10">
                          <Button
                            size="icon"
                            variant="secondary"
                            className={`backdrop-blur-md shadow-lg transition-all ${
                              wishlist.has(product.id)
                                ? "bg-primary text-primary-foreground"
                                : "bg-white/90"
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              toggleWishlist(product.id);
                            }}
                            data-testid={`button-wishlist-${product.id}`}
                          >
                            <Heart
                              className={`w-4 h-4 transition-all ${
                                wishlist.has(product.id) ? "fill-current" : ""
                              }`}
                            />
                          </Button>
                        </div>

                        {/* MOQ Badge */}
                        <Badge className="absolute top-4 left-4 bg-primary/90 text-primary-foreground backdrop-blur-sm shadow-md">
                          MOQ: {product.moq}
                        </Badge>

                        {/* Rating Badge */}
                        <Badge className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm border shadow-md flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                          <span className="font-semibold">{product.rating}</span>
                        </Badge>
                      </div>
                    </Link>

                    <CardContent className="p-6 flex-1 flex flex-col">
                      {/* Vendor */}
                      <div className="mb-2 text-xs text-muted-foreground uppercase tracking-widest font-medium">
                        {product.vendor}
                      </div>

                      {/* Product Name */}
                      <Link href={`/products/${product.id}`}>
                        <h3
                          className="font-serif font-semibold text-xl mb-3 hover:text-primary transition-colors cursor-pointer leading-tight"
                          data-testid={`link-product-${product.id}`}
                        >
                          {product.name}
                        </h3>
                      </Link>

                      {/* Price */}
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                          ₹{product.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground">/piece</span>
                      </div>

                      {/* Color Swatches */}
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex gap-1.5">
                          {product.colors.slice(0, 4).map((color, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full border-2 border-border shadow-sm cursor-pointer hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                              title={product.colorNames[i] || color}
                            />
                          ))}
                        </div>
                        {product.colors.length > 4 && (
                          <span className="text-xs text-muted-foreground font-medium">
                            +{product.colors.length - 4} more
                          </span>
                        )}
                      </div>

                      {/* Fabric Badge */}
                      <Badge variant="outline" className="mb-4 w-fit">
                        {product.fabric}
                      </Badge>

                      {/* Add to Cart Button */}
                      <div className="mt-auto">
                        <Button
                          className="w-full font-semibold"
                          size="lg"
                          data-testid={`button-add-cart-${product.id}`}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )))}
            </div>

            {/* Pagination */}
            <div className="mt-16 flex justify-center items-center gap-2">
              <Button
                variant="outline"
                disabled
                data-testid="button-prev-page"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                className="bg-primary text-primary-foreground border-primary hover:bg-primary/90"
              >
                1
              </Button>
              <Button
                variant="outline"
              >
                2
              </Button>
              <Button
                variant="outline"
              >
                3
              </Button>
              <Button
                variant="outline"
                data-testid="button-next-page"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
