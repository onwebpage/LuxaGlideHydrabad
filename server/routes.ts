import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";

// Set up file upload
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // ============ Authentication Routes ============
  
  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, fullName, phone, role, businessName, gstNumber } = req.body;

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
      if (role === "vendor") {
        await storage.createVendor({
          userId: user.id,
          businessName: businessName || "",
          gstNumber,
          kycStatus: "pending",
        });
      } else if (role === "buyer") {
        await storage.createBuyer({
          userId: user.id,
          businessName,
          gstNumber,
        });
      }

      res.json({ message: "Registration successful", userId: user.id, role: user.role });
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

      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        user: userWithoutPassword,
        profile: profileData,
        message: "Login successful"
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: error.message || "Login failed" });
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

      res.json(products);
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

      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create product (vendor only)
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
        bulkPricing
      } = req.body;

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
  
  // Get all vendors
  app.get("/api/vendors", async (req, res) => {
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

  // Get vendor by ID
  app.get("/api/vendors/:id", async (req, res) => {
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

  // Update vendor (KYC approval/rejection)
  app.put("/api/vendors/:id", async (req, res) => {
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

  // ============ Category Routes ============
  
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/categories", async (req, res) => {
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

  // ============ Cart Routes ============
  
  app.get("/api/cart/:userId", async (req, res) => {
    try {
      const cartItems = await storage.getUserCart(req.params.userId);
      res.json(cartItems);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const cartItem = await storage.addToCart(req.body);
      res.status(201).json(cartItem);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(req.params.id, quantity);
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
      await storage.removeFromCart(req.params.id);
      res.json({ message: "Item removed from cart" });
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

      // Create order items
      for (const item of items) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
        });
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
  app.get("/api/orders", async (req, res) => {
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
  app.get("/api/orders/:id/items", async (req, res) => {
    try {
      const items = await storage.getOrderItems(req.params.id);
      res.json(items);
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
