import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  updateBuyerProfileSchema,
  siteMetaSchema,
  heroSchema,
  featuredCollectionsSchema,
  testimonialsSchema,
  promotionsSchema,
  footerSchema,
  homepageFeaturedProductsSchema,
  CMS_KEYS,
  type AllCmsSettings,
} from "@shared/schema";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import Papa from "papaparse";

// Set up file upload
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Helper function to get safe extension from mimetype
function getSafeExtension(mimetype: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'application/pdf': '.pdf',
  };
  return mimeToExt[mimetype] || '';
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      // Generate safe random filename based on mimetype, not user-supplied extension
      const uniqueSuffix = Date.now() + "-" + crypto.randomBytes(8).toString('hex');
      const safeExt = getSafeExtension(file.mimetype);
      if (!safeExt) {
        return cb(new Error('Invalid file type'), '');
      }
      cb(null, file.fieldname + "-" + uniqueSuffix + safeExt);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// In-memory admin session store (for production, use Redis or database)
const adminSessions = new Map<string, { 
  username: string; 
  createdAt: number;
  lastAccessedAt: number;
  expiresAt: number;
}>();

// User sessions are now stored in the database for persistence across server restarts

// Real-time product viewer tracking
// Maps productId -> Map<sessionId, lastActiveTimestamp>
const productViewers = new Map<string, Map<string, number>>();
const VIEWER_TIMEOUT = 30 * 1000; // 30 seconds - if no heartbeat, consider viewer gone

// Get count of active viewers for a product
function getActiveViewerCount(productId: string): number {
  const viewers = productViewers.get(productId);
  if (!viewers) return 0;
  
  const now = Date.now();
  let count = 0;
  for (const [sessionId, lastActive] of viewers.entries()) {
    if (now - lastActive < VIEWER_TIMEOUT) {
      count++;
    }
  }
  return count;
}

// Register or update a viewer for a product
function registerViewer(productId: string, sessionId: string): void {
  if (!productViewers.has(productId)) {
    productViewers.set(productId, new Map());
  }
  productViewers.get(productId)!.set(sessionId, Date.now());
}

// Remove a viewer from a product
function removeViewer(productId: string, sessionId: string): void {
  const viewers = productViewers.get(productId);
  if (viewers) {
    viewers.delete(sessionId);
    if (viewers.size === 0) {
      productViewers.delete(productId);
    }
  }
}

// Session configuration
const SESSION_MAX_LIFETIME = 8 * 60 * 60 * 1000; // 8 hours max
const SESSION_IDLE_TIMEOUT = 60 * 60 * 1000; // 1 hour idle timeout

// Cleanup expired sessions and stale viewers periodically
setInterval(async () => {
  const now = Date.now();
  for (const [token, session] of adminSessions.entries()) {
    if (now > session.expiresAt) {
      adminSessions.delete(token);
    }
  }
  // Cleanup expired database sessions
  try {
    await storage.deleteExpiredSessions();
  } catch (error) {
    console.error("Failed to cleanup expired sessions:", error);
  }
  // Cleanup stale viewers
  for (const [productId, viewers] of productViewers.entries()) {
    for (const [sessionId, lastActive] of viewers.entries()) {
      if (now - lastActive > VIEWER_TIMEOUT) {
        viewers.delete(sessionId);
      }
    }
    if (viewers.size === 0) {
      productViewers.delete(productId);
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string };
    }
  }
}

// User authentication middleware for buyers/vendors (async for database sessions)
async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const token = authHeader.substring(7);
  
  try {
    const session = await storage.getSession(token);

    if (!session) {
      return res.status(401).json({ message: "Invalid or expired session" });
    }

    const now = new Date();
    const sessionCreatedAt = new Date(session.createdAt).getTime();
    const sessionLastAccessedAt = new Date(session.lastAccessedAt).getTime();
    const nowMs = now.getTime();
    
    const maxLifetimeExpired = nowMs > sessionCreatedAt + SESSION_MAX_LIFETIME;
    const idleTimeoutExpired = nowMs > sessionLastAccessedAt + SESSION_IDLE_TIMEOUT;

    if (maxLifetimeExpired || idleTimeoutExpired) {
      await storage.deleteSession(token);
      return res.status(401).json({ message: "Session expired" });
    }

    // Update last accessed time
    await storage.updateSessionAccess(token);
    
    req.user = { id: session.userId, role: session.role };
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({ message: "Authentication error" });
  }
}

// Admin authentication middleware
function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Admin authentication required" });
  }

  const token = authHeader.substring(7);
  const session = adminSessions.get(token);

  if (!session) {
    return res.status(401).json({ message: "Invalid or expired admin session" });
  }

  const now = Date.now();
  const maxLifetimeExpired = now > session.createdAt + SESSION_MAX_LIFETIME;
  const idleTimeoutExpired = now > session.lastAccessedAt + SESSION_IDLE_TIMEOUT;

  if (maxLifetimeExpired || idleTimeoutExpired) {
    adminSessions.delete(token);
    return res.status(401).json({ message: "Admin session expired" });
  }

  // Update last accessed time but don't extend beyond max lifetime
  session.lastAccessedAt = now;
  session.expiresAt = Math.min(
    session.createdAt + SESSION_MAX_LIFETIME,
    now + SESSION_IDLE_TIMEOUT
  );
  
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ============ AI Smart Search & Recommendations ============
  
  // Natural Query Search
  app.get("/api/ai/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ message: "Query is required" });
      }

      const query = q.toLowerCase();
      const allProducts = await storage.getAllProducts({});
      
      // Simple natural language parsing
      const colors = ["red", "blue", "green", "black", "white", "pink", "yellow", "gold", "silver"];
      const occasions = ["party", "wedding", "casual", "formal", "festive"];
      const maxPriceMatch = query.match(/under (\d+)/) || query.match(/below (\d+)/);
      const maxPrice = maxPriceMatch ? parseInt(maxPriceMatch[1]) : Infinity;
      
      const filtered = allProducts.filter(p => {
        const nameAndDesc = (p.name + " " + p.description).toLowerCase();
        
        // Price check
        if (parseFloat(p.price) > maxPrice) return false;
        
        // Keyword matching
        const keywords = query.split(" ").filter(word => 
          word.length > 3 && !["under", "below", "with", "show", "find"].includes(word)
        );
        
        const hasKeyword = keywords.some(k => nameAndDesc.includes(k));
        const matchesColor = colors.some(c => query.includes(c) && nameAndDesc.includes(c));
        const matchesOccasion = occasions.some(o => query.includes(o) && nameAndDesc.includes(o));
        
        return hasKeyword || matchesColor || matchesOccasion;
      });

      res.json(filtered.slice(0, 12));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Recommended for You (Based on simple randomization for now, ideally user history)
  app.get("/api/ai/recommendations", async (req, res) => {
    try {
      const allProducts = await storage.getAllProducts({ limit: 20 });
      // Shuffle and take 4
      const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
      res.json(shuffled.slice(0, 4));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Similar Products
  app.get("/api/products/:id/similar", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) return res.status(404).json({ message: "Product not found" });
      
      const allProducts = await storage.getAllProducts({ categoryId: product.categoryId });
      const similar = allProducts
        .filter(p => p.id !== product.id)
        .slice(0, 4);
        
      res.json(similar);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Custom Assistant Logic
  app.post("/api/ai/assistant", async (req, res) => {
    try {
      const { message } = req.body;
      const query = message.toLowerCase();
      
      let response = "I'm your LuxeWholesale assistant! ";
      let suggestedProducts: any[] = [];
      
      if (query.includes("party") || query.includes("wedding") || query.includes("dress")) {
        response += "I found some beautiful outfits for special occasions:";
        const products = await storage.getAllProducts({ search: "party" });
        suggestedProducts = products.slice(0, 3);
      } else if (query.includes("cotton") || query.includes("kurti") || query.includes("casual")) {
        response += "Here are some comfortable cotton kurtis and casual wear:";
        const products = await storage.getAllProducts({ search: "cotton" });
        suggestedProducts = products.slice(0, 3);
      } else {
        response += "How can I help you find the perfect outfit today? You can ask for party wear, cotton kurtis, or sarees.";
      }
      
      res.json({ response, products: suggestedProducts });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ Authentication Routes ============
  
  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, fullName, phone, role, businessName, gstNumber, varietiesOfModel, varietiesOfFabric } = req.body;

      // Validate required fields
      if (!email || !password || !fullName || !role) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        fullName,
        phone,
        role: role as "buyer" | "vendor" | "admin",
      });

      // Create role-specific profile
      let profileData = null;
      if (role === "vendor") {
        profileData = await storage.createVendor({
          userId: user.id,
          businessName: businessName || "",
          gstNumber,
          varietiesOfModel,
          varietiesOfFabric,
          kycStatus: "pending",
        });
      } else if (role === "buyer") {
        profileData = await storage.createBuyer({
          userId: user.id,
          businessName,
          gstNumber,
        });
      }

      // Generate user session token and store in database
      const token = crypto.randomBytes(32).toString("hex");
      const now = new Date();
      const expiresAt = new Date(now.getTime() + SESSION_IDLE_TIMEOUT);

      await storage.createSession({
        token,
        userId: user.id,
        role: user.role,
        createdAt: now,
        lastAccessedAt: now,
        expiresAt,
      });

      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        message: "Registration successful", 
        user: userWithoutPassword,
        profile: profileData,
        token
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ message: error.message || "Registration failed" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Get role-specific data
      let profileData = null;
      if (user.role === "vendor") {
        profileData = await storage.getVendorByUserId(user.id);
      } else if (user.role === "buyer") {
        profileData = await storage.getBuyerByUserId(user.id);
      }

      // Generate user session token and store in database
      const token = crypto.randomBytes(32).toString("hex");
      const now = new Date();
      const expiresAt = new Date(now.getTime() + SESSION_IDLE_TIMEOUT);

      await storage.createSession({
        token,
        userId: user.id,
        role: user.role,
        createdAt: now,
        lastAccessedAt: now,
        expiresAt,
      });

      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        user: userWithoutPassword,
        profile: profileData,
        token,
        message: "Login successful"
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: error.message || "Login failed" });
    }
  });

  // Admin Login
  app.post("/api/auth/admin-login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const adminUsername = process.env.ADMIN_USERNAME;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminUsername || !adminPassword) {
        console.error("Admin credentials not configured - ADMIN_USERNAME and ADMIN_PASSWORD must be set");
        return res.status(500).json({ message: "Admin authentication not properly configured" });
      }

      if (username !== adminUsername || password !== adminPassword) {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      // Generate secure admin session token
      const token = crypto.randomBytes(32).toString("hex");
      const now = Date.now();

      adminSessions.set(token, {
        username: adminUsername,
        createdAt: now,
        lastAccessedAt: now,
        expiresAt: now + SESSION_IDLE_TIMEOUT,
      });

      res.json({ 
        message: "Admin login successful",
        isAdmin: true,
        token,
      });
    } catch (error: any) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: error.message || "Admin login failed" });
    }
  });

  // Admin logout
  app.post("/api/auth/admin-logout", requireAdminAuth, async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        adminSessions.delete(token);
      }
      res.json({ message: "Logged out successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ Vendor Receipts Routes ============
  
  app.get("/api/vendors/receipts", requireAuth, async (req, res) => {
    try {
      if (req.user?.role !== "vendor") {
        return res.status(403).json({ message: "Unauthorized: Only vendors can access receipts" });
      }
      const vendor = await storage.getVendorByUserId(req.user.id);
      if (!vendor) return res.status(404).json({ message: "Vendor not found" });
      
      const receipts = await storage.getVendorReceipts(vendor.id);
      res.json(receipts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/vendors/receipts", requireAuth, async (req, res) => {
    try {
      if (req.user?.role !== "vendor") {
        return res.status(403).json({ message: "Unauthorized: Only vendors can issue receipts" });
      }
      const vendor = await storage.getVendorByUserId(req.user.id);
      if (!vendor) return res.status(404).json({ message: "Vendor not found" });

      const validation = insertVendorReceiptSchema.safeParse({
        ...req.body,
        vendorId: vendor.id,
      });

      if (!validation.success) {
        return res.status(400).json({ message: "Validation failed", errors: validation.error.errors });
      }

      const receipt = await storage.createReceipt(validation.data);
      res.status(201).json(receipt);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ User logout (buyers/vendors) - requires authentication ============
  app.post("/api/auth/logout", requireAuth, async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        await storage.deleteSession(token);
      }
      res.json({ message: "Logged out successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get current user (protected route - simplified for now)
  app.get("/api/auth/me", async (req, res) => {
    try {
      // In a real app, this would use session/JWT middleware
      // For now, this is a placeholder
      res.status(401).json({ message: "Not authenticated" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Password reset token storage (in production, use database)
  const passwordResetTokens = new Map<string, { 
    userId: string; 
    token: string; 
    expiresAt: number 
  }>();

  // Request password reset
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      
      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({ message: "If the email exists, a password reset link has been sent" });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

      passwordResetTokens.set(resetToken, {
        userId: user.id,
        token: resetToken,
        expiresAt,
      });

      // Clean up expired tokens periodically
      for (const [token, data] of passwordResetTokens.entries()) {
        if (Date.now() > data.expiresAt) {
          passwordResetTokens.delete(token);
        }
      }

      // Password reset token generated - email functionality removed
      const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
      console.log("Password reset URL generated:", resetUrl);

      res.json({ message: "If the email exists, a password reset link has been sent" });
    } catch (error: any) {
      console.error("Password reset request error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Reset password with token
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }

      const resetData = passwordResetTokens.get(token);

      if (!resetData) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      if (Date.now() > resetData.expiresAt) {
        passwordResetTokens.delete(token);
        return res.status(400).json({ message: "Reset token has expired" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user password
      await storage.updateUser(resetData.userId, {
        password: hashedPassword,
      });

      // Remove used token
      passwordResetTokens.delete(token);

      res.json({ message: "Password has been reset successfully" });
    } catch (error: any) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // ============ Profile Routes ============

  // Update buyer profile
  app.patch("/api/profile/buyer", async (req, res) => {
    try {
      const validation = updateBuyerProfileSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validation.error.errors 
        });
      }

      const { fullName, phone, businessName, gstNumber, currentPassword, userId } = validation.data;

      // Verify user exists and is a buyer
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role !== "buyer") {
        return res.status(403).json({ message: "Unauthorized: Only buyers can update buyer profiles" });
      }

      // Verify password for security (since we don't have sessions)
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
      }

      const updatedUser = await storage.updateUser(userId, {
        fullName,
        phone,
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "Failed to update user" });
      }

      let updatedBuyer = null;
      if (businessName !== undefined || gstNumber !== undefined) {
        updatedBuyer = await storage.updateBuyerByUserId(userId, {
          businessName,
          gstNumber,
        });
      } else {
        updatedBuyer = await storage.getBuyerByUserId(userId);
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json({
        user: userWithoutPassword,
        profile: updatedBuyer,
        message: "Profile updated successfully"
      });
    } catch (error: any) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: error.message || "Failed to update profile" });
    }
  });

  // ============ Product Routes ============
  
  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const { 
        categoryId, 
        vendorId, 
        fabric, 
        minPrice, 
        maxPrice, 
        search,
        limit,
        offset 
      } = req.query;

      const products = await storage.getAllProducts({
        categoryId: categoryId as string,
        vendorId: vendorId as string,
        fabric: fabric as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        search: search as string,
        limit: limit ? Number(limit) : 50,
        offset: offset ? Number(offset) : 0,
      });

      const productsWithCoupons = await Promise.all(
        products.map(async (product) => {
          if (product.couponId) {
            const coupon = await storage.getCoupon(product.couponId);
            if (coupon && coupon.isActive) {
              return { ...product, coupon };
            }
          }
          return { ...product, coupon: null };
        })
      );

      res.json(productsWithCoupons);
    } catch (error: any) {
      console.error("Get products error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get single product
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      let coupon = null;
      if (product.couponId) {
        const productCoupon = await storage.getCoupon(product.couponId);
        if (productCoupon && productCoupon.isActive) {
          coupon = productCoupon;
        }
      }

      res.json({ ...product, coupon });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Product viewer tracking - register/heartbeat a viewer
  app.post("/api/products/:id/view", (req, res) => {
    try {
      const productId = req.params.id;
      const { sessionId } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ message: "sessionId required" });
      }
      
      registerViewer(productId, sessionId);
      const viewerCount = getActiveViewerCount(productId);
      
      res.json({ viewerCount });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Product viewer tracking - unregister a viewer (when leaving page)
  app.delete("/api/products/:id/view", (req, res) => {
    try {
      const productId = req.params.id;
      const { sessionId } = req.body;
      
      if (sessionId) {
        removeViewer(productId, sessionId);
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get viewer count for a product
  app.get("/api/products/:id/viewers", (req, res) => {
    try {
      const productId = req.params.id;
      const viewerCount = getActiveViewerCount(productId);
      
      res.json({ viewerCount });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get viewer counts for multiple products (for cart page)
  app.post("/api/products/viewers/batch", (req, res) => {
    try {
      const { productIds } = req.body;
      
      if (!Array.isArray(productIds)) {
        return res.status(400).json({ message: "productIds array required" });
      }
      
      const viewerCounts: Record<string, number> = {};
      for (const productId of productIds) {
        viewerCounts[productId] = getActiveViewerCount(productId);
      }
      
      res.json({ viewerCounts });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Validate and apply coupon code
  app.post("/api/coupons/validate", async (req, res) => {
    try {
      const { code, orderTotal } = req.body;
      
      if (!code) {
        return res.status(400).json({ valid: false, message: "Coupon code is required" });
      }

      const coupon = await storage.getCouponByCode(code.toUpperCase());
      
      if (!coupon) {
        return res.status(404).json({ valid: false, message: "Coupon expired" });
      }

      if (!coupon.isActive) {
        return res.status(400).json({ valid: false, message: "Coupon expired" });
      }

      const now = new Date();
      
      if (coupon.startsAt && new Date(coupon.startsAt) > now) {
        return res.status(400).json({ valid: false, message: "Coupon expired" });
      }

      if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
        return res.status(400).json({ valid: false, message: "Coupon expired" });
      }

      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return res.status(400).json({ valid: false, message: "Coupon expired" });
      }

      if (coupon.minOrderValue && orderTotal && Number(orderTotal) < Number(coupon.minOrderValue)) {
        return res.status(400).json({ 
          valid: false, 
          message: `Minimum order value of ₹${Number(coupon.minOrderValue).toLocaleString()} required` 
        });
      }

      res.json({ 
        valid: true, 
        coupon: {
          id: coupon.id,
          code: coupon.code,
          name: coupon.name,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minOrderValue: coupon.minOrderValue,
        },
        message: "Coupon applied successfully" 
      });
    } catch (error: any) {
      console.error("Validate coupon error:", error);
      res.status(500).json({ valid: false, message: error.message });
    }
  });

  // Create product (vendor only - requires approved KYC)
  app.post("/api/products", upload.array("images", 10), async (req, res) => {
    try {
      const { 
        vendorId, 
        name, 
        description, 
        categoryId, 
        fabric, 
        price, 
        moq, 
        stock,
        colors,
        sizes,
        bulkPricing,
        couponId
      } = req.body;

      // Check if vendor exists and has approved KYC
      const vendor = await storage.getVendor(vendorId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      if (vendor.kycStatus !== "approved" && vendor.kycStatus !== "submitted") {
        return res.status(403).json({ 
          message: "KYC verification required. Please complete your KYC verification before adding products." 
        });
      }

      // Generate slug from name
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      // Handle uploaded images
      const images = (req.files as Express.Multer.File[])?.map(file => `/uploads/${file.filename}`) || [];

      const product = await storage.createProduct({
        vendorId,
        name,
        slug,
        description,
        categoryId,
        fabric,
        price,
        moq: Number(moq),
        stock: Number(stock),
        images: JSON.stringify(images.length > 0 ? images : ["🌸"]),
        colors: colors ? JSON.stringify(JSON.parse(colors)) : null,
        sizes: sizes ? JSON.stringify(JSON.parse(sizes)) : null,
        bulkPricing: bulkPricing ? JSON.stringify(JSON.parse(bulkPricing)) : null,
        couponId: couponId && couponId !== "none" ? couponId : null,
      });

      res.status(201).json(product);
    } catch (error: any) {
      console.error("Create product error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Update product
  app.put("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete product
  app.delete("/api/products/:id", async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.json({ message: "Product deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ Vendor Routes ============
  
  // Get approved vendors (public - for homepage featured vendors)
  app.get("/api/vendors/approved", async (req, res) => {
    try {
      const { limit } = req.query;
      const vendors = await storage.getAllVendors({
        kycStatus: "approved",
        limit: limit ? Number(limit) : undefined,
      });

      res.json(vendors);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get all vendors (admin only)
  app.get("/api/vendors", requireAdminAuth, async (req, res) => {
    try {
      const { kycStatus, limit } = req.query;
      const vendors = await storage.getAllVendors({
        kycStatus: kycStatus as string,
        limit: limit ? Number(limit) : undefined,
      });

      res.json(vendors);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get vendor by ID (admin only)
  app.get("/api/vendors/:id", requireAdminAuth, async (req, res) => {
    try {
      const vendor = await storage.getVendor(req.params.id);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      res.json(vendor);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update vendor (admin only)
  app.put("/api/vendors/:id", requireAdminAuth, async (req, res) => {
    try {
      const vendor = await storage.updateVendor(req.params.id, req.body);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      res.json(vendor);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get vendor products (admin only)
  app.get("/api/vendors/:id/products", requireAdminAuth, async (req, res) => {
    try {
      const products = await storage.getAllProducts({
        vendorId: req.params.id,
      });
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get vendor stats/earnings (admin only)
  app.get("/api/vendors/:id/stats", requireAdminAuth, async (req, res) => {
    try {
      const stats = await storage.getVendorDashboardStats(req.params.id);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Approve vendor KYC (admin only)
  app.post("/api/vendors/:id/approve", requireAdminAuth, async (req, res) => {
    try {
      const vendor = await storage.updateVendor(req.params.id, {
        kycStatus: "approved",
      });
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      res.json(vendor);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Reject vendor KYC (admin only)
  app.post("/api/vendors/:id/reject", requireAdminAuth, async (req, res) => {
    try {
      const vendor = await storage.updateVendor(req.params.id, {
        kycStatus: "rejected",
      });
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Suspend vendor account (admin only)
  app.post("/api/vendors/:id/suspend", requireAdminAuth, async (req, res) => {
    try {
      const vendor = await storage.updateVendor(req.params.id, {
        isActive: false,
      });
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Activate vendor account (admin only)
  app.post("/api/vendors/:id/activate", requireAdminAuth, async (req, res) => {
    try {
      const vendor = await storage.updateVendor(req.params.id, {
        isActive: true,
      });
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ Vendor Product Management Routes ============

  // Get vendor's own products
  app.get("/api/vendor/my-products", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const vendor = await storage.getVendorByUserId(userId);
      if (!vendor) {
        return res.status(403).json({ message: "Vendor profile not found" });
      }

      const products = await storage.getProductsByVendorId(vendor.id);
      res.json(products);
    } catch (error: any) {
      console.error("Get vendor products error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Update vendor's own product (authenticated vendor only)
  app.put("/api/vendor/products/:id", requireAuth, upload.array("images", 10), async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const vendor = await storage.getVendorByUserId(userId);
      if (!vendor) {
        return res.status(403).json({ message: "Vendor profile not found" });
      }

      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.vendorId !== vendor.id) {
        return res.status(403).json({ message: "You can only edit your own products" });
      }

      const { name, description, price, moq, stock, fabric, categoryId, couponId } = req.body;
      
      const updates: any = {};
      if (name && typeof name === 'string' && name.trim()) {
        updates.name = name.trim();
        updates.slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      }
      if (description !== undefined) updates.description = description;
      if (price !== undefined) {
        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
          return res.status(400).json({ message: "Price must be a positive number" });
        }
        updates.price = parsedPrice.toFixed(2);
      }
      if (moq !== undefined) {
        const parsedMoq = parseInt(moq, 10);
        if (isNaN(parsedMoq) || parsedMoq < 1) {
          return res.status(400).json({ message: "MOQ must be a positive integer" });
        }
        updates.moq = parsedMoq;
      }
      if (stock !== undefined) {
        const parsedStock = parseInt(stock, 10);
        if (isNaN(parsedStock) || parsedStock < 0) {
          return res.status(400).json({ message: "Stock must be a non-negative integer" });
        }
        updates.stock = parsedStock;
      }
      if (fabric !== undefined) updates.fabric = fabric;
      if (categoryId !== undefined) updates.categoryId = categoryId;
      if (couponId !== undefined) {
        updates.couponId = couponId === "" || couponId === "none" ? null : couponId;
      }

      const files = req.files as Express.Multer.File[];
      if (files && files.length > 0) {
        const newImages = files.map(file => `/uploads/${file.filename}`);
        updates.images = JSON.stringify(newImages);
      }

      updates.updatedAt = new Date();

      const updatedProduct = await storage.updateProduct(req.params.id, updates);
      res.json(updatedProduct);
    } catch (error: any) {
      console.error("Update vendor product error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Delete vendor's own product (authenticated vendor only)
  app.delete("/api/vendor/products/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const vendor = await storage.getVendorByUserId(userId);
      if (!vendor) {
        return res.status(403).json({ message: "Vendor profile not found" });
      }

      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.vendorId !== vendor.id) {
        return res.status(403).json({ message: "You can only delete your own products" });
      }

      await storage.deleteProduct(req.params.id);
      res.json({ message: "Product deleted successfully" });
    } catch (error: any) {
      console.error("Delete vendor product error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // ============ Vendor Coupon Routes ============

  // Create coupon (vendor - creates an active coupon they can apply to their products)
  app.post("/api/vendor/coupons", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const vendor = await storage.getVendorByUserId(userId);
      if (!vendor) {
        return res.status(403).json({ message: "Vendor profile not found" });
      }

      const { code, name, description, discountType, discountValue, minOrderValue, maxUses, startsAt, expiresAt } = req.body;

      if (!code || !name || discountValue === undefined) {
        return res.status(400).json({ message: "Code, name, and discount value are required" });
      }

      const existingCoupon = await storage.getCouponByCode(code);
      if (existingCoupon) {
        return res.status(400).json({ message: "Coupon code already exists" });
      }

      const coupon = await storage.createCoupon({
        code: code.toUpperCase(),
        name,
        description: description || null,
        discountType: discountType || "percentage",
        discountValue: discountValue.toString(),
        minOrderValue: minOrderValue ? minOrderValue.toString() : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        isActive: true,
        startsAt: startsAt ? new Date(startsAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      });

      res.status(201).json(coupon);
    } catch (error: any) {
      console.error("Vendor create coupon error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get vendor's coupons (includes all active coupons they can use)
  app.get("/api/vendor/coupons", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const vendor = await storage.getVendorByUserId(userId);
      if (!vendor) {
        return res.status(403).json({ message: "Vendor profile not found" });
      }

      const coupons = await storage.getActiveCoupons();
      res.json(coupons);
    } catch (error: any) {
      console.error("Get vendor coupons error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // ============ Admin Vendor Management Routes ============

  // Get all vendors with user details (admin only)
  app.get("/api/admin/vendors", requireAdminAuth, async (req, res) => {
    try {
      const { kycStatus, search, limit, offset } = req.query;
      
      const vendors = await storage.getAllVendors({
        kycStatus: kycStatus as string,
        limit: limit ? Number(limit) : undefined,
      });

      const vendorsWithUserDetails = await Promise.all(
        vendors.map(async (vendor) => {
          const user = await storage.getUser(vendor.userId);
          const stats = await storage.getVendorDashboardStats(vendor.id);
          return {
            ...vendor,
            user: user ? {
              id: user.id,
              email: user.email,
              fullName: user.fullName,
              phone: user.phone,
              isBlocked: user.isBlocked,
              createdAt: user.createdAt,
            } : null,
            stats,
          };
        })
      );

      let filteredVendors = vendorsWithUserDetails;
      if (search) {
        const searchLower = (search as string).toLowerCase();
        filteredVendors = vendorsWithUserDetails.filter(v => 
          v.businessName.toLowerCase().includes(searchLower) ||
          v.user?.fullName?.toLowerCase().includes(searchLower) ||
          v.user?.email?.toLowerCase().includes(searchLower) ||
          v.gstNumber?.toLowerCase().includes(searchLower)
        );
      }

      res.json(filteredVendors);
    } catch (error: any) {
      console.error("Get admin vendors error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get single vendor with full details (admin only)
  app.get("/api/admin/vendors/:id", requireAdminAuth, async (req, res) => {
    try {
      const vendor = await storage.getVendor(req.params.id);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      const user = await storage.getUser(vendor.userId);
      const stats = await storage.getVendorDashboardStats(vendor.id);
      const products = await storage.getAllProductsForAdmin({ vendorId: vendor.id });
      const vendorOrders = await storage.getVendorOrders(vendor.id);

      res.json({
        ...vendor,
        user: user ? {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          isBlocked: user.isBlocked,
          createdAt: user.createdAt,
        } : null,
        stats,
        products,
        orders: vendorOrders,
      });
    } catch (error: any) {
      console.error("Get admin vendor details error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Delete vendor and associated user (admin only)
  app.delete("/api/admin/vendors/:id", requireAdminAuth, async (req, res) => {
    try {
      const vendor = await storage.getVendor(req.params.id);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      await storage.deleteVendor(req.params.id);
      
      res.json({ message: "Vendor deleted successfully" });
    } catch (error: any) {
      console.error("Delete vendor error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // GST number validation function
  function validateGstNumber(gst: string): { valid: boolean; message: string } {
    if (!gst || gst.length === 0) {
      return { valid: false, message: "Incorrect - GST number is required" };
    }
    
    // Remove any spaces
    const gstNumber = gst.trim().toUpperCase();
    
    // Check length (must be exactly 15 characters)
    if (gstNumber.length !== 15) {
      return { valid: false, message: "Incorrect - GST number must be exactly 15 characters" };
    }
    
    // GST format: 2 digits state code + 10 char PAN + 1 entity number + 1 'Z' + 1 check digit
    // Pattern: ^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$
    const gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    
    if (!gstPattern.test(gstNumber)) {
      return { valid: false, message: "Incorrect - Invalid GST number format" };
    }
    
    // Validate state code (01-37 are valid Indian state codes)
    const stateCode = parseInt(gstNumber.substring(0, 2), 10);
    if (stateCode < 1 || stateCode > 37) {
      return { valid: false, message: "Incorrect - Invalid state code in GST number" };
    }
    
    // Validate PAN format (positions 3-12)
    const panPart = gstNumber.substring(2, 12);
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panPattern.test(panPart)) {
      return { valid: false, message: "Incorrect - Invalid PAN in GST number" };
    }
    
    // The 4th character of PAN indicates entity type
    // C = Company, P = Person, H = HUF, F = Firm, A = AOP, T = Trust, etc.
    const entityTypes = ['C', 'P', 'H', 'F', 'A', 'T', 'B', 'L', 'J', 'G'];
    if (!entityTypes.includes(panPart[3])) {
      return { valid: false, message: "Incorrect - Invalid entity type in GST number" };
    }
    
    return { valid: true, message: "Valid GST number" };
  }

  // KYC submission validation schema - all fields required
  const kycSubmissionSchema = z.object({
    businessAddress: z.string()
      .min(10, "Incorrect - Business address must be at least 10 characters")
      .max(500, "Incorrect - Business address must be less than 500 characters")
      .transform(val => val?.trim()),
    gstNumber: z.string()
      .min(1, "Incorrect - GST number is required")
      .length(15, "Incorrect - GST number must be exactly 15 characters")
      .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Incorrect - Invalid GST number format")
      .transform(val => val?.trim().toUpperCase()),
  });

  // Vendor KYC submission (for vendors themselves)
  app.post("/api/vendors/kyc/submit", requireAuth, upload.array('documents', 5), async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "vendor") {
        return res.status(403).json({ message: "Only vendors can submit KYC documents" });
      }

      const vendor = await storage.getVendorByUserId(userId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "At least one document is required" });
      }

      if (files.length > 5) {
        return res.status(400).json({ message: "Maximum 5 documents allowed" });
      }

      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const maxFileSize = 5 * 1024 * 1024;

      for (const file of files) {
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return res.status(400).json({ 
            message: `Invalid file type: ${file.originalname}. Only JPG, PNG, and PDF files are allowed.` 
          });
        }
        if (file.size > maxFileSize) {
          return res.status(400).json({ 
            message: `File too large: ${file.originalname}. Maximum size is 5MB.` 
          });
        }
        // Sanitize filename - remove path traversal attempts
        if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
          return res.status(400).json({ 
            message: `Invalid filename: ${file.originalname}` 
          });
        }
      }

      // Validate business info using Zod schema
      const validationResult = kycSubmissionSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: validationResult.error.errors.map(e => e.message).join(', ') 
        });
      }

      const { businessAddress, gstNumber } = validationResult.data;

      // Additional GST validation with detailed error messages
      const gstValidation = validateGstNumber(gstNumber);
      if (!gstValidation.valid) {
        return res.status(400).json({ 
          message: gstValidation.message
        });
      }

      // Validate business address is provided
      if (!businessAddress || businessAddress.length < 10) {
        return res.status(400).json({ 
          message: "Incorrect - Business address must be at least 10 characters"
        });
      }

      const documentUrls = files.map(file => `/uploads/${file.filename}`);

      const updatedVendor = await storage.updateVendor(vendor.id, {
        kycDocuments: documentUrls,
        businessAddress: businessAddress,
        gstNumber: gstNumber,
        kycStatus: "submitted",
      });

      res.json({ 
        message: "KYC documents submitted successfully", 
        vendor: updatedVendor 
      });
    } catch (error: any) {
      console.error("KYC submission error:", error);
      res.status(500).json({ message: error.message || "Failed to submit KYC documents" });
    }
  });

  // ============ Category Routes ============
  
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/categories", requireAdminAuth, async (req, res) => {
    try {
      const { name, description, image, parentId } = req.body;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const category = await storage.createCategory({
        name,
        slug,
        description,
        image,
        parentId,
      });

      res.status(201).json(category);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/categories/:id", requireAdminAuth, async (req, res) => {
    try {
      const { name, description, image, parentId } = req.body;
      const updates: any = {};
      
      if (name) {
        updates.name = name;
        updates.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      }
      if (description !== undefined) updates.description = description;
      if (image !== undefined) updates.image = image;
      if (parentId !== undefined) updates.parentId = parentId;

      const category = await storage.updateCategory(req.params.id, updates);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(category);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/categories/:id", requireAdminAuth, async (req, res) => {
    try {
      await storage.deleteCategory(req.params.id);
      res.json({ message: "Category deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ Admin Product Management Routes ============

  // Get all products for admin (with status filtering)
  app.get("/api/admin/products", requireAdminAuth, async (req, res) => {
    try {
      const { status, categoryId, vendorId, search, limit, offset } = req.query;
      
      const products = await storage.getAllProductsForAdmin({
        status: status as string,
        categoryId: categoryId as string,
        vendorId: vendorId as string,
        search: search as string,
        limit: limit ? Number(limit) : 100,
        offset: offset ? Number(offset) : 0,
      });

      res.json(products);
    } catch (error: any) {
      console.error("Get admin products error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Approve product
  app.post("/api/admin/products/:id/approve", requireAdminAuth, async (req, res) => {
    try {
      const product = await storage.updateProductStatus(req.params.id, "approved");
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error: any) {
      console.error("Approve product error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Publish product
  app.post("/api/admin/products/:id/publish", requireAdminAuth, async (req, res) => {
    try {
      const product = await storage.updateProductStatus(req.params.id, "published");
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error: any) {
      console.error("Publish product error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Update product status
  app.put("/api/admin/products/:id/status", requireAdminAuth, async (req, res) => {
    try {
      const { status } = req.body;
      
      if (!["pending", "approved", "published"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      const product = await storage.updateProductStatus(req.params.id, status);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error: any) {
      console.error("Update product status error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Update product (admin can edit any product)
  app.put("/api/admin/products/:id", requireAdminAuth, async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error: any) {
      console.error("Update product error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Delete product (admin only)
  app.delete("/api/admin/products/:id", requireAdminAuth, async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.json({ message: "Product deleted successfully" });
    } catch (error: any) {
      console.error("Delete product error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Bulk upload products via CSV
  app.post("/api/admin/products/bulk-upload", requireAdminAuth, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileContent = fs.readFileSync(req.file.path, "utf-8");
      
      const parseResult = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
      });

      if (parseResult.errors.length > 0) {
        return res.status(400).json({ 
          message: "CSV parsing error", 
          errors: parseResult.errors 
        });
      }

      const rows = parseResult.data as any[];
      const products = [];
      const errors = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          const slug = row.name ? row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "";
          
          if (!row.name || !row.description || !row.price || !row.vendorId) {
            errors.push({ row: i + 1, error: "Missing required fields (name, description, price, vendorId)" });
            continue;
          }

          const product = {
            vendorId: row.vendorId?.trim(),
            name: row.name?.trim(),
            slug: slug,
            description: row.description?.trim(),
            categoryId: row.categoryId?.trim() || null,
            fabric: row.fabric?.trim() || null,
            price: row.price?.toString(),
            moq: row.moq ? parseInt(row.moq) : 10,
            stock: row.stock ? parseInt(row.stock) : 0,
            images: row.images ? JSON.parse(row.images) : [],
            colors: row.colors ? JSON.parse(row.colors) : null,
            sizes: row.sizes ? JSON.parse(row.sizes) : null,
            bulkPricing: row.bulkPricing ? JSON.parse(row.bulkPricing) : null,
            status: "pending" as any,
            isActive: true,
            featured: false,
          };

          products.push(product);
        } catch (error: any) {
          errors.push({ row: i + 1, error: error.message });
        }
      }

      if (products.length === 0) {
        return res.status(400).json({ 
          message: "No valid products to upload", 
          errors 
        });
      }

      const createdProducts = await storage.bulkCreateProducts(products);

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.json({ 
        message: `Successfully uploaded ${createdProducts.length} products`,
        created: createdProducts.length,
        errors: errors.length > 0 ? errors : undefined,
        products: createdProducts
      });
    } catch (error: any) {
      console.error("Bulk upload error:", error);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: error.message });
    }
  });

  // ============ Customer Management Routes (Admin Only) ============
  
  // Get all customers with filters
  app.get("/api/admin/customers", requireAdminAuth, async (req, res) => {
    try {
      const { search, role, isBlocked, limit, offset } = req.query;
      
      const customers = await storage.getAllCustomers({
        search: search as string,
        role: role as string,
        isBlocked: isBlocked === 'true' ? true : isBlocked === 'false' ? false : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      
      res.json(customers);
    } catch (error: any) {
      console.error("Get customers error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get customer details with full profile
  app.get("/api/admin/customers/:id", requireAdminAuth, async (req, res) => {
    try {
      const customer = await storage.getUser(req.params.id);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      // Get customer's addresses
      const addresses = await storage.getUserAddresses(req.params.id);
      
      // Get customer's orders
      const orders = await storage.getUserOrders(req.params.id);
      
      // Get role-specific profile
      let profile = null;
      if (customer.role === 'vendor') {
        profile = await storage.getVendorByUserId(req.params.id);
      } else if (customer.role === 'buyer') {
        profile = await storage.getBuyerByUserId(req.params.id);
      }

      res.json({
        ...customer,
        addresses,
        orders,
        profile,
      });
    } catch (error: any) {
      console.error("Get customer details error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Block a customer
  app.post("/api/admin/customers/:id/block", requireAdminAuth, async (req, res) => {
    try {
      const customer = await storage.blockUser(req.params.id);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      res.json({ message: "Customer blocked successfully", customer });
    } catch (error: any) {
      console.error("Block customer error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Unblock a customer
  app.post("/api/admin/customers/:id/unblock", requireAdminAuth, async (req, res) => {
    try {
      const customer = await storage.unblockUser(req.params.id);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      res.json({ message: "Customer unblocked successfully", customer });
    } catch (error: any) {
      console.error("Unblock customer error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // ============ Cart Routes ============
  
  // In-memory storage for guest carts (keyed by guestId)
  const guestCarts = new Map<string, Array<{
    id: string;
    userId: string;
    productId: string;
    quantity: number;
    selectedColor: string | null;
    selectedSize: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>>();

  function isGuestUser(userId: string): boolean {
    return userId.startsWith('guest_');
  }

  function generateGuestCartItemId(): string {
    return `gcart_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
  
  app.get("/api/cart/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      
      if (isGuestUser(userId)) {
        const guestCart = guestCarts.get(userId) || [];
        return res.json(guestCart);
      }
      
      const cartItems = await storage.getUserCart(userId);
      res.json(cartItems);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const { userId, productId, quantity, selectedColor, selectedSize } = req.body;
      
      if (isGuestUser(userId)) {
        let guestCart = guestCarts.get(userId) || [];
        
        // Check if item already exists in guest cart
        const existingIndex = guestCart.findIndex(item => item.productId === productId);
        
        if (existingIndex >= 0) {
          // Update quantity
          guestCart[existingIndex].quantity += quantity;
          guestCart[existingIndex].updatedAt = new Date();
        } else {
          // Add new item
          const newItem = {
            id: generateGuestCartItemId(),
            userId,
            productId,
            quantity,
            selectedColor: selectedColor || null,
            selectedSize: selectedSize || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          guestCart.push(newItem);
        }
        
        guestCarts.set(userId, guestCart);
        return res.status(201).json(guestCart[existingIndex >= 0 ? existingIndex : guestCart.length - 1]);
      }
      
      const cartItem = await storage.addToCart(req.body);
      res.status(201).json(cartItem);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const { quantity } = req.body;
      const cartItemId = req.params.id;
      
      // Check if this is a guest cart item
      if (cartItemId.startsWith('gcart_')) {
        for (const [guestId, cart] of guestCarts.entries()) {
          const itemIndex = cart.findIndex(item => item.id === cartItemId);
          if (itemIndex >= 0) {
            cart[itemIndex].quantity = quantity;
            cart[itemIndex].updatedAt = new Date();
            guestCarts.set(guestId, cart);
            return res.json(cart[itemIndex]);
          }
        }
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      const cartItem = await storage.updateCartItem(cartItemId, quantity);
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      res.json(cartItem);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const cartItemId = req.params.id;
      
      // Check if this is a guest cart item
      if (cartItemId.startsWith('gcart_')) {
        for (const [guestId, cart] of guestCarts.entries()) {
          const itemIndex = cart.findIndex(item => item.id === cartItemId);
          if (itemIndex >= 0) {
            cart.splice(itemIndex, 1);
            guestCarts.set(guestId, cart);
            return res.json({ message: "Item removed from cart" });
          }
        }
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      await storage.removeFromCart(cartItemId);
      res.json({ message: "Item removed from cart" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/cart/user/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      
      if (isGuestUser(userId)) {
        guestCarts.delete(userId);
        return res.json({ message: "Cart cleared successfully" });
      }
      
      await storage.clearCart(userId);
      res.json({ message: "Cart cleared successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ Wishlist Routes ============
  
  app.get("/api/wishlist/:userId", async (req, res) => {
    try {
      const wishlistItems = await storage.getUserWishlist(req.params.userId);
      res.json(wishlistItems);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/wishlist", async (req, res) => {
    try {
      const wishlistItem = await storage.addToWishlist(req.body);
      res.status(201).json(wishlistItem);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/wishlist/:id", async (req, res) => {
    try {
      await storage.removeFromWishlist(req.params.id);
      res.json({ message: "Item removed from wishlist" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ Order Routes ============
  
  // Create order
  app.post("/api/orders", async (req, res) => {
    try {
      const { userId, vendorId, shippingAddressId, items, totalAmount, paymentMethod } = req.body;

      // Generate order number
      const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

      // Create order
      const order = await storage.createOrder({
        orderNumber,
        userId,
        vendorId,
        shippingAddressId,
        totalAmount,
        paymentMethod,
        status: "pending",
        paymentStatus: "pending",
      });

      // Track used coupons to avoid duplicate increments
      const usedCouponIds = new Set<string>();

      // Create order items and track coupon usage
      for (const item of items) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
        });

        // Increment coupon usage if the product has an active coupon
        const product = await storage.getProduct(item.productId);
        if (product?.couponId && !usedCouponIds.has(product.couponId)) {
          const coupon = await storage.getCoupon(product.couponId);
          if (coupon?.isActive) {
            await storage.incrementCouponUsage(product.couponId);
            usedCouponIds.add(product.couponId);
          }
        }
      }

      // Clear cart
      await storage.clearCart(userId);

      res.status(201).json(order);
    } catch (error: any) {
      console.error("Create order error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get user orders
  app.get("/api/orders/user/:userId", async (req, res) => {
    try {
      const orders = await storage.getUserOrders(req.params.userId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get vendor orders
  app.get("/api/orders/vendor/:vendorId", async (req, res) => {
    try {
      const orders = await storage.getVendorOrders(req.params.vendorId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all orders (admin)
  app.get("/api/orders", requireAdminAuth, async (req, res) => {
    try {
      const { status, limit } = req.query;
      const orders = await storage.getAllOrders({
        status: status as string,
        limit: limit ? Number(limit) : undefined,
      });

      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update order
  app.put("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.updateOrder(req.params.id, req.body);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get order items
  app.get("/api/orders/:id/items", requireAdminAuth, async (req, res) => {
    try {
      const items = await storage.getOrderItems(req.params.id);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ Admin Order Management Routes ============

  // Get all orders with full details (admin only)
  app.get("/api/admin/orders", requireAdminAuth, async (req, res) => {
    try {
      const { status, limit } = req.query;
      const orders = await storage.getAllOrders({
        status: status as string,
        limit: limit ? Number(limit) : undefined,
      });

      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get single order with details (admin only)
  app.get("/api/admin/orders/:id", requireAdminAuth, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const items = await storage.getOrderItems(req.params.id);
      const address = await storage.getAddress(order.shippingAddressId);
      const user = await storage.getUser(order.userId);
      const vendor = await storage.getVendor(order.vendorId);

      res.json({
        ...order,
        items,
        shippingAddress: address,
        user,
        vendor,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update order status (admin only)
  app.put("/api/admin/orders/:id/status", requireAdminAuth, async (req, res) => {
    try {
      const { status } = req.body;

      if (!["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      const order = await storage.updateOrder(req.params.id, { 
        status: status as any,
      });

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update order tracking number (admin only)
  app.put("/api/admin/orders/:id/tracking", requireAdminAuth, async (req, res) => {
    try {
      const { trackingNumber } = req.body;

      if (!trackingNumber) {
        return res.status(400).json({ message: "Tracking number is required" });
      }

      const order = await storage.updateOrder(req.params.id, { 
        trackingNumber,
      });

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Assign vendor to order (admin only)
  app.put("/api/admin/orders/:id/vendor", requireAdminAuth, async (req, res) => {
    try {
      const { vendorId } = req.body;

      if (!vendorId) {
        return res.status(400).json({ message: "Vendor ID is required" });
      }

      // Verify vendor exists
      const vendor = await storage.getVendor(vendorId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      const order = await storage.updateOrder(req.params.id, { 
        vendorId,
      });

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Generate invoice PDF (admin only)
  app.get("/api/admin/orders/:id/invoice", requireAdminAuth, async (req, res) => {
    try {
      const PDFDocument = (await import("pdfkit")).default;
      
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const items = await storage.getOrderItems(req.params.id);
      const address = await storage.getAddress(order.shippingAddressId);
      const user = await storage.getUser(order.userId);
      const vendor = await storage.getVendor(order.vendorId);

      // Validate required data
      if (!items || items.length === 0) {
        return res.status(400).json({ message: "Order has no items" });
      }

      // Create PDF
      const doc = new PDFDocument({ margin: 50 });

      // Set response headers before piping
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=invoice-${order.orderNumber}.pdf`);

      // Pipe PDF to response
      doc.pipe(res);

      // Header
      doc.fontSize(20).text("INVOICE", { align: "center" });
      doc.moveDown();

      // Order details
      doc.fontSize(10);
      doc.text(`Order Number: ${order.orderNumber}`);
      doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`);
      doc.text(`Status: ${order.status.toUpperCase()}`);
      doc.text(`Payment Status: ${order.paymentStatus.toUpperCase()}`);
      doc.moveDown();

      // Customer details
      doc.fontSize(12).text("Bill To:", { underline: true });
      doc.fontSize(10);
      doc.text(user?.fullName || "Customer Name Not Available");
      doc.text(user?.email || "Email Not Available");
      if (address) {
        doc.text(address.addressLine1 || "");
        if (address.addressLine2) doc.text(address.addressLine2);
        doc.text(`${address.city || ""}, ${address.state || ""} ${address.postalCode || ""}`);
        doc.text(address.country || "");
      } else {
        doc.text("Address Not Available");
      }
      doc.moveDown();

      // Vendor details
      doc.fontSize(12).text("Sold By:", { underline: true });
      doc.fontSize(10);
      doc.text(vendor?.businessName || "Vendor Not Assigned");
      if (vendor?.businessAddress) {
        doc.text(vendor.businessAddress);
      } else {
        doc.text("Vendor Address Not Available");
      }
      doc.moveDown();

      // Items table
      doc.fontSize(12).text("Items:", { underline: true });
      doc.moveDown(0.5);

      // Table header
      const tableTop = doc.y;
      doc.fontSize(10).font("Helvetica-Bold");
      doc.text("Product", 50, tableTop);
      doc.text("Quantity", 300, tableTop);
      doc.text("Price", 380, tableTop);
      doc.text("Total", 460, tableTop);
      
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
      
      // Table rows
      doc.font("Helvetica");
      let yPosition = tableTop + 25;

      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        const itemTotal = Number(item.price || 0) * item.quantity;

        doc.text(product?.name || `Product ID: ${item.productId}`, 50, yPosition, { width: 240 });
        doc.text(item.quantity.toString(), 300, yPosition);
        doc.text(`₹${Number(item.price || 0).toFixed(2)}`, 380, yPosition);
        doc.text(`₹${itemTotal.toFixed(2)}`, 460, yPosition);

        yPosition += 20;
      }

      // Total
      doc.moveTo(50, yPosition + 10).lineTo(550, yPosition + 10).stroke();
      doc.fontSize(12).font("Helvetica-Bold");
      doc.text("Total Amount:", 380, yPosition + 20);
      doc.text(`₹${Number(order.totalAmount).toFixed(2)}`, 460, yPosition + 20);

      // Footer
      doc.fontSize(8).font("Helvetica").text(
        "Thank you for your business!",
        50,
        doc.page.height - 50,
        { align: "center" }
      );

      doc.end();
    } catch (error: any) {
      console.error("Generate invoice error:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: error.message });
      }
    }
  });

  // Generate shipping label PDF (admin only)
  app.get("/api/admin/orders/:id/shipping-label", requireAdminAuth, async (req, res) => {
    try {
      const PDFDocument = (await import("pdfkit")).default;
      
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const address = await storage.getAddress(order.shippingAddressId);
      const vendor = await storage.getVendor(order.vendorId);

      if (!address) {
        return res.status(404).json({ message: "Shipping address not found" });
      }

      // Create PDF (4x6 shipping label size)
      const doc = new PDFDocument({ size: [288, 432], margin: 20 });

      // Set response headers before piping
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=label-${order.orderNumber}.pdf`);

      // Pipe PDF to response
      doc.pipe(res);

      // Title
      doc.fontSize(16).font("Helvetica-Bold").text("SHIPPING LABEL", { align: "center" });
      doc.moveDown();

      // Order info
      doc.fontSize(10).font("Helvetica");
      doc.text(`Order: ${order.orderNumber}`);
      if (order.trackingNumber) {
        doc.text(`Tracking: ${order.trackingNumber}`);
      }
      doc.moveDown();

      // Ship From
      doc.fontSize(12).font("Helvetica-Bold").text("FROM:");
      doc.fontSize(10).font("Helvetica");
      doc.text(vendor?.businessName || "Vendor Not Assigned");
      if (vendor?.businessAddress) {
        doc.text(vendor.businessAddress, { width: 250 });
      } else {
        doc.text("Vendor Address Not Available");
      }
      doc.moveDown();

      // Ship To
      doc.fontSize(14).font("Helvetica-Bold").text("SHIP TO:");
      doc.fontSize(12).font("Helvetica-Bold");
      doc.text(address.fullName || "Recipient Name Not Available");
      doc.fontSize(10).font("Helvetica");
      doc.text(address.phone || "Phone Not Available");
      doc.text(address.addressLine1 || "", { width: 250 });
      if (address.addressLine2) {
        doc.text(address.addressLine2, { width: 250 });
      }
      doc.text(`${address.city || ""}, ${address.state || ""} ${address.postalCode || ""}`);
      doc.text(address.country || "");

      // Barcode placeholder (order number)
      doc.moveDown();
      doc.fontSize(8).text(`Order ID: ${order.id}`, { align: "center" });

      doc.end();
    } catch (error: any) {
      console.error("Generate shipping label error:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: error.message });
      }
    }
  });

  // ============ Admin Coupon Management Routes ============

  // Get all coupons (admin only)
  app.get("/api/admin/coupons", requireAdminAuth, async (req, res) => {
    try {
      const { isActive, search, limit, offset } = req.query;
      const coupons = await storage.getAllCoupons({
        isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
        search: search as string,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
      });
      res.json(coupons);
    } catch (error: any) {
      console.error("Get coupons error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get single coupon (admin only)
  app.get("/api/admin/coupons/:id", requireAdminAuth, async (req, res) => {
    try {
      const coupon = await storage.getCoupon(req.params.id);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      res.json(coupon);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create coupon (admin only)
  app.post("/api/admin/coupons", requireAdminAuth, async (req, res) => {
    try {
      const { code, name, description, discountType, discountValue, minOrderValue, maxUses, isActive, startsAt, expiresAt } = req.body;

      if (!code || !name || !discountValue) {
        return res.status(400).json({ message: "Code, name, and discount value are required" });
      }

      // Check if code already exists
      const existingCoupon = await storage.getCouponByCode(code);
      if (existingCoupon) {
        return res.status(400).json({ message: "Coupon code already exists" });
      }

      const coupon = await storage.createCoupon({
        code,
        name,
        description,
        discountType: discountType || "percentage",
        discountValue: discountValue.toString(),
        minOrderValue: minOrderValue ? minOrderValue.toString() : null,
        maxUses: maxUses || null,
        isActive: isActive !== false,
        startsAt: startsAt ? new Date(startsAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      });

      res.status(201).json(coupon);
    } catch (error: any) {
      console.error("Create coupon error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Update coupon (admin only)
  app.put("/api/admin/coupons/:id", requireAdminAuth, async (req, res) => {
    try {
      const { code, name, description, discountType, discountValue, minOrderValue, maxUses, isActive, startsAt, expiresAt } = req.body;

      // Check if code exists for a different coupon
      if (code) {
        const existingCoupon = await storage.getCouponByCode(code);
        if (existingCoupon && existingCoupon.id !== req.params.id) {
          return res.status(400).json({ message: "Coupon code already exists" });
        }
      }

      const updateData: any = {};
      if (code !== undefined) updateData.code = code;
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (discountType !== undefined) updateData.discountType = discountType;
      if (discountValue !== undefined) updateData.discountValue = discountValue.toString();
      if (minOrderValue !== undefined) updateData.minOrderValue = minOrderValue ? minOrderValue.toString() : null;
      if (maxUses !== undefined) updateData.maxUses = maxUses;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (startsAt !== undefined) updateData.startsAt = startsAt ? new Date(startsAt) : null;
      if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;

      const coupon = await storage.updateCoupon(req.params.id, updateData);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }

      res.json(coupon);
    } catch (error: any) {
      console.error("Update coupon error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Toggle coupon active status (admin only)
  app.patch("/api/admin/coupons/:id/toggle", requireAdminAuth, async (req, res) => {
    try {
      const coupon = await storage.getCoupon(req.params.id);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }

      const updatedCoupon = await storage.updateCoupon(req.params.id, { isActive: !coupon.isActive });
      res.json(updatedCoupon);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete coupon (admin only)
  app.delete("/api/admin/coupons/:id", requireAdminAuth, async (req, res) => {
    try {
      await storage.deleteCoupon(req.params.id);
      res.json({ message: "Coupon deleted successfully" });
    } catch (error: any) {
      console.error("Delete coupon error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // ============ Public Coupon Routes ============

  // Get active coupons for vendors to select
  app.get("/api/coupons/active", async (req, res) => {
    try {
      const coupons = await storage.getActiveCoupons();
      res.json(coupons);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get coupon by ID (for product display)
  app.get("/api/coupons/:id", async (req, res) => {
    try {
      const coupon = await storage.getCoupon(req.params.id);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      res.json(coupon);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ RFQ Routes ============
  
  app.post("/api/rfq", async (req, res) => {
    try {
      const rfq = await storage.createRfq(req.body);
      res.status(201).json(rfq);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/rfq/user/:userId", async (req, res) => {
    try {
      const rfqs = await storage.getUserRfqs(req.params.userId);
      res.json(rfqs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/rfq/vendor/:vendorId", async (req, res) => {
    try {
      const rfqs = await storage.getVendorRfqs(req.params.vendorId);
      res.json(rfqs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/rfq/:id", async (req, res) => {
    try {
      const rfq = await storage.updateRfq(req.params.id, req.body);
      if (!rfq) {
        return res.status(404).json({ message: "RFQ not found" });
      }

      res.json(rfq);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ Address Routes ============
  
  app.get("/api/addresses/:userId", async (req, res) => {
    try {
      const addresses = await storage.getUserAddresses(req.params.userId);
      res.json(addresses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/addresses", async (req, res) => {
    try {
      const address = await storage.createAddress(req.body);
      res.status(201).json(address);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/addresses/:id", async (req, res) => {
    try {
      const address = await storage.updateAddress(req.params.id, req.body);
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }

      res.json(address);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/addresses/:id", async (req, res) => {
    try {
      await storage.deleteAddress(req.params.id);
      res.json({ message: "Address deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ Review Routes ============
  
  app.get("/api/reviews/product/:productId", async (req, res) => {
    try {
      const reviews = await storage.getProductReviews(req.params.productId);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const review = await storage.createReview(req.body);
      res.status(201).json(review);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============ Newsletter Routes ============
  
  app.post("/api/newsletter", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email required" });
      }

      const subscription = await storage.subscribeNewsletter(email);
      res.status(201).json({ message: "Subscribed successfully", subscription });
    } catch (error: any) {
      if (error.message?.includes("unique")) {
        return res.status(400).json({ message: "Email already subscribed" });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // ============ Dashboard Statistics Routes ============
  
  app.get("/api/dashboard/buyer/:userId", async (req, res) => {
    try {
      const stats = await storage.getBuyerDashboardStats(req.params.userId);
      res.json(stats);
    } catch (error: any) {
      console.error("Get buyer dashboard stats error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/dashboard/vendor/:vendorId", async (req, res) => {
    try {
      const stats = await storage.getVendorDashboardStats(req.params.vendorId);
      res.json(stats);
    } catch (error: any) {
      console.error("Get vendor dashboard stats error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/dashboard/admin", requireAdminAuth, async (req, res) => {
    try {
      const stats = await storage.getAdminDashboardStats();
      res.json(stats);
    } catch (error: any) {
      console.error("Get admin dashboard stats error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/analytics/monthly-sales", requireAdminAuth, async (req, res) => {
    try {
      const data = await storage.getMonthlySalesData();
      res.json(data);
    } catch (error: any) {
      console.error("Get monthly sales data error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/analytics/vendor-performance", requireAdminAuth, async (req, res) => {
    try {
      const data = await storage.getVendorPerformance();
      res.json(data);
    } catch (error: any) {
      console.error("Get vendor performance error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/analytics/low-stock", requireAdminAuth, async (req, res) => {
    try {
      const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : 10;
      const products = await storage.getLowStockProducts(threshold);
      res.json(products);
    } catch (error: any) {
      console.error("Get low stock products error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/analytics/recent-orders", requireAdminAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const orders = await storage.getRecentOrders(limit);
      res.json(orders);
    } catch (error: any) {
      console.error("Get recent orders error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // ============ CMS Settings Routes ============

  // Default CMS settings
  const defaultCmsSettings: AllCmsSettings = {
    siteMeta: {
      siteName: "Queen 4feet",
      tagline: "Your Style, Your Way",
      contactEmail: "contact@queen4feel.com",
      contactPhone: "+91 98765 43210",
      address: "Mumbai, India",
      seoTitle: "Queen 4feet - Shop Premium Fashion Online",
      seoDescription: "Shop the latest fashion trends from multiple trusted sellers. Discover women's wear, men's fashion, ethnic wear and more with fast delivery.",
    },
    hero: {
      headline: "Discover Your Style",
      subheadline: "Shop the latest fashion trends from trusted sellers at amazing prices",
      ctaText: "Shop Now",
      ctaLink: "/products",
      isVisible: true,
      overlayOpacity: 50,
    },
    featuredCollections: {
      sectionTitle: "Featured Collections",
      collections: [
        { id: "1", title: "Trending Now", description: "Discover what's hot this season", link: "/products?category=womens-wear", isVisible: true },
        { id: "2", title: "Ethnic Elegance", description: "Beautiful traditional wear for every occasion", link: "/products?category=ethnic-wear", isVisible: true },
        { id: "3", title: "Everyday Essentials", description: "Comfortable and stylish casual wear", link: "/products?category=casual-wear", isVisible: true },
      ],
    },
    testimonials: {
      sectionTitle: "What Our Customers Say",
      testimonials: [
        { id: "1", customerName: "Priya Sharma", customerRole: "Verified Buyer", quote: "Amazing quality and fast delivery! The dress I ordered was exactly as shown. Will definitely shop here again!", rating: 5, isVisible: true },
        { id: "2", customerName: "Rahul Mehta", customerRole: "Happy Customer", quote: "Great variety of products from different sellers. Love the easy returns and excellent customer service.", rating: 5, isVisible: true },
      ],
    },
    promotions: {
      banners: [],
    },
    footer: {
      showNewsletter: true,
      newsletterTitle: "Subscribe to Our Newsletter",
      newsletterDescription: "Get the latest updates on new arrivals and exclusive offers",
      copyrightText: "© 2024 Queen 4feet. All rights reserved.",
      socialLinks: [
        { platform: "facebook", url: "https://facebook.com", isVisible: true },
        { platform: "instagram", url: "https://instagram.com", isVisible: true },
        { platform: "twitter", url: "https://twitter.com", isVisible: true },
        { platform: "linkedin", url: "https://linkedin.com", isVisible: true },
        { platform: "youtube", url: "https://youtube.com", isVisible: true },
      ],
    },
    homepageProducts: {
      sectionTitle: "Products For You",
      autoFallback: true,
      maxProducts: 12,
      products: [],
    },
  };

  // Public endpoint to get all CMS settings (no auth required)
  app.get("/api/cms/public", async (req, res) => {
    try {
      const allSettings = await storage.getAllCmsSettings();
      
      // Convert array to object with defaults
      const settingsMap: Partial<AllCmsSettings> = {};
      
      for (const setting of allSettings) {
        switch (setting.key) {
          case CMS_KEYS.SITE_META:
            settingsMap.siteMeta = setting.value as any;
            break;
          case CMS_KEYS.HERO:
            settingsMap.hero = setting.value as any;
            break;
          case CMS_KEYS.FEATURED_COLLECTIONS:
            settingsMap.featuredCollections = setting.value as any;
            break;
          case CMS_KEYS.TESTIMONIALS:
            settingsMap.testimonials = setting.value as any;
            break;
          case CMS_KEYS.PROMOTIONS:
            settingsMap.promotions = setting.value as any;
            break;
          case CMS_KEYS.FOOTER:
            settingsMap.footer = setting.value as any;
            break;
          case CMS_KEYS.HOMEPAGE_PRODUCTS:
            settingsMap.homepageProducts = setting.value as any;
            break;
        }
      }

      // Merge with defaults
      const result: AllCmsSettings = {
        siteMeta: { ...defaultCmsSettings.siteMeta, ...settingsMap.siteMeta },
        hero: { ...defaultCmsSettings.hero, ...settingsMap.hero },
        featuredCollections: settingsMap.featuredCollections || defaultCmsSettings.featuredCollections,
        testimonials: settingsMap.testimonials || defaultCmsSettings.testimonials,
        promotions: settingsMap.promotions || defaultCmsSettings.promotions,
        footer: { ...defaultCmsSettings.footer, ...settingsMap.footer },
        homepageProducts: settingsMap.homepageProducts || defaultCmsSettings.homepageProducts,
      };

      res.json(result);
    } catch (error: any) {
      console.error("Get public CMS settings error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Get all CMS settings
  app.get("/api/admin/cms", requireAdminAuth, async (req, res) => {
    try {
      const allSettings = await storage.getAllCmsSettings();
      
      const settingsMap: Partial<AllCmsSettings> = {};
      
      for (const setting of allSettings) {
        switch (setting.key) {
          case CMS_KEYS.SITE_META:
            settingsMap.siteMeta = setting.value as any;
            break;
          case CMS_KEYS.HERO:
            settingsMap.hero = setting.value as any;
            break;
          case CMS_KEYS.FEATURED_COLLECTIONS:
            settingsMap.featuredCollections = setting.value as any;
            break;
          case CMS_KEYS.TESTIMONIALS:
            settingsMap.testimonials = setting.value as any;
            break;
          case CMS_KEYS.PROMOTIONS:
            settingsMap.promotions = setting.value as any;
            break;
          case CMS_KEYS.FOOTER:
            settingsMap.footer = setting.value as any;
            break;
          case CMS_KEYS.HOMEPAGE_PRODUCTS:
            settingsMap.homepageProducts = setting.value as any;
            break;
        }
      }

      const result: AllCmsSettings = {
        siteMeta: { ...defaultCmsSettings.siteMeta, ...settingsMap.siteMeta },
        hero: { ...defaultCmsSettings.hero, ...settingsMap.hero },
        featuredCollections: settingsMap.featuredCollections || defaultCmsSettings.featuredCollections,
        testimonials: settingsMap.testimonials || defaultCmsSettings.testimonials,
        promotions: settingsMap.promotions || defaultCmsSettings.promotions,
        footer: { ...defaultCmsSettings.footer, ...settingsMap.footer },
        homepageProducts: settingsMap.homepageProducts || defaultCmsSettings.homepageProducts,
      };

      res.json(result);
    } catch (error: any) {
      console.error("Get admin CMS settings error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Update site meta
  app.patch("/api/admin/cms/site-meta", requireAdminAuth, async (req, res) => {
    try {
      const parsed = siteMetaSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }

      const setting = await storage.upsertCmsSetting({
        key: CMS_KEYS.SITE_META,
        value: parsed.data,
      });

      res.json(setting);
    } catch (error: any) {
      console.error("Update site meta error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Update hero section
  app.patch("/api/admin/cms/hero", requireAdminAuth, async (req, res) => {
    try {
      const parsed = heroSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }

      const setting = await storage.upsertCmsSetting({
        key: CMS_KEYS.HERO,
        value: parsed.data,
      });

      res.json(setting);
    } catch (error: any) {
      console.error("Update hero error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Update featured collections
  app.patch("/api/admin/cms/featured-collections", requireAdminAuth, async (req, res) => {
    try {
      const parsed = featuredCollectionsSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }

      const setting = await storage.upsertCmsSetting({
        key: CMS_KEYS.FEATURED_COLLECTIONS,
        value: parsed.data,
      });

      res.json(setting);
    } catch (error: any) {
      console.error("Update featured collections error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Update testimonials
  app.patch("/api/admin/cms/testimonials", requireAdminAuth, async (req, res) => {
    try {
      const parsed = testimonialsSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }

      const setting = await storage.upsertCmsSetting({
        key: CMS_KEYS.TESTIMONIALS,
        value: parsed.data,
      });

      res.json(setting);
    } catch (error: any) {
      console.error("Update testimonials error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Update promotions
  app.patch("/api/admin/cms/promotions", requireAdminAuth, async (req, res) => {
    try {
      const parsed = promotionsSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }

      const setting = await storage.upsertCmsSetting({
        key: CMS_KEYS.PROMOTIONS,
        value: parsed.data,
      });

      res.json(setting);
    } catch (error: any) {
      console.error("Update promotions error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Update footer
  app.patch("/api/admin/cms/footer", requireAdminAuth, async (req, res) => {
    try {
      const parsed = footerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }

      const setting = await storage.upsertCmsSetting({
        key: CMS_KEYS.FOOTER,
        value: parsed.data,
      });

      res.json(setting);
    } catch (error: any) {
      console.error("Update footer error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Update homepage featured products
  app.patch("/api/admin/cms/homepage-products", requireAdminAuth, async (req, res) => {
    try {
      const parsed = homepageFeaturedProductsSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }

      const setting = await storage.upsertCmsSetting({
        key: CMS_KEYS.HOMEPAGE_PRODUCTS,
        value: parsed.data,
      });

      res.json(setting);
    } catch (error: any) {
      console.error("Update homepage products error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Public: Get homepage products with fallback to latest vendor products
  app.get("/api/homepage-products", async (req, res) => {
    try {
      // Get CMS settings for homepage products
      const cmsSetting = await storage.getCmsSetting(CMS_KEYS.HOMEPAGE_PRODUCTS);
      const homepageConfig = cmsSetting?.value as any || {
        sectionTitle: "Products For You",
        autoFallback: true,
        maxProducts: 12,
        products: [],
      };

      let productIds: string[] = [];
      let useFallback = false;

      // Check if there are admin-selected products
      if (homepageConfig.products && homepageConfig.products.length > 0) {
        productIds = homepageConfig.products
          .filter((p: any) => p.isVisible !== false)
          .sort((a: any, b: any) => a.displayOrder - b.displayOrder)
          .map((p: any) => p.productId);
      }

      // If no selected products or autoFallback is enabled and no products selected
      if (productIds.length === 0 && (homepageConfig.autoFallback !== false)) {
        useFallback = true;
      }

      let products;
      if (useFallback) {
        // Get latest published vendor products
        products = await storage.getAllProducts({
          limit: homepageConfig.maxProducts || 12,
        });
      } else {
        // Fetch selected products by IDs
        const allProducts = await storage.getAllProducts({ limit: 100 });
        products = productIds
          .map((id: string) => allProducts.find(p => p.id === id))
          .filter(Boolean)
          .slice(0, homepageConfig.maxProducts || 12);
      }

      res.json({
        sectionTitle: homepageConfig.sectionTitle || "Products For You",
        products,
        useFallback,
      });
    } catch (error: any) {
      console.error("Get homepage products error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // ============ File Upload Routes ============
  
  app.post("/api/upload", upload.single("file"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl, filename: req.file.filename });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  }, express.static(uploadDir));

  const httpServer = createServer(app);

  return httpServer;
}
