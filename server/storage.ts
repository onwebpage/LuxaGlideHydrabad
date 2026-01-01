import {
  users,
  vendors,
  buyers,
  addresses,
  categories,
  coupons,
  products,
  reviews,
  wishlist,
  cart,
  orders,
  orderItems,
  rfqs,
  vendorReceipts,
  type User,
  type InsertUser,
  type UpdateUser,
  type Vendor,
  type InsertVendor,
  type Buyer,
  type InsertBuyer,
  type Address,
  type InsertAddress,
  type Category,
  type InsertCategory,
  type Coupon,
  type InsertCoupon,
  type Product,
  type InsertProduct,
  type Review,
  type InsertReview,
  type Wishlist,
  type InsertWishlist,
  type Cart,
  type InsertCart,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Rfq,
  type InsertRfq,
  type Newsletter,
  type InsertNewsletter,
  type VendorReceipt,
  type InsertVendorReceipt,
  type CmsSetting,
  type InsertCmsSetting,
  type UserSession,
  type InsertUserSession,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, like, gte, lte, sql, or } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;

  // Vendors
  getVendor(id: string): Promise<Vendor | undefined>;
  getVendorByUserId(userId: string): Promise<Vendor | undefined>;
  getAllVendors(filters?: { kycStatus?: string; limit?: number }): Promise<Vendor[]>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: string, data: Partial<InsertVendor>): Promise<Vendor | undefined>;
  deleteVendor(id: string): Promise<void>;

  // Buyers
  getBuyer(id: string): Promise<Buyer | undefined>;
  getBuyerByUserId(userId: string): Promise<Buyer | undefined>;
  createBuyer(buyer: InsertBuyer): Promise<Buyer>;
  updateBuyer(id: string, data: Partial<InsertBuyer>): Promise<Buyer | undefined>;
  updateBuyerByUserId(userId: string, data: Partial<InsertBuyer>): Promise<Buyer | undefined>;

  // Addresses
  getAddress(id: string): Promise<Address | undefined>;
  getUserAddresses(userId: string): Promise<Address[]>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: string, data: Partial<InsertAddress>): Promise<Address | undefined>;
  deleteAddress(id: string): Promise<void>;

  // Categories
  getAllCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, data: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<void>;

  // Coupons
  getCoupon(id: string): Promise<Coupon | undefined>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  getAllCoupons(filters?: { isActive?: boolean; search?: string; limit?: number; offset?: number }): Promise<Coupon[]>;
  getActiveCoupons(): Promise<Coupon[]>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: string, data: Partial<InsertCoupon>): Promise<Coupon | undefined>;
  deleteCoupon(id: string): Promise<void>;
  incrementCouponUsage(id: string): Promise<Coupon | undefined>;

  // Products
  getProduct(id: string): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getAllProducts(filters?: {
    categoryId?: string;
    vendorId?: string;
    fabric?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Product[]>;
  getAllProductsForAdmin(filters?: {
    status?: string;
    categoryId?: string;
    vendorId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Product[]>;
  getProductsByVendorId(vendorId: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | undefined>;
  updateProductStatus(id: string, status: string): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<void>;
  bulkCreateProducts(products: InsertProduct[]): Promise<Product[]>;

  // Reviews
  getProductReviews(productId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Wishlist
  getUserWishlist(userId: string): Promise<Wishlist[]>;
  addToWishlist(item: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(id: string): Promise<void>;

  // Cart
  getUserCart(userId: string): Promise<Cart[]>;
  addToCart(item: InsertCart): Promise<Cart>;
  updateCartItem(id: string, quantity: number): Promise<Cart | undefined>;
  removeFromCart(id: string): Promise<void>;
  clearCart(userId: string): Promise<void>;

  // Orders
  getOrder(id: string): Promise<Order | undefined>;
  getUserOrders(userId: string): Promise<Order[]>;
  getVendorOrders(vendorId: string): Promise<Order[]>;
  getAllOrders(filters?: { status?: string; limit?: number }): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, data: Partial<InsertOrder>): Promise<Order | undefined>;

  // Order Items
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;

  // RFQs
  getRfq(id: string): Promise<Rfq | undefined>;
  getUserRfqs(userId: string): Promise<Rfq[]>;
  getVendorRfqs(vendorId: string): Promise<Rfq[]>;
  createRfq(rfq: InsertRfq): Promise<Rfq>;
  updateRfq(id: string, data: Partial<InsertRfq>): Promise<Rfq | undefined>;

  // Newsletter
  subscribeNewsletter(email: string): Promise<Newsletter>;

  // Vendor Receipts
  getVendorReceipts(vendorId: string): Promise<VendorReceipt[]>;
  getReceipt(id: string): Promise<VendorReceipt | undefined>;
  getReceiptByOrder(orderId: string): Promise<VendorReceipt | undefined>;
  createReceipt(receipt: InsertVendorReceipt): Promise<VendorReceipt>;

  // CMS
  getCmsSetting(key: string): Promise<CmsSetting | undefined>;
  getAllCmsSettings(): Promise<CmsSetting[]>;
  upsertCmsSetting(setting: InsertCmsSetting): Promise<CmsSetting>;

  // Customer Management
  getAllCustomers(filters?: { 
    search?: string; 
    role?: string;
    isBlocked?: boolean;
    limit?: number; 
    offset?: number 
  }): Promise<User[]>;
  blockUser(id: string): Promise<User | undefined>;
  unblockUser(id: string): Promise<User | undefined>;

  // Dashboard Statistics
  getBuyerDashboardStats(userId: string): Promise<{
    totalOrders: number;
    pendingOrders: number;
    wishlistCount: number;
    totalSpent: number;
  }>;
  getVendorDashboardStats(vendorId: string): Promise<{
    totalProducts: number;
    activeOrders: number;
    totalRevenue: number;
    avgRating: number;
  }>;
  getAdminDashboardStats(): Promise<{
    totalVendors: number;
    totalOrders: number;
    totalRevenue: number;
    activeProducts: number;
  }>;

  // Admin Analytics
  getMonthlySalesData(): Promise<Array<{ month: string; revenue: number; orders: number }>>;
  getVendorPerformance(): Promise<Array<{ vendorName: string; totalSales: number; orderCount: number }>>;
  getLowStockProducts(threshold?: number): Promise<Product[]>;
  getRecentOrders(limit?: number): Promise<Order[]>;

  // Session Management
  createSession(session: InsertUserSession): Promise<UserSession>;
  getSession(token: string): Promise<UserSession | undefined>;
  updateSessionAccess(token: string): Promise<UserSession | undefined>;
  deleteSession(token: string): Promise<void>;
  deleteExpiredSessions(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  // Vendors
  async getVendor(id: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor || undefined;
  }

  async getVendorByUserId(userId: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.userId, userId));
    return vendor || undefined;
  }

  async getAllVendors(filters?: { kycStatus?: string; limit?: number }): Promise<Vendor[]> {
    let query = db.select().from(vendors);
    
    if (filters?.kycStatus) {
      query = query.where(eq(vendors.kycStatus, filters.kycStatus as any));
    }
    
    query = query.orderBy(desc(vendors.createdAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    return await query;
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const [vendor] = await db.insert(vendors).values(insertVendor).returning();
    return vendor;
  }

  async updateVendor(id: string, data: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const [vendor] = await db.update(vendors).set(data).where(eq(vendors.id, id)).returning();
    return vendor || undefined;
  }

  async deleteVendor(id: string): Promise<void> {
    const vendor = await this.getVendor(id);
    if (vendor) {
      await db.delete(products).where(eq(products.vendorId, id));
      await db.delete(vendors).where(eq(vendors.id, id));
      await db.delete(users).where(eq(users.id, vendor.userId));
    }
  }

  // Buyers
  async getBuyer(id: string): Promise<Buyer | undefined> {
    const [buyer] = await db.select().from(buyers).where(eq(buyers.id, id));
    return buyer || undefined;
  }

  async getBuyerByUserId(userId: string): Promise<Buyer | undefined> {
    const [buyer] = await db.select().from(buyers).where(eq(buyers.userId, userId));
    return buyer || undefined;
  }

  async createBuyer(insertBuyer: InsertBuyer): Promise<Buyer> {
    const [buyer] = await db.insert(buyers).values(insertBuyer).returning();
    return buyer;
  }

  async updateBuyer(id: string, data: Partial<InsertBuyer>): Promise<Buyer | undefined> {
    const [buyer] = await db.update(buyers).set(data).where(eq(buyers.id, id)).returning();
    return buyer || undefined;
  }

  async updateBuyerByUserId(userId: string, data: Partial<InsertBuyer>): Promise<Buyer | undefined> {
    const [buyer] = await db.update(buyers).set(data).where(eq(buyers.userId, userId)).returning();
    return buyer || undefined;
  }

  // Addresses
  async getAddress(id: string): Promise<Address | undefined> {
    const [address] = await db.select().from(addresses).where(eq(addresses.id, id));
    return address || undefined;
  }

  async getUserAddresses(userId: string): Promise<Address[]> {
    return await db.select().from(addresses).where(eq(addresses.userId, userId)).orderBy(desc(addresses.isDefault));
  }

  async createAddress(insertAddress: InsertAddress): Promise<Address> {
    const [address] = await db.insert(addresses).values(insertAddress).returning();
    return address;
  }

  async updateAddress(id: string, data: Partial<InsertAddress>): Promise<Address | undefined> {
    const [address] = await db.update(addresses).set(data).where(eq(addresses.id, id)).returning();
    return address || undefined;
  }

  async deleteAddress(id: string): Promise<void> {
    await db.delete(addresses).where(eq(addresses.id, id));
  }

  // Categories
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async updateCategory(id: string, data: Partial<InsertCategory>): Promise<Category | undefined> {
    const [category] = await db.update(categories).set(data).where(eq(categories.id, id)).returning();
    return category || undefined;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Coupons
  async getCoupon(id: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id));
    return coupon || undefined;
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase()));
    return coupon || undefined;
  }

  async getAllCoupons(filters?: { isActive?: boolean; search?: string; limit?: number; offset?: number }): Promise<Coupon[]> {
    let query = db.select().from(coupons);
    
    const conditions = [];
    
    if (filters?.isActive !== undefined) {
      conditions.push(eq(coupons.isActive, filters.isActive));
    }
    
    if (filters?.search) {
      conditions.push(
        or(
          like(coupons.code, `%${filters.search.toUpperCase()}%`),
          like(coupons.name, `%${filters.search}%`)
        )
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    query = query.orderBy(desc(coupons.createdAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }
    
    return await query;
  }

  async getActiveCoupons(): Promise<Coupon[]> {
    const now = new Date();
    return await db.select().from(coupons).where(
      and(
        eq(coupons.isActive, true),
        or(
          sql`${coupons.startsAt} IS NULL`,
          lte(coupons.startsAt, now)
        ),
        or(
          sql`${coupons.expiresAt} IS NULL`,
          gte(coupons.expiresAt, now)
        ),
        or(
          sql`${coupons.maxUses} IS NULL`,
          sql`${coupons.usedCount} < ${coupons.maxUses}`
        )
      )
    ).orderBy(desc(coupons.createdAt));
  }

  async createCoupon(insertCoupon: InsertCoupon): Promise<Coupon> {
    const [coupon] = await db.insert(coupons).values({
      ...insertCoupon,
      code: insertCoupon.code.toUpperCase(),
    }).returning();
    return coupon;
  }

  async updateCoupon(id: string, data: Partial<InsertCoupon>): Promise<Coupon | undefined> {
    const updateData = { ...data, updatedAt: new Date() };
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }
    const [coupon] = await db.update(coupons).set(updateData).where(eq(coupons.id, id)).returning();
    return coupon || undefined;
  }

  async deleteCoupon(id: string): Promise<void> {
    await db.update(products).set({ couponId: null }).where(eq(products.couponId, id));
    await db.delete(coupons).where(eq(coupons.id, id));
  }

  async incrementCouponUsage(id: string): Promise<Coupon | undefined> {
    const [coupon] = await db.update(coupons)
      .set({ usedCount: sql`${coupons.usedCount} + 1`, updatedAt: new Date() })
      .where(eq(coupons.id, id))
      .returning();
    return coupon || undefined;
  }

  // Products
  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product || undefined;
  }

  async getAllProducts(filters?: {
    categoryId?: string;
    vendorId?: string;
    fabric?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    let query = db.select().from(products).where(eq(products.isActive, true));
    
    if (filters?.categoryId) {
      query = query.where(eq(products.categoryId, filters.categoryId));
    }
    
    if (filters?.vendorId) {
      query = query.where(eq(products.vendorId, filters.vendorId));
    }
    
    if (filters?.fabric) {
      query = query.where(eq(products.fabric, filters.fabric));
    }
    
    if (filters?.minPrice !== undefined) {
      query = query.where(gte(products.price, filters.minPrice.toString()));
    }
    
    if (filters?.maxPrice !== undefined) {
      query = query.where(lte(products.price, filters.maxPrice.toString()));
    }
    
    if (filters?.search) {
      query = query.where(
        or(
          like(products.name, `%${filters.search}%`),
          like(products.description, `%${filters.search}%`)
        )
      );
    }
    
    query = query.orderBy(desc(products.featured), desc(products.createdAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }
    
    return await query;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return product || undefined;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getAllProductsForAdmin(filters?: {
    status?: string;
    categoryId?: string;
    vendorId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    let query = db.select().from(products);
    
    const conditions = [];
    
    if (filters?.status) {
      conditions.push(eq(products.status, filters.status as any));
    }
    
    if (filters?.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }
    
    if (filters?.vendorId) {
      conditions.push(eq(products.vendorId, filters.vendorId));
    }
    
    if (filters?.search) {
      conditions.push(
        or(
          like(products.name, `%${filters.search}%`),
          like(products.description, `%${filters.search}%`)
        )
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    query = query.orderBy(desc(products.createdAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }
    
    return await query;
  }

  async getProductsByVendorId(vendorId: string): Promise<Product[]> {
    return await db.select().from(products)
      .where(eq(products.vendorId, vendorId))
      .orderBy(desc(products.createdAt));
  }

  async updateProductStatus(id: string, status: string): Promise<Product | undefined> {
    const [product] = await db.update(products)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  async bulkCreateProducts(productsList: InsertProduct[]): Promise<Product[]> {
    if (productsList.length === 0) {
      return [];
    }
    return await db.insert(products).values(productsList).returning();
  }

  // Reviews
  async getProductReviews(productId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    return review;
  }

  // Wishlist
  async getUserWishlist(userId: string): Promise<Wishlist[]> {
    return await db.select().from(wishlist).where(eq(wishlist.userId, userId)).orderBy(desc(wishlist.createdAt));
  }

  async addToWishlist(item: InsertWishlist): Promise<Wishlist> {
    const [wishlistItem] = await db.insert(wishlist).values(item).returning();
    return wishlistItem;
  }

  async removeFromWishlist(id: string): Promise<void> {
    await db.delete(wishlist).where(eq(wishlist.id, id));
  }

  // Cart
  async getUserCart(userId: string): Promise<Cart[]> {
    return await db.select().from(cart).where(eq(cart.userId, userId)).orderBy(desc(cart.createdAt));
  }

  async addToCart(item: InsertCart): Promise<Cart> {
    // Check if item already exists in cart
    const existing = await db.select().from(cart).where(
      and(
        eq(cart.userId, item.userId),
        eq(cart.productId, item.productId)
      )
    );
    
    if (existing.length > 0) {
      // Update quantity
      const [updated] = await db.update(cart)
        .set({ quantity: existing[0].quantity + item.quantity })
        .where(eq(cart.id, existing[0].id))
        .returning();
      return updated;
    }
    
    const [cartItem] = await db.insert(cart).values(item).returning();
    return cartItem;
  }

  async updateCartItem(id: string, quantity: number): Promise<Cart | undefined> {
    const [cartItem] = await db.update(cart).set({ quantity }).where(eq(cart.id, id)).returning();
    return cartItem || undefined;
  }

  async removeFromCart(id: string): Promise<void> {
    await db.delete(cart).where(eq(cart.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cart).where(eq(cart.userId, userId));
  }

  // Orders
  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getVendorOrders(vendorId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.vendorId, vendorId)).orderBy(desc(orders.createdAt));
  }

  async getAllOrders(filters?: { status?: string; limit?: number }): Promise<Order[]> {
    let query = db.select().from(orders);
    
    if (filters?.status) {
      query = query.where(eq(orders.status, filters.status as any));
    }
    
    query = query.orderBy(desc(orders.createdAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    return await query;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async updateOrder(id: string, data: Partial<InsertOrder>): Promise<Order | undefined> {
    const [order] = await db.update(orders).set(data).where(eq(orders.id, id)).returning();
    return order || undefined;
  }

  // Order Items
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db.insert(orderItems).values(item).returning();
    return orderItem;
  }

  // RFQs
  async getRfq(id: string): Promise<Rfq | undefined> {
    const [rfq] = await db.select().from(rfqs).where(eq(rfqs.id, id));
    return rfq || undefined;
  }

  async getUserRfqs(userId: string): Promise<Rfq[]> {
    return await db.select().from(rfqs).where(eq(rfqs.userId, userId)).orderBy(desc(rfqs.createdAt));
  }

  async getVendorRfqs(vendorId: string): Promise<Rfq[]> {
    return await db.select().from(rfqs).where(eq(rfqs.vendorId, vendorId)).orderBy(desc(rfqs.createdAt));
  }

  async createRfq(insertRfq: InsertRfq): Promise<Rfq> {
    const [rfq] = await db.insert(rfqs).values(insertRfq).returning();
    return rfq;
  }

  async updateRfq(id: string, data: Partial<InsertRfq>): Promise<Rfq | undefined> {
    const [rfq] = await db.update(rfqs).set(data).where(eq(rfqs.id, id)).returning();
    return rfq || undefined;
  }

  // Newsletter
  async subscribeNewsletter(email: string): Promise<Newsletter> {
    const [sub] = await db.insert(newsletter).values({ email }).returning();
    return sub;
  }

  // Vendor Receipts
  async getVendorReceipts(vendorId: string): Promise<VendorReceipt[]> {
    return await db.select().from(vendorReceipts)
      .where(eq(vendorReceipts.vendorId, vendorId))
      .orderBy(desc(vendorReceipts.issuedAt));
  }

  async getReceipt(id: string): Promise<VendorReceipt | undefined> {
    const [receipt] = await db.select().from(vendorReceipts).where(eq(vendorReceipts.id, id));
    return receipt || undefined;
  }

  async getReceiptByOrder(orderId: string): Promise<VendorReceipt | undefined> {
    const [receipt] = await db.select().from(vendorReceipts).where(eq(vendorReceipts.orderId, orderId));
    return receipt || undefined;
  }

  async createReceipt(insertReceipt: InsertVendorReceipt): Promise<VendorReceipt> {
    const [receipt] = await db.insert(vendorReceipts).values(insertReceipt).returning();
    return receipt;
  }

  // CMS
  async getCmsSetting(key: string): Promise<CmsSetting | undefined> {
    const [setting] = await db.select().from(cmsSettings).where(eq(cmsSettings.key, key));
    return setting || undefined;
  }

  async getAllCmsSettings(): Promise<CmsSetting[]> {
    return await db.select().from(cmsSettings);
  }

  async upsertCmsSetting(setting: InsertCmsSetting): Promise<CmsSetting> {
    const existing = await this.getCmsSetting(setting.key);
    
    if (existing) {
      const [updated] = await db.update(cmsSettings)
        .set({ value: setting.value, updatedAt: new Date() })
        .where(eq(cmsSettings.key, setting.key))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(cmsSettings).values(setting).returning();
    return created;
  }

  // Customer Management
  async getAllCustomers(filters?: { 
    search?: string; 
    role?: string;
    isBlocked?: boolean;
    limit?: number; 
    offset?: number 
  }): Promise<User[]> {
    let query = db.select().from(users);
    
    const conditions = [];
    
    if (filters?.search) {
      conditions.push(
        or(
          like(users.fullName, `%${filters.search}%`),
          like(users.email, `%${filters.search}%`),
          like(users.phone, `%${filters.search}%`)
        )
      );
    }
    
    if (filters?.role) {
      conditions.push(eq(users.role, filters.role as any));
    }
    
    if (filters?.isBlocked !== undefined) {
      conditions.push(eq(users.isBlocked, filters.isBlocked));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    query = query.orderBy(desc(users.createdAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }
    
    return await query;
  }

  async blockUser(id: string): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ isBlocked: true, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async unblockUser(id: string): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ isBlocked: false, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Dashboard Statistics
  async getBuyerDashboardStats(userId: string): Promise<{
    totalOrders: number;
    pendingOrders: number;
    wishlistCount: number;
    totalSpent: number;
  }> {
    const userOrders = await db.select().from(orders).where(eq(orders.userId, userId));
    
    const totalOrders = userOrders.length;
    const pendingOrders = userOrders.filter(o => 
      o.status === 'pending' || o.status === 'processing'
    ).length;
    
    const totalSpent = userOrders.reduce((sum, order) => 
      sum + Number(order.totalAmount), 0
    );
    
    const wishlistItems = await db.select().from(wishlist).where(eq(wishlist.userId, userId));
    const wishlistCount = wishlistItems.length;
    
    return {
      totalOrders,
      pendingOrders,
      wishlistCount,
      totalSpent,
    };
  }

  async getVendorDashboardStats(vendorId: string): Promise<{
    totalProducts: number;
    activeOrders: number;
    totalRevenue: number;
    avgRating: number;
  }> {
    const vendorProducts = await db.select().from(products).where(eq(products.vendorId, vendorId));
    const totalProducts = vendorProducts.length;
    
    const vendorOrders = await db.select().from(orders).where(eq(orders.vendorId, vendorId));
    const activeOrders = vendorOrders.filter(o => 
      o.status === 'pending' || o.status === 'processing' || o.status === 'confirmed' || o.status === 'shipped'
    ).length;
    
    const totalRevenue = vendorOrders.reduce((sum, order) => 
      sum + Number(order.totalAmount), 0
    );
    
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, vendorId));
    const avgRating = vendor ? Number(vendor.rating) : 0;
    
    return {
      totalProducts,
      activeOrders,
      totalRevenue,
      avgRating,
    };
  }

  async getAdminDashboardStats(): Promise<{
    totalVendors: number;
    totalOrders: number;
    totalRevenue: number;
    activeProducts: number;
  }> {
    const allVendors = await db.select().from(vendors);
    const totalVendors = allVendors.length;
    
    const allOrders = await db.select().from(orders);
    const totalOrders = allOrders.length;
    
    const totalRevenue = allOrders.reduce((sum, order) => 
      sum + Number(order.totalAmount), 0
    );
    
    const activeProducts = await db.select().from(products).where(eq(products.isActive, true));
    
    return {
      totalVendors,
      totalOrders,
      totalRevenue,
      activeProducts: activeProducts.length,
    };
  }

  async getMonthlySalesData(): Promise<Array<{ month: string; revenue: number; orders: number }>> {
    const result = await db.execute(sql`
      SELECT 
        TO_CHAR(created_at, 'Mon YYYY') as month,
        EXTRACT(YEAR FROM created_at) as year,
        EXTRACT(MONTH FROM created_at) as month_num,
        SUM(CAST(total_amount AS DECIMAL)) as revenue,
        COUNT(*) as orders
      FROM orders
      GROUP BY year, month_num, TO_CHAR(created_at, 'Mon YYYY')
      ORDER BY year DESC, month_num DESC
      LIMIT 12
    `);
    
    return (result.rows as any[])
      .reverse()
      .map(row => ({
        month: row.month,
        revenue: Number(row.revenue),
        orders: Number(row.orders)
      }));
  }

  async getVendorPerformance(): Promise<Array<{ vendorName: string; totalSales: number; orderCount: number }>> {
    const result = await db.execute(sql`
      SELECT 
        v.business_name as vendor_name,
        COALESCE(SUM(CAST(o.total_amount AS DECIMAL)), 0) as total_sales,
        COUNT(o.id) as order_count
      FROM vendors v
      LEFT JOIN orders o ON v.id = o.vendor_id
      GROUP BY v.id, v.business_name
      ORDER BY total_sales DESC
      LIMIT 10
    `);
    
    return (result.rows as any[]).map(row => ({
      vendorName: row.vendor_name,
      totalSales: Number(row.total_sales),
      orderCount: Number(row.order_count)
    }));
  }

  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    return await db.select()
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          lte(products.stock, threshold)
        )
      )
      .orderBy(products.stock);
  }

  async getRecentOrders(limit: number = 10): Promise<Order[]> {
    return await db.select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(limit);
  }

  // Session Management
  async createSession(session: InsertUserSession): Promise<UserSession> {
    const [created] = await db.insert(userSessions).values(session).returning();
    return created;
  }

  async getSession(token: string): Promise<UserSession | undefined> {
    const [session] = await db.select().from(userSessions).where(eq(userSessions.token, token));
    return session;
  }

  async updateSessionAccess(token: string): Promise<UserSession | undefined> {
    const [updated] = await db.update(userSessions)
      .set({ lastAccessedAt: new Date() })
      .where(eq(userSessions.token, token))
      .returning();
    return updated;
  }

  async deleteSession(token: string): Promise<void> {
    await db.delete(userSessions).where(eq(userSessions.token, token));
  }

  async deleteExpiredSessions(): Promise<void> {
    await db.delete(userSessions).where(lte(userSessions.expiresAt, new Date()));
  }
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private vendors = new Map<string, Vendor>();
  private buyers = new Map<string, Buyer>();
  private addresses = new Map<string, Address>();
  private categories = new Map<string, Category>();
  private coupons = new Map<string, Coupon>();
  private products = new Map<string, Product>();
  private reviews = new Map<string, Review>();
  private wishlist = new Map<string, Wishlist>();
  private cart = new Map<string, Cart>();
  private orders = new Map<string, Order>();
  private orderItems = new Map<string, OrderItem>();
  private rfqs = new Map<string, Rfq>();
  private newsletter = new Map<string, Newsletter>();
  private cmsSettings = new Map<string, CmsSetting>();
  private userSessions = new Map<string, UserSession>();

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: nanoid(),
      ...insertUser,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...data };
    this.users.set(id, updated);
    return updated;
  }

  // Vendors
  async getVendor(id: string): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }

  async getVendorByUserId(userId: string): Promise<Vendor | undefined> {
    return Array.from(this.vendors.values()).find(v => v.userId === userId);
  }

  async getAllVendors(filters?: { kycStatus?: string; limit?: number }): Promise<Vendor[]> {
    let vendors = Array.from(this.vendors.values());
    
    if (filters?.kycStatus) {
      vendors = vendors.filter(v => v.kycStatus === filters.kycStatus);
    }
    
    vendors.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (filters?.limit) {
      vendors = vendors.slice(0, filters.limit);
    }
    
    return vendors;
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const vendor: Vendor = {
      id: nanoid(),
      ...insertVendor,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.vendors.set(vendor.id, vendor);
    return vendor;
  }

  async updateVendor(id: string, data: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const vendor = this.vendors.get(id);
    if (!vendor) return undefined;
    const updated = { ...vendor, ...data, updatedAt: new Date() };
    this.vendors.set(id, updated);
    return updated;
  }

  async deleteVendor(id: string): Promise<void> {
    const vendor = this.vendors.get(id);
    if (vendor) {
      Array.from(this.products.entries()).forEach(([pid, p]) => {
        if (p.vendorId === id) this.products.delete(pid);
      });
      this.vendors.delete(id);
      this.users.delete(vendor.userId);
    }
  }

  // Buyers
  async getBuyer(id: string): Promise<Buyer | undefined> {
    return this.buyers.get(id);
  }

  async getBuyerByUserId(userId: string): Promise<Buyer | undefined> {
    return Array.from(this.buyers.values()).find(b => b.userId === userId);
  }

  async createBuyer(insertBuyer: InsertBuyer): Promise<Buyer> {
    const buyer: Buyer = {
      id: nanoid(),
      ...insertBuyer,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.buyers.set(buyer.id, buyer);
    return buyer;
  }

  async updateBuyer(id: string, data: Partial<InsertBuyer>): Promise<Buyer | undefined> {
    const buyer = this.buyers.get(id);
    if (!buyer) return undefined;
    const updated = { ...buyer, ...data, updatedAt: new Date() };
    this.buyers.set(id, updated);
    return updated;
  }

  async updateBuyerByUserId(userId: string, data: Partial<InsertBuyer>): Promise<Buyer | undefined> {
    const buyer = Array.from(this.buyers.values()).find(b => b.userId === userId);
    if (!buyer) return undefined;
    const updated = { ...buyer, ...data, updatedAt: new Date() };
    this.buyers.set(buyer.id, updated);
    return updated;
  }

  // Addresses
  async getAddress(id: string): Promise<Address | undefined> {
    return this.addresses.get(id);
  }

  async getUserAddresses(userId: string): Promise<Address[]> {
    return Array.from(this.addresses.values())
      .filter(a => a.userId === userId)
      .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
  }

  async createAddress(insertAddress: InsertAddress): Promise<Address> {
    const address: Address = {
      id: nanoid(),
      ...insertAddress,
      createdAt: new Date(),
    };
    this.addresses.set(address.id, address);
    return address;
  }

  async updateAddress(id: string, data: Partial<InsertAddress>): Promise<Address | undefined> {
    const address = this.addresses.get(id);
    if (!address) return undefined;
    const updated = { ...address, ...data };
    this.addresses.set(id, updated);
    return updated;
  }

  async deleteAddress(id: string): Promise<void> {
    this.addresses.delete(id);
  }

  // Categories
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(c => c.slug === slug);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const category: Category = {
      id: nanoid(),
      ...insertCategory,
      createdAt: new Date(),
    };
    this.categories.set(category.id, category);
    return category;
  }

  async updateCategory(id: string, data: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    const updated = { ...category, ...data };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    this.categories.delete(id);
  }

  // Coupons
  async getCoupon(id: string): Promise<Coupon | undefined> {
    return this.coupons.get(id);
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    return Array.from(this.coupons.values()).find(c => c.code === code.toUpperCase());
  }

  async getAllCoupons(filters?: { isActive?: boolean; search?: string; limit?: number; offset?: number }): Promise<Coupon[]> {
    let coupons = Array.from(this.coupons.values());
    
    if (filters?.isActive !== undefined) {
      coupons = coupons.filter(c => c.isActive === filters.isActive);
    }
    
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      coupons = coupons.filter(c => 
        c.code.toLowerCase().includes(searchLower) || 
        c.name.toLowerCase().includes(searchLower)
      );
    }
    
    coupons.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (filters?.offset) {
      coupons = coupons.slice(filters.offset);
    }
    
    if (filters?.limit) {
      coupons = coupons.slice(0, filters.limit);
    }
    
    return coupons;
  }

  async getActiveCoupons(): Promise<Coupon[]> {
    const now = new Date();
    return Array.from(this.coupons.values()).filter(c => 
      c.isActive &&
      (!c.startsAt || c.startsAt <= now) &&
      (!c.expiresAt || c.expiresAt >= now) &&
      (!c.maxUses || c.usedCount < c.maxUses)
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createCoupon(insertCoupon: InsertCoupon): Promise<Coupon> {
    const coupon: Coupon = {
      id: nanoid(),
      ...insertCoupon,
      code: insertCoupon.code.toUpperCase(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.coupons.set(coupon.id, coupon);
    return coupon;
  }

  async updateCoupon(id: string, data: Partial<InsertCoupon>): Promise<Coupon | undefined> {
    const coupon = this.coupons.get(id);
    if (!coupon) return undefined;
    const updateData = { ...data };
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }
    const updated = { ...coupon, ...updateData, updatedAt: new Date() };
    this.coupons.set(id, updated);
    return updated;
  }

  async deleteCoupon(id: string): Promise<void> {
    Array.from(this.products.entries()).forEach(([pid, p]) => {
      if (p.couponId === id) {
        this.products.set(pid, { ...p, couponId: null });
      }
    });
    this.coupons.delete(id);
  }

  async incrementCouponUsage(id: string): Promise<Coupon | undefined> {
    const coupon = this.coupons.get(id);
    if (!coupon) return undefined;
    const updated = { ...coupon, usedCount: coupon.usedCount + 1, updatedAt: new Date() };
    this.coupons.set(id, updated);
    return updated;
  }

  // Products
  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(p => p.slug === slug);
  }

  async getAllProducts(filters?: {
    categoryId?: string;
    vendorId?: string;
    fabric?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    let products = Array.from(this.products.values()).filter(p => p.isActive);
    
    if (filters?.categoryId) {
      products = products.filter(p => p.categoryId === filters.categoryId);
    }
    
    if (filters?.vendorId) {
      products = products.filter(p => p.vendorId === filters.vendorId);
    }
    
    if (filters?.fabric) {
      products = products.filter(p => p.fabric === filters.fabric);
    }
    
    if (filters?.minPrice !== undefined) {
      products = products.filter(p => parseFloat(p.price) >= filters.minPrice!);
    }
    
    if (filters?.maxPrice !== undefined) {
      products = products.filter(p => parseFloat(p.price) <= filters.maxPrice!);
    }
    
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        p.description.toLowerCase().includes(searchLower)
      );
    }
    
    products.sort((a, b) => {
      if (a.featured !== b.featured) return b.featured ? 1 : -1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    
    if (filters?.offset) {
      products = products.slice(filters.offset);
    }
    
    if (filters?.limit) {
      products = products.slice(0, filters.limit);
    }
    
    return products;
  }

  async getAllProductsForAdmin(filters?: {
    status?: string;
    categoryId?: string;
    vendorId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    let products = Array.from(this.products.values());
    
    if (filters?.status) {
      products = products.filter(p => p.status === filters.status);
    }
    
    if (filters?.categoryId) {
      products = products.filter(p => p.categoryId === filters.categoryId);
    }
    
    if (filters?.vendorId) {
      products = products.filter(p => p.vendorId === filters.vendorId);
    }
    
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        p.description.toLowerCase().includes(searchLower)
      );
    }
    
    products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (filters?.offset) {
      products = products.slice(filters.offset);
    }
    
    if (filters?.limit) {
      products = products.slice(0, filters.limit);
    }
    
    return products;
  }

  async getProductsByVendorId(vendorId: string): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(p => p.vendorId === vendorId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const product: Product = {
      id: nanoid(),
      ...insertProduct,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(product.id, product);
    return product;
  }

  async updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    const updated = { ...product, ...data, updatedAt: new Date() };
    this.products.set(id, updated);
    return updated;
  }

  async updateProductStatus(id: string, status: string): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    const updated = { ...product, status: status as any, updatedAt: new Date() };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    this.products.delete(id);
  }

  async bulkCreateProducts(productsList: InsertProduct[]): Promise<Product[]> {
    const created: Product[] = [];
    for (const insertProduct of productsList) {
      const product = await this.createProduct(insertProduct);
      created.push(product);
    }
    return created;
  }

  // Reviews
  async getProductReviews(productId: string): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(r => r.productId === productId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const review: Review = {
      id: nanoid(),
      ...insertReview,
      createdAt: new Date(),
    };
    this.reviews.set(review.id, review);
    return review;
  }

  // Wishlist
  async getUserWishlist(userId: string): Promise<Wishlist[]> {
    return Array.from(this.wishlist.values())
      .filter(w => w.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async addToWishlist(item: InsertWishlist): Promise<Wishlist> {
    const wishlistItem: Wishlist = {
      id: nanoid(),
      ...item,
      createdAt: new Date(),
    };
    this.wishlist.set(wishlistItem.id, wishlistItem);
    return wishlistItem;
  }

  async removeFromWishlist(id: string): Promise<void> {
    this.wishlist.delete(id);
  }

  // Cart
  async getUserCart(userId: string): Promise<Cart[]> {
    return Array.from(this.cart.values())
      .filter(c => c.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async addToCart(item: InsertCart): Promise<Cart> {
    const existing = Array.from(this.cart.values()).find(c => 
      c.userId === item.userId && c.productId === item.productId
    );
    
    if (existing) {
      const updated = { ...existing, quantity: existing.quantity + item.quantity };
      this.cart.set(existing.id, updated);
      return updated;
    }
    
    const cartItem: Cart = {
      id: nanoid(),
      ...item,
      createdAt: new Date(),
    };
    this.cart.set(cartItem.id, cartItem);
    return cartItem;
  }

  async updateCartItem(id: string, quantity: number): Promise<Cart | undefined> {
    const cartItem = this.cart.get(id);
    if (!cartItem) return undefined;
    const updated = { ...cartItem, quantity };
    this.cart.set(id, updated);
    return updated;
  }

  async removeFromCart(id: string): Promise<void> {
    this.cart.delete(id);
  }

  async clearCart(userId: string): Promise<void> {
    Array.from(this.cart.entries()).forEach(([id, c]) => {
      if (c.userId === userId) this.cart.delete(id);
    });
  }

  // Orders
  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(o => o.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getVendorOrders(vendorId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(o => o.vendorId === vendorId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAllOrders(filters?: { status?: string; limit?: number }): Promise<Order[]> {
    let orders = Array.from(this.orders.values());
    
    if (filters?.status) {
      orders = orders.filter(o => o.status === filters.status);
    }
    
    orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (filters?.limit) {
      orders = orders.slice(0, filters.limit);
    }
    
    return orders;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const order: Order = {
      id: nanoid(),
      ...insertOrder,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.set(order.id, order);
    return order;
  }

  async updateOrder(id: string, data: Partial<InsertOrder>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    const updated = { ...order, ...data, updatedAt: new Date() };
    this.orders.set(id, updated);
    return updated;
  }

  // Order Items
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(oi => oi.orderId === orderId);
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const orderItem: OrderItem = {
      id: nanoid(),
      ...item,
      createdAt: new Date(),
    };
    this.orderItems.set(orderItem.id, orderItem);
    return orderItem;
  }

  // RFQs
  async getRfq(id: string): Promise<Rfq | undefined> {
    return this.rfqs.get(id);
  }

  async getUserRfqs(userId: string): Promise<Rfq[]> {
    return Array.from(this.rfqs.values())
      .filter(r => r.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getVendorRfqs(vendorId: string): Promise<Rfq[]> {
    return Array.from(this.rfqs.values())
      .filter(r => r.vendorId === vendorId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createRfq(insertRfq: InsertRfq): Promise<Rfq> {
    const rfq: Rfq = {
      id: nanoid(),
      ...insertRfq,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.rfqs.set(rfq.id, rfq);
    return rfq;
  }

  async updateRfq(id: string, data: Partial<InsertRfq>): Promise<Rfq | undefined> {
    const rfq = this.rfqs.get(id);
    if (!rfq) return undefined;
    const updated = { ...rfq, ...data, updatedAt: new Date() };
    this.rfqs.set(id, updated);
    return updated;
  }

  // Newsletter
  async subscribeNewsletter(email: string): Promise<Newsletter> {
    const existing = Array.from(this.newsletter.values()).find(n => n.email === email);
    if (existing) return existing;
    
    const subscription: Newsletter = {
      id: nanoid(),
      email,
      createdAt: new Date(),
    };
    this.newsletter.set(subscription.id, subscription);
    return subscription;
  }

  // Vendor Receipts
  async getVendorReceipts(vendorId: string): Promise<VendorReceipt[]> {
    return Array.from(this.vendorReceipts.values())
      .filter(r => r.vendorId === vendorId)
      .sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime());
  }

  async getReceipt(id: string): Promise<VendorReceipt | undefined> {
    return this.vendorReceipts.get(id);
  }

  async getReceiptByOrder(orderId: string): Promise<VendorReceipt | undefined> {
    return Array.from(this.vendorReceipts.values()).find(r => r.orderId === orderId);
  }

  async createReceipt(insertReceipt: InsertVendorReceipt): Promise<VendorReceipt> {
    const receipt: VendorReceipt = {
      id: nanoid(),
      ...insertReceipt,
      issuedAt: new Date(),
      createdAt: new Date(),
    };
    this.vendorReceipts.set(receipt.id, receipt);
    return receipt;
  }

  // CMS
  async getCmsSetting(key: string): Promise<CmsSetting | undefined> {
    return Array.from(this.cmsSettings.values()).find(s => s.key === key);
  }

  async getAllCmsSettings(): Promise<CmsSetting[]> {
    return Array.from(this.cmsSettings.values());
  }

  async upsertCmsSetting(setting: InsertCmsSetting): Promise<CmsSetting> {
    const existing = Array.from(this.cmsSettings.values()).find(s => s.key === setting.key);
    
    if (existing) {
      const updated = { ...existing, value: setting.value, updatedAt: new Date() };
      this.cmsSettings.set(existing.id, updated);
      return updated;
    }
    
    const newSetting: CmsSetting = {
      id: nanoid(),
      ...setting,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.cmsSettings.set(newSetting.id, newSetting);
    return newSetting;
  }

  // Customer Management
  async getAllCustomers(filters?: { 
    search?: string; 
    role?: string;
    isBlocked?: boolean;
    limit?: number; 
    offset?: number 
  }): Promise<User[]> {
    let users = Array.from(this.users.values());
    
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      users = users.filter(u => 
        u.email.toLowerCase().includes(searchLower) || 
        (u.fullName && u.fullName.toLowerCase().includes(searchLower))
      );
    }
    
    if (filters?.role) {
      users = users.filter(u => u.role === filters.role);
    }
    
    if (filters?.isBlocked !== undefined) {
      users = users.filter(u => u.isBlocked === filters.isBlocked);
    }
    
    users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (filters?.offset) {
      users = users.slice(filters.offset);
    }
    
    if (filters?.limit) {
      users = users.slice(0, filters.limit);
    }
    
    return users;
  }

  async blockUser(id: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, isBlocked: true };
    this.users.set(id, updated);
    return updated;
  }

  async unblockUser(id: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, isBlocked: false };
    this.users.set(id, updated);
    return updated;
  }

  // Dashboard Statistics
  async getBuyerDashboardStats(userId: string): Promise<{
    totalOrders: number;
    pendingOrders: number;
    wishlistCount: number;
    totalSpent: number;
  }> {
    const orders = Array.from(this.orders.values()).filter(o => o.userId === userId);
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing');
    const wishlistCount = Array.from(this.wishlist.values()).filter(w => w.userId === userId).length;
    const totalSpent = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
    
    return {
      totalOrders: orders.length,
      pendingOrders: pendingOrders.length,
      wishlistCount,
      totalSpent,
    };
  }

  async getVendorDashboardStats(vendorId: string): Promise<{
    totalProducts: number;
    activeOrders: number;
    totalRevenue: number;
    avgRating: number;
  }> {
    const products = Array.from(this.products.values()).filter(p => p.vendorId === vendorId);
    const orders = Array.from(this.orders.values()).filter(o => o.vendorId === vendorId);
    const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing' || o.status === 'shipped');
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
    
    const productIds = products.map(p => p.id);
    const reviews = Array.from(this.reviews.values()).filter(r => productIds.includes(r.productId));
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;
    
    return {
      totalProducts: products.length,
      activeOrders: activeOrders.length,
      totalRevenue,
      avgRating,
    };
  }

  async getAdminDashboardStats(): Promise<{
    totalVendors: number;
    totalOrders: number;
    totalRevenue: number;
    activeProducts: number;
  }> {
    const totalVendors = this.vendors.size;
    const orders = Array.from(this.orders.values());
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
    const activeProducts = Array.from(this.products.values()).filter(p => p.isActive).length;
    
    return {
      totalVendors,
      totalOrders,
      totalRevenue,
      activeProducts,
    };
  }

  // Admin Analytics
  async getMonthlySalesData(): Promise<Array<{ month: string; revenue: number; orders: number }>> {
    const monthlyData = new Map<string, { revenue: number; orders: number }>();
    
    Array.from(this.orders.values()).forEach(order => {
      const month = order.createdAt.toISOString().substring(0, 7);
      const existing = monthlyData.get(month) || { revenue: 0, orders: 0 };
      monthlyData.set(month, {
        revenue: existing.revenue + parseFloat(order.totalAmount),
        orders: existing.orders + 1,
      });
    });
    
    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  async getVendorPerformance(): Promise<Array<{ vendorName: string; totalSales: number; orderCount: number }>> {
    const vendorData = new Map<string, { totalSales: number; orderCount: number }>();
    
    Array.from(this.orders.values()).forEach(order => {
      const existing = vendorData.get(order.vendorId) || { totalSales: 0, orderCount: 0 };
      vendorData.set(order.vendorId, {
        totalSales: existing.totalSales + parseFloat(order.totalAmount),
        orderCount: existing.orderCount + 1,
      });
    });
    
    return Array.from(vendorData.entries()).map(([vendorId, data]) => {
      const vendor = this.vendors.get(vendorId);
      return {
        vendorName: vendor?.businessName || 'Unknown',
        ...data,
      };
    });
  }

  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(p => p.stockQuantity <= threshold)
      .sort((a, b) => a.stockQuantity - b.stockQuantity);
  }

  async getRecentOrders(limit: number = 10): Promise<Order[]> {
    return Array.from(this.orders.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Session Management
  async createSession(session: InsertUserSession): Promise<UserSession> {
    const userSession: UserSession = {
      id: nanoid(),
      ...session,
      createdAt: new Date(),
      lastAccessedAt: new Date(),
    };
    this.userSessions.set(userSession.token, userSession);
    return userSession;
  }

  async getSession(token: string): Promise<UserSession | undefined> {
    return this.userSessions.get(token);
  }

  async updateSessionAccess(token: string): Promise<UserSession | undefined> {
    const session = this.userSessions.get(token);
    if (!session) return undefined;
    const updated = { ...session, lastAccessedAt: new Date() };
    this.userSessions.set(token, updated);
    return updated;
  }

  async deleteSession(token: string): Promise<void> {
    this.userSessions.delete(token);
  }

  async deleteExpiredSessions(): Promise<void> {
    const now = new Date();
    Array.from(this.userSessions.entries()).forEach(([token, session]) => {
      if (session.expiresAt <= now) {
        this.userSessions.delete(token);
      }
    });
  }
}

export const storage = new DatabaseStorage();
