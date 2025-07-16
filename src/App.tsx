import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "@/hooks/useRouter";
import Index from "./pages/Index";
import FoodScan from "./pages/FoodScan";
import DailyControl from "./pages/DailyControl";
import MasterCheFIT from "./pages/MasterCheFIT";
import Subscription from "./pages/Subscription";
import About from "./pages/About";
import ServiNUTRI from "./pages/ServiNUTRI";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRouter = () => {
  const { currentPath } = useRouter();

  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <Index />;
      case '/foodscan':
        return <FoodScan />;
      case '/controle-diario':
        return <DailyControl />;
      case '/masterchef':
        return <MasterCheFIT />;
      case '/quero-assinar':
        return <Subscription />;
      case '/sobre':
        return <About />;
      case '/servinutri':
        return <ServiNUTRI />;
      case '/payment-success':
        return <PaymentSuccess />;
      case '/payment-cancel':
        return <PaymentCancel />;
      default:
        return <NotFound />;
    }
  };

  return (
    <div>
      {renderPage()}
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  );
};

export default App;