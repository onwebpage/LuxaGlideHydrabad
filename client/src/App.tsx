import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "./lib/auth-context";

// Pages
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Vendors from "@/pages/Vendors";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import BuyerDashboard from "@/pages/BuyerDashboard";
import VendorDashboard from "@/pages/VendorDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminLogin from "@/pages/AdminLogin";
import AdminProducts from "@/pages/AdminProducts";
import AdminProductsBulkUpload from "@/pages/AdminProductsBulkUpload";
import AdminCategories from "@/pages/AdminCategories";
import AdminOrders from "@/pages/AdminOrders";
import AdminCustomers from "@/pages/AdminCustomers";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/vendors" component={Vendors} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/dashboard/buyer" component={BuyerDashboard} />
      <Route path="/dashboard/vendor" component={VendorDashboard} />
      <Route path="/dashboard/admin/products/bulk-upload" component={AdminProductsBulkUpload} />
      <Route path="/dashboard/admin/products" component={AdminProducts} />
      <Route path="/dashboard/admin/categories" component={AdminCategories} />
      <Route path="/dashboard/admin/orders" component={AdminOrders} />
      <Route path="/dashboard/admin/customers" component={AdminCustomers} />
      <Route path="/dashboard/admin" component={AdminDashboard} />
      {/* Redirect /dashboard to role-specific dashboard - will be dynamic based on user role */}
      <Route path="/dashboard" component={BuyerDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  const isAuthPage = location.includes("/login") || location.includes("/register") || location.includes("/admin-login");

  return (
    <TooltipProvider>
      {!isAuthPage && <Header />}
      <Router />
      {!isAuthPage && <Footer />}
      <Toaster />
    </TooltipProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
