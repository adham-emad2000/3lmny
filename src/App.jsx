import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Nav from "./Componants/Nav";
import Hero from "./Componants/Hero";
import HowItWorks from "./Componants/PlatformFeatures";
import FAQ from "./Componants/FAQ";
import Footer from "./Componants/Footer";
import TeachersSearch from "./Pages/TeachersSearch";
import StudentRequest from "./Pages/StudentRequest"; // صفحة الطلب اللحظي للطالب
import TeacherLive from "./Pages/TeacherLive"; // صفحة استقبال الطلبات للمدرس
import Auth from "./Pages/Auth";
import ScrollToTop from "./Componants/ScrollToTop";
import ProtectedRoute from "./Componants/ProtectedRoute";

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
      <ScrollToTop />
      <div className="min-h-screen bg-offwhite dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col justify-between transition-colors duration-300">
        <Nav />

        <main className="flex-grow">
          <Routes>
            {/* صفحة تسجيل الدخول */}
            <Route path="/auth" element={<Auth />} />

            {/* الصفحات المحمية */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teachers"
              element={
                <ProtectedRoute>
                  <TeachersSearch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-request"
              element={
                <ProtectedRoute>
                  <StudentRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher-live"
              element={
                <ProtectedRoute>
                  <TeacherLive />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
