import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function Nav() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  // إغلاق القائمة المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  // المزامنة الصامتة في الخلفية (Background Sync) بدون أي لودر
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
      setDropdownOpen(false);
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (location.pathname === "/auth") {
    return null;
  }

  const teacherTier = userData?.subscription?.tier || "free";
  const isTeacherPro = userData?.role === "teacher" && teacherTier !== "free";

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
          className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-navy dark:text-yellow-400 transition-transform active:scale-95 shadow-xs cursor-pointer"
          title="تغيير الوضع"
        >
          {isDark ? "☀️" : "🌙"}
        </button>

        {userData ? (
          <div className="relative" ref={dropdownRef}>
            {/* زر فتح القائمة عند النقر على الاسم أو الصورة */}
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 cursor-pointer select-none bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 px-3 rounded-2xl border border-gray-200 dark:border-gray-700 transition-all"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-navy dark:text-white">
                  {userData.name}
                </p>
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                  {userData.role === "teacher" ? "👨‍🏫 معلم" : "🎓 طالب"}
                </p>
              </div>

              {userData.avatarUrl ? (
                <img
                  src={userData.avatarUrl}
                  alt="User Avatar"
                  className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 object-cover shadow-sm"
                />
              ) : (
                <div className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 bg-primary/10 text-primary dark:text-blue-400 flex items-center justify-center font-black text-sm shadow-sm overflow-hidden">
                  {userData.name ? userData.name.charAt(0) : "👤"}
                </div>
              )}
            </div>

            {/* القائمة المنسدلة (Dropdown Menu) */}
            {dropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3 border-b border-gray-100 dark:border-gray-800 sm:hidden">
                  <p className="text-xs font-bold text-navy dark:text-white truncate">
                    {userData.name}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {userData.role === "teacher" ? "👨‍🏫 معلم" : "🎓 طالب"}
                  </p>
                </div>

                <div className="p-1.5 space-y-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full text-right flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
                  >
                    <span>👤</span> تعديل وعرض البروفايل
                  </button>

                  {/* 🏫 زر إدارة الغرف والفصول الافتراضية للمدرسين */}
                  {userData.role === "teacher" && (
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate("/teacher-rooms");
                      }}
                      className="w-full text-right flex items-center justify-between px-3 py-2.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <span>🏫</span> إدارة الفصول (Rooms)
                      </div>
                      {!isTeacherPro && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                          Pro
                        </span>
                      )}
                    </button>
                  )}

                  {/* 🎓 زر فصول الطالب الدراسية */}
                  {userData.role === "student" && (
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate("/student-rooms"); // أو المسار الخاص بصفحة الطالب
                      }}
                      className="w-full text-right flex items-center justify-between px-3 py-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <span>📚</span> فصولي الدراسية (Rooms)
                      </div>
                    </button>
                  )}

                  {userData.role === "teacher" && (
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate("/upgrade");
                      }}
                      className="w-full text-right flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-xl transition-colors cursor-pointer"
                    >
                      <span>✨</span> ترقية الباقات والاشتراك
                    </button>
                  )}

                  <div className="h-px bg-gray-100 dark:bg-gray-800 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-right flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
                  >
                    <span>🚪</span> تسجيل الخروج
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/auth"
            className="bg-primary hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-blue-500/25"
          >
            تسجيل الدخول
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Nav;
