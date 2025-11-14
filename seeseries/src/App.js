// src/App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SeriesDetail from "./pages/SeriesDetail";

function App() {
  const [selectedSeries, setSelectedSeries] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home onSelectSeries={setSelectedSeries} />} />
        <Route path="/series/:id" element={<SeriesDetail series={selectedSeries} />} />
      </Routes>
    </Router>
  );
}

export default App;
