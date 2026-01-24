import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ShoppingAssistant } from "@/components/ShoppingAssistant";
import { AuthProvider } from "./lib/auth-context";
import { ThemeProvider } from "./lib/theme-context";

// Pages
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Vendors from "@/pages/Vendors";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import VendorRegister from "@/pages/VendorRegister";
import VendorManagement from "@/pages/VendorManagement";
import BuyerDashboard from "@/pages/BuyerDashboard";
import VendorDashboard from "@/pages/VendorDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminLogin from "@/pages/AdminLogin";
import AdminProducts from "@/pages/AdminProducts";
import AdminProductsBulkUpload from "@/pages/AdminProductsBulkUpload";
import AdminCategories from "@/pages/AdminCategories";
import AdminOrders from "@/pages/AdminOrders";
import AdminCustomers from "@/pages/AdminCustomers";
import AdminVendors from "@/pages/AdminVendors";
import AdminSiteSettings from "@/pages/AdminSiteSettings";
import AdminCoupons from "@/pages/AdminCoupons";
import NotFound from "@/pages/not-found";
import { PrivacyPolicy, TermsOfService, RefundPolicy, ShippingPolicy } from "@/pages/Policies";
function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/vendors" component={Vendors} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/vendor-register" component={VendorRegister} />
      <Route path="/vendor-management" component={VendorManagement} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/dashboard/buyer" component={BuyerDashboard} />
      <Route path="/dashboard/vendor" component={VendorDashboard} />
      <Route path="/vendor" component={VendorDashboard} />
      <Route path="/dashboard/admin/products/bulk-upload" component={AdminProductsBulkUpload} />
      <Route path="/dashboard/admin/products" component={AdminProducts} />
      <Route path="/dashboard/admin/categories" component={AdminCategories} />
      <Route path="/dashboard/admin/orders" component={AdminOrders} />
      <Route path="/dashboard/admin/customers" component={AdminCustomers} />
      <Route path="/dashboard/admin/vendors" component={AdminVendors} />
      <Route path="/dashboard/admin/site-settings" component={AdminSiteSettings} />
      <Route path="/dashboard/admin/coupons" component={AdminCoupons} />
      <Route path="/dashboard/admin" component={AdminDashboard} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/refund-policy" component={RefundPolicy} />
      <Route path="/shipping-policy" component={ShippingPolicy} />
      {/* Redirect /dashboard to role-specific dashboard - will be dynamic based on user role */}
      <Route path="/dashboard" component={BuyerDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  const isAuthPage = location.includes("/login") || location.includes("/register") || location.includes("/vendor-register") || location.includes("/vendor-management") || location.includes("/admin-login");
  const isDashboardPage = location.includes("/dashboard");

  return (
    <TooltipProvider>
      <ScrollToTop />
      {!isAuthPage && <Header />}
      <Router />
      {!isAuthPage && <ShoppingAssistant />}
      {!isAuthPage && !isDashboardPage && <Footer />}
      <Toaster />
    </TooltipProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
