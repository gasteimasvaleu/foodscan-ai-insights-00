import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Comunidade from "./pages/Comunidade";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/comunidade" element={<Comunidade />} />
      <Route path="*" element={<div className="p-8">Página não encontrada</div>} />
    </Routes>
  </BrowserRouter>
);

export default App;