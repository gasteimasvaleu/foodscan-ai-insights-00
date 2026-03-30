
import { useAuth } from "@/hooks/useAuth";
import { useNativePlatform } from "@/hooks/useNativePlatform";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { TubelightNavbar } from "@/components/ui/tubelight-navbar";
import { Home, Scan, Calendar, Activity, Dumbbell, ChefHat, MessageCircle, Plus } from "lucide-react";
import Index from "./pages/Index";
import FoodScan from "./pages/FoodScan";
import DailyControl from "./pages/DailyControl";
import FitTracker from "./pages/FitTracker";
import MasterCheFIT from "./pages/MasterCheFIT";
import About from "./pages/About";
import ServiNUTRI from "./pages/ServiNUTRI";
import Treinos from "./pages/Treinos";
import AdminTreinos from "./pages/AdminTreinos";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSubscriptions from "./pages/AdminSubscriptions";
import AdminBanners from "./pages/AdminBanners";

import WhatsAppSettings from "./pages/WhatsAppSettings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import WorkoutPlan from "./pages/WorkoutPlan";
import PhysicalAssessment from "./pages/PhysicalAssessment";
import MyDiets from "./pages/MyDiets";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import Receitas from "./pages/Receitas";
import Comunidade from "./pages/Comunidade";
import ChartsProgress from "./pages/ChartsProgress";
import NutriCoach from "./pages/NutriCoach";
import AppleHealth from "./pages/AppleHealth";
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
  const { user, subscription } = useAuth();
  const { isIOS: isNativeIOS } = useNativePlatform();
  if (!user) return null;
  if (isNativeIOS && !subscription.loading && !subscription.subscriptionStatus.subscribed) return null;
  return <TubelightNavbar items={navItems} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      
      <BrowserRouter>
        <AuthAwareNavbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/workout" element={<WorkoutPlan />} />
          <Route path="/profile/assessment" element={<PhysicalAssessment />} />
          <Route path="/profile/diets" element={<MyDiets />} />
          <Route path="/graficos-progresso" element={<ChartsProgress />} />
          <Route path="/foodscan" element={<FoodScan />} />
          <Route path="/controle-diario" element={<DailyControl />} />
          <Route path="/fit-tracker" element={<FitTracker />} />
          <Route path="/masterchef" element={<MasterCheFIT />} />
          
          <Route path="/sobre" element={<About />} />
          <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
          <Route path="/termos-de-uso" element={<TermsOfUse />} />
          <Route path="/servinutri" element={<ServiNUTRI />} />
          <Route path="/receitas" element={<Receitas />} />
          <Route path="/comunidade" element={<Comunidade />} />
          <Route path="/nutri-coach" element={<NutriCoach />} />
          <Route path="/apple-health" element={<AppleHealth />} />
          <Route path="/treinos" element={<Treinos />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/banners" element={<AdminBanners />} />
          <Route path="/admin/treinos" element={<AdminTreinos />} />
          <Route path="/admin/assinaturas-promocionais" element={<AdminSubscriptions />} />
          
          <Route path="/whatsapp-settings" element={<WhatsAppSettings />} />
          <Route path="/auth" element={<Auth />} />


          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
