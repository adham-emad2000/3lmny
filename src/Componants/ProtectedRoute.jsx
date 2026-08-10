import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebase"; // تأكد من مسار فايربيز بتاعك
import { onAuthStateChanged } from "firebase/auth";

function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // مراقبة حالة المستخدم
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // الفحص خلص
    });

    return () => unsubscribe();
  }, []);

  // 1. طول ما فايربيز بيفحص، بنعرض شاشة تحميل بسيطة عشان نمنع الطرد الخطأ
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-gray-950">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. الفحص خلص وطلع مش مسجل؟ ارميه على صفحة تسجيل الدخول
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // 3. مسجل دخول وزي الفل؟ افتحله الموقع
  return children;
}

export default ProtectedRoute;
