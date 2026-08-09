import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Nav from "./Componants/Nav";
import Hero from "./Componants/Hero";
import HowItWorks from "./Componants/PlatformFeatures";
import FAQ from "./Componants/FAQ";
import Footer from "./Componants/Footer";
import TeachersSearch from "./Pages/TeachersSearch";
import Auth from "./Pages/Auth";

// مكون الصفحة الرئيسية (Home Page)
function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <FAQ />
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-offwhite dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col justify-between transition-colors duration-300">
        <Nav />

        {/* نظام التوجيه (Routing) */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/teachers" element={<TeachersSearch />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
