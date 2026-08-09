import React from "react";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <div
      dir="rtl"
      className="min-h-[calc(100vh-80px)] bg-[#F8F9FA] dark:bg-gray-950 relative overflow-hidden flex items-center justify-center px-6 py-12 transition-colors duration-300"
    >
      {/* دوائر تدرج في الخلفية */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/5 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000"></div>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* الجانب الأيمن */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-900 px-4 py-2 rounded-full shadow-sm border border-blue-100 dark:border-gray-800 text-primary text-sm font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            🚀 الحل الأذكى للدروس الخصوصية المباشرة
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold text-navy dark:text-white leading-tight">
            منصة "علمني".. بتربط الطالب بالمعلم في ثوانٍ وبأفضل سعر!
          </h1>

          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
            سواء كنت{" "}
            <span className="text-navy dark:text-white font-bold">طالب</span>{" "}
            بتدور على مدرس شاطر جنبك وبتتفاوض على السعر اللي يريحك، أو{" "}
            <span className="text-navy dark:text-white font-bold">معلم</span>{" "}
            وعايز توصل لطلاب منطقتك بسهولة.. منصتنا صممت عشان تسهل عليك الطريق.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <span className="bg-blue-50 dark:bg-blue-950/60 text-primary text-xs font-bold px-3.5 py-1.5 rounded-xl border border-blue-100 dark:border-blue-900">
              ⚡ بحث جغرافي لحظي
            </span>
            <span className="bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 text-xs font-bold px-3.5 py-1.5 rounded-xl border border-purple-100 dark:border-purple-900">
              💬 نظام تفاوض مرن على السعر
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              to="/teachers"
              className="bg-primary hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:-translate-y-1 text-center"
            >
              ابحث عن معلم الآن
            </Link>

            <button className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-navy dark:text-white border border-gray-200 dark:border-gray-800 font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:-translate-y-1 text-center shadow-sm">
              سجل كمعلم وابدأ التدريس
            </button>
          </div>
        </div>

        {/* الجانب الأيسر (الكارت) */}
        <div className="relative flex justify-center">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl shadow-indigo-900/10 border-2 border-purple-400/50 dark:border-purple-600/40 max-w-md w-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-3 h-full bg-gradient-to-b from-primary via-purple-500 to-emerald-400"></div>

            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-900">
                ✨ تجربة ذكية للطرفين
              </span>
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <h3 className="text-xl font-black text-navy dark:text-white mb-4">
              إزاي "علمني" بتفيدك؟
            </h3>

            <div className="space-y-3 mb-4">
              <div className="bg-blue-50/60 dark:bg-blue-950/40 p-3.5 rounded-2xl border border-blue-100 dark:border-blue-900 flex items-start gap-3">
                <span className="text-lg">🎓</span>
                <div>
                  <h4 className="font-bold text-navy dark:text-white text-sm">
                    للطالب:
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-xs mt-0.5">
                    اختار مادتك ومكانك، تصفح المعلمين، وحط السعر اللي يناسبك.
                  </p>
                </div>
              </div>

              <div className="bg-purple-50/60 dark:bg-purple-950/40 p-3.5 rounded-2xl border border-purple-100 dark:border-purple-900 flex items-start gap-3">
                <span className="text-lg">👨‍🏫</span>
                <div>
                  <h4 className="font-bold text-navy dark:text-white text-sm">
                    للمعلم:
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-xs mt-0.5">
                    سجل منطقتك واظهر أوتوماتيك لطلاب منطقتك واستقبل طلباتهم.
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full bg-gradient-to-r from-blue-50 via-purple-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800 text-navy dark:text-white py-3 rounded-xl font-bold text-center text-sm border border-purple-200 dark:border-gray-700 shadow-sm">
              🚀 انضم لينا واكتشف المنصة الآن
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
