import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";
import { Analytics } from "@vercel/analytics/react";
import { motion } from "framer-motion"; // مكتبة الأنيماشن
import Nav from "./Componants/Nav";
import Hero from "./Componants/Hero";
import LandingFeatures from "./Componants/LandingFeatures.jsx"; // السيكشن التسويقي الجديد
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

// مسارات المعلم
import TeacherRooms from "./Pages/TeacherRooms";
import RoomDetails from "./Pages/RoomDetails";
import Assignments from "./Pages/Assignments";
import Quizzes from "./Pages/Quizzes";
import OnlineClasses from "./Pages/OnlineClasses";
import AssignmentSubmissions from "./Pages/AssignmentSubmissions";

// مسارات الطالب
import StudentRooms from "./Pages/StudentRooms";
import StudentRoom from "./Pages/StudentRoom";

function Home() {
  return (
    <>
      <Hero />

      {/* السيكشن التسويقي الجديد متحرك بطريقة أنيقة أول ما يظهر */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <LandingFeatures />
      </motion.div>

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
        <ScrollToTop />
        <div className="min-h-screen bg-offwhite dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col justify-between transition-colors duration-300">
          <Nav />

          <main className="flex-grow">
            <Routes>
              <Route path="/auth" element={<Auth />} />

              {/* الصفحة الرئيسية تسويقية ولازم تفضل مفتوحة للزوار (مش عاملين لوج إن) */}
              <Route path="/" element={<Home />} />
              <Route path="/teachers" element={<TeachersSearch />} />

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

              {/* مسارات المعلم */}
              <Route
                path="/teacher-rooms"
                element={
                  <ProtectedRoute>
                    <TeacherRooms />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher-room/:roomId"
                element={
                  <ProtectedRoute>
                    <RoomDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher-room/:roomId/assignments"
                element={
                  <ProtectedRoute>
                    <Assignments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher-room/:roomId/assignment/:assignmentId/submissions"
                element={
                  <ProtectedRoute>
                    <AssignmentSubmissions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher-room/:roomId/quizzes"
                element={
                  <ProtectedRoute>
                    <Quizzes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher-room/:roomId/classes"
                element={
                  <ProtectedRoute>
                    <OnlineClasses />
                  </ProtectedRoute>
                }
              />

              {/* مسارات الطالب */}
              <Route
                path="/student-rooms"
                element={
                  <ProtectedRoute>
                    <StudentRooms />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student-room/:roomId"
                element={
                  <ProtectedRoute>
                    <StudentRoom />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <Footer />
        </div>
        <Analytics />
      </AuthProvider>
    </Router>
  );
}

export default App;
