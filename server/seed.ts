import { db } from "./db";
import { 
  users, 
  vendors, 
  categories, 
  products,
  type InsertUser,
  type InsertVendor,
  type InsertCategory,
  type InsertProduct
} from "@shared/schema";
import bcrypt from "bcrypt";

const productImages = {
  womensDresses: [
    "/products/professional_female__a355dcb0.jpg",
    "/products/professional_female__6f7d1703.jpg",
    "/products/professional_female__1477c2e1.jpg",
    "/products/professional_female__f5a8792b.jpg",
    "/products/professional_female__4aa4c205.jpg",
  ],
  mensFormal: [
    "/products/professional_male_fa_8d5a5494.jpg",
    "/products/professional_male_fa_d1c96d83.jpg",
    "/products/professional_male_fa_b7386462.jpg",
    "/products/professional_male_fa_8896f768.jpg",
    "/products/professional_male_fa_92f7ca2d.jpg",
  ],
  casualWear: [
    "/products/professional_model_w_b2a111b5.jpg",
    "/products/professional_model_w_59ae9a1c.jpg",
    "/products/professional_model_w_70d03694.jpg",
    "/products/professional_model_w_ecdc0a0c.jpg",
    "/products/professional_model_w_25ec85be.jpg",
  ],
  ethnicWear: [
    "/products/professional_model_w_2a9ae38d.jpg",
    "/products/professional_model_w_decc3e22.jpg",
    "/products/professional_model_w_a6bde1f4.jpg",
    "/products/professional_model_w_98b97136.jpg",
    "/products/professional_model_w_b7d48e4c.jpg",
  ],
};

async function seed() {
  console.log("Starting database seed...");

  // Clear existing data
  console.log("Clearing existing data...");
  await db.delete(products);
  await db.delete(categories);
  await db.delete(vendors);
  await db.delete(users);

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const [adminUser] = await db.insert(users).values({
    email: "admin@textile.com",
    password: hashedPassword,
    fullName: "Admin User",
    role: "admin",
    phone: "+91 9876543210",
  } as InsertUser).returning();
  console.log("Created admin user");

  // Create vendor users and vendors
  const vendorData = [
    { name: "Elite Fashion House", business: "Elite Fashion House", gst: "29ABCDE1234F1Z5" },
    { name: "Silk Traditions", business: "Silk Traditions Pvt Ltd", gst: "27FGHIJ5678K2Z3" },
    { name: "Cotton Comfort", business: "Cotton Comfort Co", gst: "33KLMNO9012P3Z1" },
    { name: "Royal Textiles", business: "Royal Textiles India", gst: "19QRSTU3456V4Z9" },
  ];

  const vendorIds: string[] = [];
  for (const vendor of vendorData) {
    const vendorPassword = await bcrypt.hash("vendor123", 10);
    const [vendorUser] = await db.insert(users).values({
      email: vendor.name.toLowerCase().replace(/\s+/g, "") + "@textile.com",
      password: vendorPassword,
      fullName: vendor.name + " Admin",
      role: "vendor",
      phone: "+91 98765" + Math.floor(10000 + Math.random() * 90000),
    } as InsertUser).returning();

    const [vendorProfile] = await db.insert(vendors).values({
      userId: vendorUser.id,
      businessName: vendor.business,
      gstNumber: vendor.gst,
      businessAddress: "123 Textile Market, Mumbai, Maharashtra, India",
      kycStatus: "approved",
      description: `Premium quality textiles and garments from ${vendor.business}`,
      rating: (4 + Math.random()).toFixed(2),
      totalSales: Math.floor(Math.random() * 1000),
    } as InsertVendor).returning();

    vendorIds.push(vendorProfile.id);
  }
  console.log(`Created ${vendorIds.length} vendors`);

  // Create categories
  const categoryData = [
    { name: "Women's Wear", slug: "womens-wear", description: "Elegant dresses and women's fashion", image: productImages.womensDresses[0] },
    { name: "Men's Formal", slug: "mens-formal", description: "Professional formal wear for men", image: productImages.mensFormal[0] },
    { name: "Casual Wear", slug: "casual-wear", description: "Comfortable everyday clothing", image: productImages.casualWear[0] },
    { name: "Ethnic Wear", slug: "ethnic-wear", description: "Traditional ethnic clothing", image: productImages.ethnicWear[0] },
  ];

  const categoryIds: Record<string, string> = {};
  for (const cat of categoryData) {
    const [category] = await db.insert(categories).values(cat as InsertCategory).returning();
    categoryIds[cat.slug] = category.id;
  }
  console.log(`Created ${Object.keys(categoryIds).length} categories`);

  // Create products
  const productsData = [
    // Women's Dresses
    {
      name: "Elegant Silk Dress",
      slug: "elegant-silk-dress",
      description: "Premium silk dress perfect for formal occasions. Features a flattering silhouette and luxurious fabric.",
      categorySlug: "womens-wear",
      fabric: "Silk",
      price: "2499.00",
      moq: 5,
      stock: 100,
      images: [productImages.womensDresses[0], productImages.womensDresses[1]],
      colors: ["Black", "Navy Blue", "Burgundy"],
      sizes: ["XS", "S", "M", "L", "XL"],
      featured: true,
    },
    {
      name: "Designer Cocktail Dress",
      slug: "designer-cocktail-dress",
      description: "Contemporary cocktail dress with modern design elements. Perfect for evening events.",
      categorySlug: "womens-wear",
      fabric: "Polyester Blend",
      price: "1899.00",
      moq: 5,
      stock: 80,
      images: [productImages.womensDresses[2], productImages.womensDresses[3]],
      colors: ["Red", "Emerald Green", "Royal Blue"],
      sizes: ["S", "M", "L", "XL"],
      featured: true,
    },
    {
      name: "Classic A-Line Dress",
      slug: "classic-a-line-dress",
      description: "Timeless A-line dress suitable for various occasions. Comfortable and stylish.",
      categorySlug: "womens-wear",
      fabric: "Cotton Blend",
      price: "1299.00",
      moq: 10,
      stock: 150,
      images: [productImages.womensDresses[4], productImages.womensDresses[0]],
      colors: ["White", "Beige", "Light Pink"],
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      featured: false,
    },
    // Men's Formal
    {
      name: "Premium Formal Shirt",
      slug: "premium-formal-shirt",
      description: "High-quality formal shirt crafted from premium cotton. Perfect for business and formal occasions.",
      categorySlug: "mens-formal",
      fabric: "Cotton",
      price: "1499.00",
      moq: 10,
      stock: 200,
      images: [productImages.mensFormal[0], productImages.mensFormal[1]],
      colors: ["White", "Light Blue", "Lavender"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      featured: true,
    },
    {
      name: "Executive Dress Shirt",
      slug: "executive-dress-shirt",
      description: "Sophisticated dress shirt with wrinkle-resistant fabric. Ideal for executives and professionals.",
      categorySlug: "mens-formal",
      fabric: "Cotton Blend",
      price: "1799.00",
      moq: 10,
      stock: 120,
      images: [productImages.mensFormal[2], productImages.mensFormal[3]],
      colors: ["White", "Sky Blue", "Grey"],
      sizes: ["M", "L", "XL", "XXL"],
      featured: true,
    },
    {
      name: "Classic Formal Shirt",
      slug: "classic-formal-shirt",
      description: "Essential formal shirt for everyday office wear. Comfortable fit and easy maintenance.",
      categorySlug: "mens-formal",
      fabric: "Polyester Cotton",
      price: "999.00",
      moq: 15,
      stock: 250,
      images: [productImages.mensFormal[4], productImages.mensFormal[0]],
      colors: ["White", "Light Blue", "Pink"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      featured: false,
    },
    // Casual Wear
    {
      name: "Comfort Cotton T-Shirt",
      slug: "comfort-cotton-tshirt",
      description: "Ultra-soft cotton t-shirt for everyday comfort. Perfect for casual outings.",
      categorySlug: "casual-wear",
      fabric: "100% Cotton",
      price: "599.00",
      moq: 20,
      stock: 300,
      images: [productImages.casualWear[0], productImages.casualWear[1]],
      colors: ["White", "Black", "Grey", "Navy"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      featured: true,
    },
    {
      name: "Casual Polo Shirt",
      slug: "casual-polo-shirt",
      description: "Classic polo shirt combining comfort with style. Suitable for smart casual occasions.",
      categorySlug: "casual-wear",
      fabric: "Pique Cotton",
      price: "899.00",
      moq: 15,
      stock: 180,
      images: [productImages.casualWear[2], productImages.casualWear[3]],
      colors: ["Navy", "Green", "Maroon", "Grey"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      featured: false,
    },
    {
      name: "Relaxed Fit Casual Shirt",
      slug: "relaxed-fit-casual-shirt",
      description: "Comfortable casual shirt with relaxed fit. Perfect for weekend wear.",
      categorySlug: "casual-wear",
      fabric: "Linen Blend",
      price: "1199.00",
      moq: 10,
      stock: 140,
      images: [productImages.casualWear[4], productImages.casualWear[0]],
      colors: ["Beige", "Light Blue", "Olive"],
      sizes: ["M", "L", "XL", "XXL"],
      featured: false,
    },
    // Ethnic Wear
    {
      name: "Traditional Silk Saree",
      slug: "traditional-silk-saree",
      description: "Exquisite silk saree with traditional design. Perfect for weddings and festivals.",
      categorySlug: "ethnic-wear",
      fabric: "Pure Silk",
      price: "3999.00",
      moq: 3,
      stock: 60,
      images: [productImages.ethnicWear[0], productImages.ethnicWear[1]],
      colors: ["Royal Blue", "Red", "Green", "Purple"],
      sizes: ["One Size"],
      featured: true,
    },
    {
      name: "Designer Kurti",
      slug: "designer-kurti",
      description: "Contemporary designer kurti with traditional elements. Versatile ethnic wear.",
      categorySlug: "ethnic-wear",
      fabric: "Cotton Silk",
      price: "1499.00",
      moq: 8,
      stock: 120,
      images: [productImages.ethnicWear[2], productImages.ethnicWear[3]],
      colors: ["Pink", "Blue", "Green", "Yellow"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      featured: true,
    },
    {
      name: "Ethnic Palazzo Set",
      slug: "ethnic-palazzo-set",
      description: "Comfortable palazzo set with ethnic prints. Modern take on traditional wear.",
      categorySlug: "ethnic-wear",
      fabric: "Rayon",
      price: "1799.00",
      moq: 8,
      stock: 100,
      images: [productImages.ethnicWear[4], productImages.ethnicWear[0]],
      colors: ["Multicolor", "Black", "Maroon"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      featured: false,
    },
  ];

  let productCount = 0;
  for (const prod of productsData) {
    const vendorId = vendorIds[Math.floor(Math.random() * vendorIds.length)];
    await db.insert(products).values({
      vendorId,
      name: prod.name,
      slug: prod.slug,
      description: prod.description,
      categoryId: categoryIds[prod.categorySlug],
      fabric: prod.fabric,
      price: prod.price,
      moq: prod.moq,
      stock: prod.stock,
      images: prod.images,
      colors: prod.colors,
      sizes: prod.sizes,
      bulkPricing: [
        { quantity: prod.moq, price: prod.price },
        { quantity: prod.moq * 5, price: (parseFloat(prod.price) * 0.95).toFixed(2) },
        { quantity: prod.moq * 10, price: (parseFloat(prod.price) * 0.90).toFixed(2) },
      ],
      isActive: true,
      featured: prod.featured,
      rating: (4 + Math.random()).toFixed(2),
      reviewCount: Math.floor(Math.random() * 50),
    } as InsertProduct);
    productCount++;
  }

  console.log(`Created ${productCount} products`);
  console.log("Seed completed successfully!");
}

seed()
  .then(() => {
    console.log("✅ Database seeded successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  });
