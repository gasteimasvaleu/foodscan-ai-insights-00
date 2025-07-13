import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Comunidade from "./pages/Comunidade";
import DailyControl from "./pages/DailyControl";
import FoodScan from "./pages/FoodScan";
import MasterCheFIT from "./pages/MasterCheFIT";
import NotFound from "./pages/NotFound";
import PaymentCancel from "./pages/PaymentCancel";
import PaymentSuccess from "./pages/PaymentSuccess";
import ServiNUTRI from "./pages/ServiNUTRI";
import Subscription from "./pages/Subscription";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<About />} />
      <Route path="/comunidade" element={<Comunidade />} />
      <Route path="/daily-control" element={<DailyControl />} />
      <Route path="/food-scan" element={<FoodScan />} />
      <Route path="/masterchef" element={<MasterCheFIT />} />
      <Route path="/servnutri" element={<ServiNUTRI />} />
      <Route path="/subscription" element={<Subscription />} />
      <Route path="/quero-assinar" element={<Subscription />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-cancel" element={<PaymentCancel />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;