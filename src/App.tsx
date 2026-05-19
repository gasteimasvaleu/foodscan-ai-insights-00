
import { useAuth } from "@/hooks/useAuth";
import { useNativePlatform } from "@/hooks/useNativePlatform";
import { useWidgetSyncOnLaunch } from "@/hooks/useWidgetSyncOnLaunch";
import { AuthProvider } from "@/contexts/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

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
import DMList from "./pages/DMList";
import DMThread from "./pages/DMThread";
import ChatGlobal from "./pages/ChatGlobal";
import AdminChat from "./pages/AdminChat";
import ChartsProgress from "./pages/ChartsProgress";
import NutriCoach from "./pages/NutriCoach";
import AppleHealth from "./pages/AppleHealth";
import Hydration from "./pages/Hydration";
import IntermittentFasting from "./pages/IntermittentFasting";
import Objetivos from "./pages/Objetivos";
import WidgetGuide from "./pages/WidgetGuide";
import Sleep from "./pages/Sleep";
import FacaEmCasa from "./pages/FacaEmCasa";
import Provador from "./pages/Provador";
import Loja from "./pages/Loja";
import AdminLoja from "./pages/AdminLoja";
import AdminAlimentosComunidade from "./pages/AdminAlimentosComunidade";
import ShoppingList from "./pages/ShoppingList";
import ShoppingListDetail from "./pages/ShoppingListDetail";
import AdicionarRefeicao from "./pages/AdicionarRefeicao";
import Maternidade from "./pages/Maternidade";
import Alimentos from "./pages/Alimentos";
import Paywall from "./pages/Paywall";
import Quiz from "./pages/Quiz";
import QuizPlay from "./pages/QuizPlay";
import QuizResult from "./pages/QuizResult";
import AdminQuiz from "./pages/AdminQuiz";
import Conquistas from "./pages/Conquistas";
import Desafio14Dias from "./pages/Desafio14Dias";
import NutricionistaQueVende from "./pages/NutricionistaQueVende";
import ToAqui from "./pages/ToAqui";
import ToAquiVenue from "./pages/ToAquiVenue";
import ToAquiOwner from "./pages/ToAquiOwner";
import ToAquiNewVenue from "./pages/ToAquiNewVenue";
import { useBadgeNotifications } from "@/hooks/useBadgeNotifications";
import { useStreakMilestones } from "@/hooks/useStreakMilestones";
import { CelebrationProvider } from "@/contexts/CelebrationContext";
import { ProRoute } from "@/components/ProRoute";
import { FREEMIUM_ENABLED } from "@/config/freemium";
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
  const { user, authReady, subscriptionReady, subscriptionStatus } = useAuth();
  const { isNative, isIOS } = useNativePlatform();
  const isNativeIOS = isNative && isIOS;
  const location = useLocation();

  // Global widget sync on launch (iOS only)
  useWidgetSyncOnLaunch(user?.id);
  useBadgeNotifications(user?.id);
  useStreakMilestones(user?.id);

  // Hide navbar on /auth and fullscreen chat
  if (location.pathname === '/auth' || location.pathname === '/comunidade/chat' || location.pathname.startsWith('/comunidade/dm/')) return null;

  // Don't render navbar until auth is ready
  if (!authReady || !user) return null;

  // On native iOS no modo legado (sem freemium): esconde navbar enquanto não assinante
  if (!FREEMIUM_ENABLED && isNativeIOS && (!subscriptionReady || !subscriptionStatus.subscribed)) return null;

  return <TubelightNavbar items={navItems} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <CelebrationProvider>
        <BrowserRouter>
          <AuthAwareNavbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/workout" element={<WorkoutPlan />} />
            <Route path="/profile/assessment" element={<PhysicalAssessment />} />
            <Route path="/profile/diets" element={<MyDiets />} />
            <Route path="/graficos-progresso" element={<ProRoute feature="graficos-progresso"><ChartsProgress /></ProRoute>} />
            <Route path="/foodscan" element={<FoodScan />} />
            <Route path="/controle-diario" element={<DailyControl />} />
            <Route path="/fit-tracker" element={<ProRoute feature="fit-tracker"><FitTracker /></ProRoute>} />
            <Route path="/masterchef" element={<ProRoute feature="masterchef"><MasterCheFIT /></ProRoute>} />

            <Route path="/sobre" element={<About />} />
            <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
            <Route path="/termos-de-uso" element={<TermsOfUse />} />
            <Route path="/servinutri" element={<ServiNUTRI />} />
            <Route path="/receitas" element={<ProRoute feature="receitas"><Receitas /></ProRoute>} />
            <Route path="/comunidade" element={<Comunidade />} />
            <Route path="/comunidade/chat" element={<ChatGlobal />} />
            <Route path="/comunidade/dm" element={<DMList />} />
            <Route path="/comunidade/dm/:id" element={<DMThread />} />
            <Route path="/admin/chat" element={<AdminChat />} />
            <Route path="/nutri-coach" element={<ProRoute feature="nutri-coach"><NutriCoach /></ProRoute>} />
            <Route path="/apple-health" element={<ProRoute feature="apple-health"><AppleHealth /></ProRoute>} />
            <Route path="/hidratacao" element={<ProRoute feature="hidratacao"><Hydration /></ProRoute>} />
            <Route path="/jejum" element={<ProRoute feature="jejum"><IntermittentFasting /></ProRoute>} />
            <Route path="/objetivos" element={<ProRoute feature="objetivos"><Objetivos /></ProRoute>} />
            <Route path="/widget-guide" element={<WidgetGuide />} />
            <Route path="/sono" element={<ProRoute feature="sono"><Sleep /></ProRoute>} />
            <Route path="/faca-em-casa" element={<ProRoute feature="faca-em-casa"><FacaEmCasa /></ProRoute>} />
            <Route path="/provador" element={<ProRoute feature="provador"><Provador /></ProRoute>} />
            <Route path="/treinos" element={<ProRoute feature="treinos"><Treinos /></ProRoute>} />
            <Route path="/nutricionista-que-vende" element={<ProRoute feature="nutricionista-que-vende"><NutricionistaQueVende /></ProRoute>} />
            <Route path="/loja" element={<Loja />} />
            <Route path="/lista-de-compras" element={<ShoppingList />} />
            <Route path="/lista-de-compras/:id" element={<ShoppingListDetail />} />
            <Route path="/adicionar-refeicao" element={<AdicionarRefeicao />} />
            <Route path="/maternidade" element={<Maternidade />} />
            <Route path="/alimentos" element={<Alimentos />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/banners" element={<AdminBanners />} />
            <Route path="/admin/treinos" element={<AdminTreinos />} />
            <Route path="/admin/loja" element={<AdminLoja />} />
            <Route path="/admin/alimentos-comunidade" element={<AdminAlimentosComunidade />} />
            <Route path="/admin/quiz" element={<AdminQuiz />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/quiz/:id" element={<QuizPlay />} />
            <Route path="/quiz/:id/resultado" element={<QuizResult />} />
            <Route path="/conquistas" element={<Conquistas />} />
            <Route path="/desafio-14-dias" element={<Desafio14Dias />} />
            <Route path="/admin/assinaturas-promocionais" element={<AdminSubscriptions />} />

            <Route path="/whatsapp-settings" element={<ProRoute feature="whatsapp-settings"><WhatsAppSettings /></ProRoute>} />
            <Route path="/assinar" element={<Paywall />} />
            <Route path="/auth" element={<Auth />} />

            <Route path="/to-aqui" element={<ToAqui />} />
            <Route path="/to-aqui/venue/:id" element={<ToAquiVenue />} />
            <Route path="/to-aqui/owner" element={<ToAquiOwner />} />
            <Route path="/to-aqui/owner/venue/new" element={<ToAquiNewVenue />} />

            <Route path="/auth" element={<Auth />} />


            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </CelebrationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
