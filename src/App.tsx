
import { useAuth } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PushNotificationSetup } from "@/components/PushNotificationSetup";
import { TubelightNavbar } from "@/components/ui/tubelight-navbar";
import { Home, Scan, Calendar, Activity, Dumbbell, ChefHat, Plus } from "lucide-react";
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
import WhatsAppSettings from "./pages/WhatsAppSettings";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import WorkoutPlan from "./pages/WorkoutPlan";
import PhysicalAssessment from "./pages/PhysicalAssessment";
import MyDiets from "./pages/MyDiets";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import Receitas from "./pages/Receitas";
// QueryClient instance
const queryClient = new QueryClient();
const navItems = [
  { name: 'Home', url: '/', icon: Home },
  { name: 'FoodScan', url: '/foodscan', icon: Scan },
  { name: 'Controle', url: '/controle-diario', icon: Calendar },
  { name: 'FitTracker', url: '/fit-tracker', icon: Activity },
  { name: 'Treinos', url: '/treinos', icon: Dumbbell },
  { name: 'MasterChef', url: '/masterchef', icon: ChefHat },
  { name: 'Mais', url: '#more', icon: Plus }
];

const AuthAwareNavbar = () => {
  const { user } = useAuth();
  if (!user) return null;
  return <TubelightNavbar items={navItems} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PushNotificationSetup />
      <BrowserRouter>
        <AuthAwareNavbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/workout" element={<WorkoutPlan />} />
          <Route path="/profile/assessment" element={<PhysicalAssessment />} />
          <Route path="/profile/diets" element={<MyDiets />} />
          <Route path="/foodscan" element={<FoodScan />} />
          <Route path="/controle-diario" element={<DailyControl />} />
          <Route path="/fit-tracker" element={<FitTracker />} />
          <Route path="/masterchef" element={<MasterCheFIT />} />
          <Route path="/quero-assinar" element={<Subscription />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
          <Route path="/termos-de-uso" element={<TermsOfUse />} />
          <Route path="/servinutri" element={<ServiNUTRI />} />
          <Route path="/receitas" element={<Receitas />} />
          <Route path="/treinos" element={<Treinos />} />
          <Route path="/admin/treinos" element={<AdminTreinos />} />
          <Route path="/admin/notificacoes" element={<AdminNotifications />} />
          <Route path="/whatsapp-settings" element={<WhatsAppSettings />} />
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
