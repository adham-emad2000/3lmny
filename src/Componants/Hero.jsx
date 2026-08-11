import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

function Hero() {
  const { userData } = useAuth();

  const role = userData?.role;
  const isTeacher = role === "teacher";
  const isStudent = role === "student";

  return (
    <div
      dir="rtl"
      className="min-h-[calc(100vh-80px)] bg-[#F8F9FA] dark:bg-gray-950 relative overflow-hidden flex items-center justify-center px-6 py-12 transition-colors duration-300"
    >
      {/* خلفيات جمالية هادئة */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/5 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000"></div>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* ================= الحالة الأولى: المعلم ================= */}
        {isTeacher && (
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 px-4 py-2 rounded-full shadow-sm border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 text-sm font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              🟢 لوحة تحكم المدرس
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold text-navy dark:text-white leading-tight">
              أهلاً بك يا أستاذ {userData?.name || "معلمنا"}.. استقبل طلبات
              الطلاب حولك الآن!
            </h1>

            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
              لوحة التحكم اللحظية مفتوحة أمامك لاستقبال طلبات الطلاب في محافظة{" "}
              <strong className="text-navy dark:text-white">
                {userData?.governorate || "المحافظة"}
              </strong>{" "}
              - منطقة{" "}
              <strong className="text-navy dark:text-white">
                {userData?.area || "المنطقة"}
              </strong>{" "}
              لمادة{" "}
              <strong className="text-navy dark:text-white">
                {userData?.subject || "المادة"}
              </strong>
              . وافق أو تفاوض على السعر فوراً!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/teacher-live"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-1 text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>استقبل الطلبات حالا 🟢</span>
              </Link>
            </div>
          </div>
        )}

        {/* ================= الحالة الثانية: الطالب ================= */}
        {isStudent && (
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/60 px-4 py-2 rounded-full shadow-sm border border-blue-100 dark:border-blue-900 text-primary text-sm font-bold">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
              🎓 مرحباً بك يا {userData?.name || "بطل"}.. اطلب حصتك الآن
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold text-navy dark:text-white leading-tight">
              اطلب الحصة التي تريدها وحدد سعرها بنفسك!
            </h1>

            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
              أنشئ طلبك الآن، حدد المادة والصف والسعر المناسب لك باستخدام نظام
              التفاوض، واقبل عرض المعلم الأنسب لميزانيتك. أو تصفح قائمة المعلمين
              مباشرة.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/student-request"
                className="bg-primary hover:bg-blue-700 text-white font-bold px-6 py-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:-translate-y-1 text-center cursor-pointer"
              >
                اطلب حصتك الان 🚀
              </Link>
              <Link
                to="/teachers"
                className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-navy dark:text-white border border-gray-200 dark:border-gray-800 font-bold px-6 py-4 rounded-xl transition-all duration-300 hover:-translate-y-1 text-center shadow-sm cursor-pointer"
              >
                تصفح المدرسين في النطاق الخاص بك 🔍
              </Link>
            </div>
          </div>
        )}

        {/* ================= الحالة الثالثة: الزائر (مش عامل لوج إن) ================= */}
        {!isTeacher && !isStudent && (
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-900 px-4 py-2 rounded-full shadow-sm border border-blue-100 dark:border-gray-800 text-primary text-sm font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              🚀 InDrive للدروس الخصوصية في مصر
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold text-navy dark:text-white leading-tight">
              منصة "علمني".. حط سعرك، تفاوض مع المدرس، وابدأ التعليم!
            </h1>

            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
              سواء كنت طالباً تبحث عن مدرس وتحدد سعرك بحرية، أو معلماً ترغب في
              استقبال طلبات مباشرة.. منصتنا توفر لك بيئة تفاعلية لحظية بالكامل.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/auth"
                className="bg-primary hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 text-center cursor-pointer"
              >
                ابدأ الان (سجل دخول) 🚀
              </Link>
            </div>
          </div>
        )}

        {/* ================= الكارت التوضيحي الثابت على اليمين/اليسار ================= */}
        <div className="relative flex justify-center">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl shadow-indigo-900/10 border-2 border-purple-400/50 dark:border-purple-600/40 max-w-md w-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-3 h-full bg-gradient-to-b from-primary via-purple-500 to-emerald-400"></div>

            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-900">
                ✨ نظام التفاوض
              </span>
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <h3 className="text-xl font-black text-navy dark:text-white mb-4">
              كيف يعمل الطلب اللحظي
            </h3>

            <div className="space-y-3 mb-4">
              <div className="bg-blue-50/60 dark:bg-blue-950/40 p-3.5 rounded-2xl border border-blue-100 dark:border-blue-900 flex items-start gap-3">
                <span className="text-lg">🎓</span>
                <div>
                  <h4 className="font-bold text-navy dark:text-white text-sm">
                    الطالب:
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-xs mt-0.5">
                    يحدد المادة والوقت والسعر، وينتظر عروض المدرسين.
                  </p>
                </div>
              </div>

              <div className="bg-purple-50/60 dark:bg-purple-950/40 p-3.5 rounded-2xl border border-purple-100 dark:border-purple-900 flex items-start gap-3">
                <span className="text-lg">👨‍🏫</span>
                <div>
                  <h4 className="font-bold text-navy dark:text-white text-sm">
                    المعلم:
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-xs mt-0.5">
                    يستقبل الطلبات في نطاقه، يوافق أو يقترح سعراً جديداً
                    للتفاوض.
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full bg-gradient-to-r from-blue-50 via-purple-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800 text-navy dark:text-white py-3 rounded-xl font-bold text-center text-sm border border-purple-200 dark:border-gray-700 shadow-sm">
              ⚡ تطابق فوري في أقل من 5 دقائق
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
