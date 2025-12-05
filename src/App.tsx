import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/contexts/CartContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { WhatsAppChat } from "@/components/WhatsAppChat";
import { BackToTop } from "@/components/BackToTop";
import { ensureMobileViewport, setThemeColor, injectStructuredData } from "@/lib/seoUtils";
import { SEO_CONFIG } from "@/config/seoConfig";
import Index from "./pages/Index";
import NewArrivals from "./pages/NewArrivals";
import Men from "./pages/Men";
import Women from "./pages/Women";
import Accessories from "./pages/Accessories";
import Apparel from "./pages/Apparel";
import Furniture from "./pages/Furniture";
import Automotive from "./pages/Automotive";
import Specialty from "./pages/Specialty";
import Category from "./pages/Category";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Onboarding from "./pages/Onboarding";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ExchangeReturnPolicy from "./pages/ExchangeReturnPolicy";
import TermsConditions from "./pages/TermsConditions";
import ProductDetail from "./pages/ProductDetail";
import Bespoke from "./pages/Bespoke";
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import CartDetails from "@/pages/CartDetails";
import OrderSuccess from "@/pages/OrderSuccess";
import ProjectDetail from "@/pages/ProjectDetail";
import { AuthProvider } from "@/contexts/AuthContext";
import AdminRoutes from "./admin/AdminRoutes";

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Initialize SEO settings globally
const initializeSEO = () => {
  ensureMobileViewport();
  setThemeColor('#eab308');
  injectStructuredData(SEO_CONFIG.organization);
};

const App = () => {
  useEffect(() => {
    initializeSEO();
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <CurrencyProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                <WhatsAppChat />
                <BackToTop />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/new-arrivals" element={<NewArrivals />} />
                  <Route path="/men" element={<Men />} />
                  <Route path="/women" element={<Women />} />
                  <Route path="/accessories" element={<Accessories />} />
                  <Route path="/apparel" element={<Apparel />} />
                  <Route path="/furniture" element={<Furniture />} />
                  <Route path="/automotive" element={<Automotive />} />
                  <Route path="/specialty" element={<Specialty />} />
                  <Route path="/category/:categoryName" element={<Category />} />
                  <Route path="/cart" element={<Cart />} />
                  {/* Support legacy/shared cart links like /cart/:cartId for sellers */}
                  <Route path="/cart/:cartId" element={<CartDetails />} />
                  <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/about" element={<About />} />
            <Route path="/our-story" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/exchange-return-policy" element={<ExchangeReturnPolicy />} />
                  <Route path="/terms-conditions" element={<TermsConditions />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/bespoke" element={<Bespoke />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/cart-details/:cartId" element={<CartDetails />} />
                  <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/project/:id" element={<ProjectDetail />} />
                  <Route path="/admin/*" element={<AdminRoutes />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </CurrencyProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;
