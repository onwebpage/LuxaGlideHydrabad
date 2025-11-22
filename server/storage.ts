import {
  users,
  vendors,
  buyers,
  addresses,
  categories,
  products,
  reviews,
  wishlist,
  cart,
  orders,
  orderItems,
  rfqs,
  newsletter,
  cmsSettings,
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
  type CmsSetting,
  type InsertCmsSetting,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, like, gte, lte, sql, or } from "drizzle-orm";

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
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<void>;

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

  // CMS
  getCmsSetting(key: string): Promise<CmsSetting | undefined>;
  upsertCmsSetting(setting: InsertCmsSetting): Promise<CmsSetting>;

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

  // CMS
  async getCmsSetting(key: string): Promise<CmsSetting | undefined> {
    const [setting] = await db.select().from(cmsSettings).where(eq(cmsSettings.key, key));
    return setting || undefined;
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
    const allOrders = await db.select().from(orders).orderBy(orders.createdAt);
    
    const monthlyData = new Map<string, { revenue: number; orders: number }>();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    allOrders.forEach(order => {
      const date = new Date(order.createdAt);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { revenue: 0, orders: 0 });
      }
      
      const data = monthlyData.get(monthKey)!;
      data.revenue += Number(order.totalAmount);
      data.orders += 1;
    });
    
    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({ month, ...data }))
      .slice(-12);
  }

  async getVendorPerformance(): Promise<Array<{ vendorName: string; totalSales: number; orderCount: number }>> {
    const allVendors = await db.select().from(vendors);
    const allOrders = await db.select().from(orders);
    
    const performanceMap = new Map<string, { vendorName: string; totalSales: number; orderCount: number }>();
    
    for (const vendor of allVendors) {
      const vendorOrders = allOrders.filter(o => o.vendorId === vendor.id);
      const totalSales = vendorOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
      
      performanceMap.set(vendor.id, {
        vendorName: vendor.businessName,
        totalSales,
        orderCount: vendorOrders.length,
      });
    }
    
    return Array.from(performanceMap.values())
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10);
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
}

export const storage = new DatabaseStorage();
