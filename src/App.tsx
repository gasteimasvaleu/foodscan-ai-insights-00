
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Comunidade from "./pages/Comunidade";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/comunidade" element={<Comunidade />} />
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
