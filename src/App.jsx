import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // 👈 استدعاء الكونتكس
import Nav from "./Componants/Nav";
import Hero from "./Componants/Hero";
import TeacherPricingCTA from "./Componants/TeacherPricingCTA";
import ProTeacher from "./Componants/ProTeacher";
import HowItWorks from "./Componants/PlatformFeatures";
import FAQ from "./Componants/FAQ";
import Footer from "./Componants/Footer";
import TeachersSearch from "./Pages/TeachersSearch";
import StudentRequest from "./Pages/StudentRequest";
import TeacherLive from "./Pages/TeacherLive";
import UpgradePage from "./Pages/UpgradePage";
import Subscribe from "./Pages/Subscribe";
import Profile from "./Pages/Profile";
import AdminDashboard from "./Pages/AdminDashboard";
import Auth from "./Pages/Auth";
import ScrollToTop from "./Componants/ScrollToTop";
import ProtectedRoute from "./Componants/ProtectedRoute";

function Home() {
  return (
    <>
      <Hero />
      <TeacherPricingCTA />
      <ProTeacher />
      <HowItWorks />
      <FAQ />
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        {" "}
        {/* 👈 مغلفة التطبيق عشان تدي الداتا لأي كومبوننت */}
        <ScrollToTop />
        <div className="min-h-screen bg-offwhite dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col justify-between transition-colors duration-300">
          <Nav />

          <main className="flex-grow">
            <Routes>
              <Route path="/auth" element={<Auth />} />

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
              <Route
                path="/upgrade"
                element={
                  <ProtectedRoute>
                    <UpgradePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subscribe"
                element={
                  <ProtectedRoute>
                    <Subscribe />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
