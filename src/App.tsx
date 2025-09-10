
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PWAUpdateNotification from "@/components/PWAUpdateNotification";
import { PushNotificationSetup } from "@/components/PushNotificationSetup";
import { TubelightNavbar } from "@/components/ui/tubelight-navbar";
import { Home, Scan, Calendar, Activity, Dumbbell, ChefHat, Apple } from "lucide-react";
import Index from "./pages/Index";
import FoodScan from "./pages/FoodScan";
import DailyControl from "./pages/DailyControl";
import FitTracker from "./pages/FitTracker";
import MasterCheFIT from "./pages/MasterCheFIT";
import Subscription from "./pages/Subscription";
import About from "./pages/About";
import ServiNUTRI from "./pages/ServiNUTRI";
import Treinos from "./pages/Treinos";
import AdminTreinos from "./pages/AdminTreinos";
import AdminNotifications from "./pages/AdminNotifications";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const navItems = [
  { name: 'Home', url: '/', icon: Home },
  { name: 'FoodScan', url: '/foodscan', icon: Scan },
  { name: 'Controle', url: '/controle-diario', icon: Calendar },
  { name: 'FitTracker', url: '/fit-tracker', icon: Activity },
  { name: 'Treinos', url: '/treinos', icon: Dumbbell },
  { name: 'MasterChef', url: '/masterchef', icon: ChefHat },
  { name: 'ServiNUTRI', url: '/servinutri', icon: Apple }
];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PWAUpdateNotification />
      <PushNotificationSetup />
      <BrowserRouter>
        <TubelightNavbar items={navItems} />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/foodscan" element={<FoodScan />} />
          <Route path="/controle-diario" element={<DailyControl />} />
          <Route path="/fit-tracker" element={<FitTracker />} />
          <Route path="/masterchef" element={<MasterCheFIT />} />
          <Route path="/quero-assinar" element={<Subscription />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/servinutri" element={<ServiNUTRI />} />
          <Route path="/treinos" element={<Treinos />} />
          <Route path="/admin/treinos" element={<AdminTreinos />} />
          <Route path="/admin/notificacoes" element={<AdminNotifications />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
