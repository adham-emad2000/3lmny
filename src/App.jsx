import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Nav from "./Componants/Nav";
import Hero from "./Componants/Hero";
import TeacherPricingCTA from "./Componants/TeacherPricingCTA"; // سيكشن ترويجي للباقات للمعلمين
import ProTeacher from "./Componants/ProTeacher"; // سيكشن المعلمين المميزين في الهوم
import HowItWorks from "./Componants/PlatformFeatures";
import FAQ from "./Componants/FAQ";
import Footer from "./Componants/Footer";
import TeachersSearch from "./Pages/TeachersSearch";
import StudentRequest from "./Pages/StudentRequest"; // صفحة الطلب اللحظي للطالب
import TeacherLive from "./Pages/TeacherLive"; // صفحة استقبال الطلبات للمدرس
import UpgradePage from "./Pages/UpgradePage"; // صفحة ترقية الباقات للمدرسين
import Subscribe from "./Pages/Subscribe"; // صفحة الدفع والاشتراك والبرومو كود
import Profile from "./Pages/Profile"; // صفحة البروفايل الشخصي
import AdminDashboard from "./Pages/AdminDashboard"; // لوحة تحكم الأدمن للإيصالات
import Auth from "./Pages/Auth";
import ScrollToTop from "./Componants/ScrollToTop";
import ProtectedRoute from "./Componants/ProtectedRoute";

function Home() {
  return (
    <>
      <Hero />
      <TeacherPricingCTA /> {/* سيكشن الباقات يظهر بعد الهيرو مباشرة */}
      <ProTeacher />
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
    </Router>
  );
}

export default App;
