
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <div>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/foodscan" element={<FoodScan />} />
              <Route path="/controle-diario" element={<DailyControl />} />
              <Route path="/masterchef" element={<MasterCheFIT />} />
              <Route path="/quero-assinar" element={<Subscription />} />
              <Route path="/sobre" element={<About />} />
              <Route path="/servinutri" element={<ServiNUTRI />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-cancel" element={<PaymentCancel />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <Sonner />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
