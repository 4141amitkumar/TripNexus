import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FormPage from "./components/FormPage";
import ResultPage from "./components/ResultPage";
import DetailsPage from "./components/DetailsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FormPage />} />
        <Route path="/results" element={<ResultPage />} />
        <Route path="/details/:placeId" element={<DetailsPage />} />
      </Routes>
    </Router>
  );
}

export default App;