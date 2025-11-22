import { useState } from "react";
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
import { Heart, ShoppingCart, Search, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFabric, setSelectedFabric] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  // Mock products - will be replaced with API
  const products = [
    {
      id: "1",
      name: "Designer Silk Saree",
      price: 2500,
      moq: 10,
      vendor: "Elite Fashion Co.",
      rating: 4.8,
      image: "🌸",
      category: "Sarees",
      fabric: "Silk",
      colors: ["Red", "Blue", "Gold"],
    },
    {
      id: "2",
      name: "Embroidered Kurti Set",
      price: 850,
      moq: 20,
      vendor: "Trends Wholesale",
      rating: 4.7,
      image: "👗",
      category: "Kurtis",
      fabric: "Cotton",
      colors: ["White", "Pink"],
    },
    {
      id: "3",
      name: "Premium Lehenga",
      price: 4500,
      moq: 5,
      vendor: "Style Studios",
      rating: 4.9,
      image: "✨",
      category: "Lehenga",
      fabric: "Georgette",
      colors: ["Gold", "Pink", "Green"],
    },
    {
      id: "4",
      name: "Cotton Dress Material",
      price: 650,
      moq: 50,
      vendor: "Premium Textiles",
      rating: 4.6,
      image: "🎨",
      category: "Suits",
      fabric: "Cotton",
      colors: ["Multi"],
    },
  ];

  const categories = ["all", "Sarees", "Kurtis", "Lehenga", "Suits", "Western"];
  const fabrics = ["all", "Cotton", "Silk", "Georgette", "Chiffon", "Crepe"];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold mb-4">
            Product Catalog
          </h1>
          <p className="text-muted-foreground text-lg">
            Explore our premium wholesale collection
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-80 shrink-0">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                  </h3>
                </div>

                {/* Search */}
                <div>
                  <Label className="text-xs uppercase tracking-wider mb-2 block">
                    Search
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Product name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-product-search"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <Label className="text-xs uppercase tracking-wider mb-2 block">
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
                  <Label className="text-xs uppercase tracking-wider mb-2 block">
                    Fabric
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

                <Button className="w-full" variant="outline" data-testid="button-reset-filters">
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <p className="text-muted-foreground">
                Showing <span className="font-medium text-foreground">{products.length}</span> products
              </p>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden" data-testid="button-mobile-filters">
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                      {/* Same filters as desktop */}
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
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
                    </div>
                  </SheetContent>
                </Sheet>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]" data-testid="select-sort">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group hover-elevate transition-all duration-300 overflow-hidden h-full flex flex-col" data-testid={`card-product-${product.id}`}>
                    <div className="relative aspect-[3/4] bg-secondary flex items-center justify-center text-8xl overflow-hidden">
                      {product.image}
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="bg-white/90 backdrop-blur-sm"
                          data-testid={`button-wishlist-${product.id}`}
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                      <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                        MOQ: {product.moq}
                      </Badge>
                    </div>

                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="mb-2 text-xs text-muted-foreground uppercase tracking-wider">
                        {product.vendor}
                      </div>
                      <Link href={`/products/${product.id}`}>
                        <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors cursor-pointer" data-testid={`link-product-${product.id}`}>
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-2xl font-semibold">₹{product.price}</span>
                        <span className="text-sm text-muted-foreground">/piece</span>
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex gap-1">
                          {product.colors.slice(0, 3).map((color, i) => (
                            <div
                              key={i}
                              className="w-5 h-5 rounded-full border-2 border-border bg-secondary"
                              title={color}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {product.colors.length} colors
                        </span>
                      </div>
                      <div className="mt-auto">
                        <Button className="w-full" data-testid={`button-add-cart-${product.id}`}>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex justify-center gap-2">
              <Button variant="outline" disabled data-testid="button-prev-page">
                Previous
              </Button>
              <Button variant="outline" className="bg-primary text-primary-foreground">
                1
              </Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline" data-testid="button-next-page">
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
