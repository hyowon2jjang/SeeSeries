// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SeriesDetail from "./pages/SeriesDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/series/:id" element={<SeriesDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
