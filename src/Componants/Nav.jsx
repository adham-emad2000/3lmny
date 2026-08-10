import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function Nav() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(false);

  // بنقرأ من الكاش فوراً (صفر تأخير، وصفر لودر عند الرفرش)
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem("elemny_user_data");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (
      localStorage.theme === "dark" ||
      document.documentElement.classList.contains("dark")
    ) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
      setIsDark(true);
    }
  };

  // المزامنة الصامتة في الخلفية (Background Sync) بدون أي لودر أو تأثير على الواجهة
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const freshData = docSnap.data();
            setUserData(freshData);
            localStorage.setItem("elemny_user_data", JSON.stringify(freshData));
          }
        } catch (error) {
          console.error("Error syncing user data:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("elemny_user_data");
      setUserData(null);
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (location.pathname === "/auth") {
    return null;
  }

  return (
    <nav
      dir="rtl"
      className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50 transition-colors duration-300"
    >
      <Link to="/" className="flex items-center gap-3 cursor-pointer">
        <div className="bg-primary text-white p-2 rounded-xl shadow-md shadow-blue-500/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <span className="text-2xl font-black text-navy dark:text-white tracking-tight">
          علمني<span className="text-primary">.</span>
        </span>
      </Link>

      <div className="flex items-center gap-5">
        <button
          onClick={toggleDarkMode}
          className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-navy dark:text-yellow-400 transition-transform active:scale-95 shadow-xs"
          title="تغيير الوضع"
        >
          {isDark ? "☀️" : "🌙"}
        </button>

        {userData ? (
          <div className="flex items-center gap-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-navy dark:text-white">
                  {userData.name}
                </p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {userData.role === "teacher" ? "👨‍🏫 معلم" : "🎓 طالب"}
                </p>
              </div>

              {userData.avatarUrl ? (
                <img
                  src={userData.avatarUrl}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full border-2 border-gray-100 dark:border-gray-700 object-cover shadow-inner"
                />
              ) : (
                <div className="w-10 h-10 rounded-full border-2 border-gray-100 dark:border-gray-700 bg-primary/10 text-primary dark:text-blue-400 flex items-center justify-center font-black text-base shadow-inner overflow-hidden">
                  {userData.name ? userData.name.charAt(0) : "👤"}
                </div>
              )}
            </div>

            <div className="w-px h-8 bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200 cursor-pointer"
              title="تسجيل خروج"
            >
              <span className="hidden md:inline">خروج</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
            </button>
          </div>
        ) : (
          <Link
            to="/auth"
            className="bg-primary hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-blue-500/20"
          >
            تسجيل الدخول
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Nav;
