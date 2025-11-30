import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["buyer", "vendor", "admin"]);
export const kycStatusEnum = pgEnum("kyc_status", ["pending", "approved", "rejected"]);
export const productStatusEnum = pgEnum("product_status", ["pending", "approved", "published"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "failed", "refunded"]);
export const rfqStatusEnum = pgEnum("rfq_status", ["pending", "quoted", "accepted", "rejected"]);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default("buyer"),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  isBlocked: boolean("is_blocked").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Vendor profiles
export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  businessName: text("business_name").notNull(),
  gstNumber: text("gst_number"),
  businessAddress: text("business_address"),
  kycStatus: kycStatusEnum("kyc_status").notNull().default("pending"),
  kycDocuments: jsonb("kyc_documents"), // Array of document URLs
  description: text("description"),
  logo: text("logo"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalSales: integer("total_sales").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Buyer profiles
export const buyers = pgTable("buyers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  businessName: text("business_name"),
  gstNumber: text("gst_number"),
  kycDocuments: jsonb("kyc_documents"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Addresses
export const addresses = pgTable("addresses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  label: text("label").notNull(), // e.g., "Home", "Office"
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull().default("India"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Categories
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"),
  parentId: varchar("parent_id").references((): any => categories.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Products
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  categoryId: varchar("category_id").references(() => categories.id),
  fabric: text("fabric"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  moq: integer("moq").notNull().default(10), // Minimum Order Quantity
  stock: integer("stock").notNull().default(0),
  images: jsonb("images").notNull(), // Array of image URLs
  colors: jsonb("colors"), // Array of available colors
  sizes: jsonb("sizes"), // Array of available sizes
  bulkPricing: jsonb("bulk_pricing"), // Array of {quantity, price} tiers
  status: productStatusEnum("status").notNull().default("pending"),
  isActive: boolean("is_active").default(true),
  featured: boolean("featured").default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Product Reviews
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  orderId: varchar("order_id"), // Reference to verify purchase
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  images: jsonb("images"), // Array of review images
  isVerifiedPurchase: boolean("is_verified_purchase").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Wishlist
export const wishlist = pgTable("wishlist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Cart
export const cart = pgTable("cart", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  selectedColor: text("selected_color"),
  selectedSize: text("selected_size"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Orders
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(),
  userId: varchar("user_id").notNull().references(() => users.id),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
  shippingAddressId: varchar("shipping_address_id").notNull().references(() => addresses.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
  paymentMethod: text("payment_method"),
  paymentId: text("payment_id"), // Razorpay payment ID
  trackingNumber: text("tracking_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Order Items
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // Price at time of order
  selectedColor: text("selected_color"),
  selectedSize: text("selected_size"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// RFQ (Request for Quote)
export const rfqs = pgTable("rfqs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  message: text("message").notNull(),
  status: rfqStatusEnum("status").notNull().default("pending"),
  quotedPrice: decimal("quoted_price", { precision: 10, scale: 2 }),
  vendorResponse: text("vendor_response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Newsletter subscriptions
export const newsletter = pgTable("newsletter", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// CMS Settings
export const cmsSettings = pgTable("cms_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  vendor: one(vendors, { fields: [users.id], references: [vendors.userId] }),
  buyer: one(buyers, { fields: [users.id], references: [buyers.userId] }),
  addresses: many(addresses),
  orders: many(orders),
  reviews: many(reviews),
  wishlist: many(wishlist),
  cart: many(cart),
  rfqs: many(rfqs),
}));

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  user: one(users, { fields: [vendors.userId], references: [users.id] }),
  products: many(products),
  orders: many(orders),
  rfqs: many(rfqs),
}));

export const buyersRelations = relations(buyers, ({ one }) => ({
  user: one(users, { fields: [buyers.userId], references: [users.id] }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  vendor: one(vendors, { fields: [products.vendorId], references: [vendors.id] }),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  reviews: many(reviews),
  wishlistItems: many(wishlist),
  cartItems: many(cart),
  orderItems: many(orderItems),
  rfqs: many(rfqs),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, { fields: [categories.parentId], references: [categories.id] }),
  children: many(categories),
  products: many(products),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  vendor: one(vendors, { fields: [orders.vendorId], references: [vendors.id] }),
  shippingAddress: one(addresses, { fields: [orders.shippingAddressId], references: [addresses.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

// Zod Schemas - Insert
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVendorSchema = createInsertSchema(vendors).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBuyerSchema = createInsertSchema(buyers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAddressSchema = createInsertSchema(addresses).omit({ id: true, createdAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true, createdAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, updatedAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export const insertWishlistSchema = createInsertSchema(wishlist).omit({ id: true, createdAt: true });
export const insertCartSchema = createInsertSchema(cart).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true, createdAt: true });
export const insertRfqSchema = createInsertSchema(rfqs).omit({ id: true, createdAt: true, updatedAt: true });
export const insertNewsletterSchema = createInsertSchema(newsletter).omit({ id: true, createdAt: true });
export const insertCmsSettingsSchema = createInsertSchema(cmsSettings).omit({ id: true, updatedAt: true });

// Zod Schemas - Update
export const updateUserSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().optional(),
});

export const updateBuyerProfileSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().optional(),
  businessName: z.string().optional(),
  gstNumber: z.string().optional(),
  currentPassword: z.string().min(1, "Password is required for security"),
  userId: z.string().min(1, "User ID is required"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Buyer = typeof buyers.$inferSelect;
export type InsertBuyer = z.infer<typeof insertBuyerSchema>;
export type UpdateBuyerProfile = z.infer<typeof updateBuyerProfileSchema>;
export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Wishlist = typeof wishlist.$inferSelect;
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;
export type Cart = typeof cart.$inferSelect;
export type InsertCart = z.infer<typeof insertCartSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type Rfq = typeof rfqs.$inferSelect;
export type InsertRfq = z.infer<typeof insertRfqSchema>;
export type Newsletter = typeof newsletter.$inferSelect;
export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type CmsSetting = typeof cmsSettings.$inferSelect;
export type InsertCmsSetting = z.infer<typeof insertCmsSettingsSchema>;

// CMS Content Schemas for Website Customization
export const siteMetaSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  tagline: z.string().optional(),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
});

export const heroSchema = z.object({
  headline: z.string().min(1, "Headline is required"),
  subheadline: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  backgroundImage: z.string().optional(),
  overlayOpacity: z.number().min(0).max(100).optional(),
  isVisible: z.boolean().optional(),
});

export const featuredCollectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  image: z.string().optional(),
  link: z.string().optional(),
  isVisible: z.boolean().optional(),
});

export const featuredCollectionsSchema = z.object({
  sectionTitle: z.string().optional(),
  collections: z.array(featuredCollectionSchema),
});

export const testimonialSchema = z.object({
  id: z.string(),
  customerName: z.string().min(1, "Customer name is required"),
  customerRole: z.string().optional(),
  customerImage: z.string().optional(),
  quote: z.string().min(1, "Quote is required"),
  rating: z.number().min(1).max(5).optional(),
  isVisible: z.boolean().optional(),
});

export const testimonialsSchema = z.object({
  sectionTitle: z.string().optional(),
  testimonials: z.array(testimonialSchema),
});

export const promotionBannerSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  image: z.string().optional(),
  link: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  isVisible: z.boolean().optional(),
});

export const promotionsSchema = z.object({
  banners: z.array(promotionBannerSchema),
});

export const socialLinkSchema = z.object({
  platform: z.string().min(1),
  url: z.string().url(),
  isVisible: z.boolean().optional(),
});

export const footerSchema = z.object({
  showNewsletter: z.boolean().optional(),
  newsletterTitle: z.string().optional(),
  newsletterDescription: z.string().optional(),
  copyrightText: z.string().optional(),
  socialLinks: z.array(socialLinkSchema).optional(),
});

// CMS Settings Types
export type SiteMeta = z.infer<typeof siteMetaSchema>;
export type Hero = z.infer<typeof heroSchema>;
export type FeaturedCollection = z.infer<typeof featuredCollectionSchema>;
export type FeaturedCollections = z.infer<typeof featuredCollectionsSchema>;
export type Testimonial = z.infer<typeof testimonialSchema>;
export type Testimonials = z.infer<typeof testimonialsSchema>;
export type PromotionBanner = z.infer<typeof promotionBannerSchema>;
export type Promotions = z.infer<typeof promotionsSchema>;
export type SocialLink = z.infer<typeof socialLinkSchema>;
export type Footer = z.infer<typeof footerSchema>;

// Combined CMS Settings
export interface AllCmsSettings {
  siteMeta: SiteMeta;
  hero: Hero;
  featuredCollections: FeaturedCollections;
  testimonials: Testimonials;
  promotions: Promotions;
  footer: Footer;
  homepageProducts: HomepageFeaturedProducts;
}

// Homepage Featured Products Schema
export const homepageFeaturedProductSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  displayOrder: z.number().min(0),
  isVisible: z.boolean().optional(),
});

export const homepageFeaturedProductsSchema = z.object({
  sectionTitle: z.string().optional(),
  autoFallback: z.boolean().optional(), // If true, show latest products when no featured products selected
  maxProducts: z.number().min(1).max(20).optional(),
  products: z.array(homepageFeaturedProductSchema),
});

export type HomepageFeaturedProduct = z.infer<typeof homepageFeaturedProductSchema>;
export type HomepageFeaturedProducts = z.infer<typeof homepageFeaturedProductsSchema>;

// CMS Setting Keys
export const CMS_KEYS = {
  SITE_META: 'site.meta',
  HERO: 'home.hero',
  FEATURED_COLLECTIONS: 'home.featuredCollections',
  TESTIMONIALS: 'home.testimonials',
  PROMOTIONS: 'home.promotions',
  FOOTER: 'site.footer',
  HOMEPAGE_PRODUCTS: 'home.products',
} as const;
