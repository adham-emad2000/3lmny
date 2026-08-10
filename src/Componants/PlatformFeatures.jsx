import React, { useState } from "react";

function PlatformFeatures({ userType }) {
  // قراءة بيانات المستخدم من الكاش المحلي تلقائياً لو الـ prop مش موجودة
  const [currentUserData] = useState(() => {
    const saved = localStorage.getItem("elemny_user_data");
    return saved ? JSON.parse(saved) : null;
  });

  // تحديد نوع المستخدم الفعلي (لو مبعوثة prop نستخدمها، لو لأ نقرأها من الكاش، ولو مفيش خالص يبقى guest)
  const effectiveUserType =
    userType || (currentUserData ? currentUserData.role : "guest");

  const [activeTab, setActiveTab] = useState(
    effectiveUserType === "student" ? "student" : "teacher",
  );

  return (
    <section
      dir="rtl"
      className="py-24 bg-[#F1F3F5] dark:bg-gray-950 relative overflow-hidden border-t border-gray-200/80 dark:border-gray-800 shadow-inner transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* عنوان السيكشن */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <span className="bg-white dark:bg-gray-900 text-primary text-sm font-bold px-4 py-1.5 rounded-full border border-blue-100 dark:border-gray-800 shadow-xs inline-block">
            🎯 مميزات مصممة خصيصاً ليك
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-navy dark:text-white">
            {effectiveUserType === "student"
              ? "إزاي منصة 'علمني' بتسهل عليك دراستك؟"
              : effectiveUserType === "teacher"
                ? "إزاي 'علمني' بتساعدك تزود دخلك؟"
                : 'ليه تختار منصة "علمني"؟'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-base">
            {effectiveUserType === "guest"
              ? "سواء كنت معلم وعايز تزود دخلك، أو طالب بتدور على الأكفأ.. وفرنالك البيئة المثالية."
              : "خدمات حصرية متظبطة بالظبط على احتياجاتك لتجربة تعليمية أسرع وأسهل."}
          </p>

          {/* أزرار التبديل تظهر فقط للزائر (Guest) ولا تظهر أبداً للمسجلين */}
          {effectiveUserType === "guest" && (
            <div className="flex justify-center pt-4">
              <div className="bg-white dark:bg-gray-900 p-1.5 rounded-2xl shadow-md border border-gray-200/80 dark:border-gray-800 inline-flex gap-2">
                <button
                  onClick={() => setActiveTab("teacher")}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                    activeTab === "teacher"
                      ? "bg-primary text-white shadow-md shadow-blue-500/20"
                      : "text-gray-600 dark:text-gray-400 hover:text-navy dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  كمعلم
                </button>
                <button
                  onClick={() => setActiveTab("student")}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                    activeTab === "student"
                      ? "bg-primary text-white shadow-md shadow-blue-500/20"
                      : "text-gray-600 dark:text-gray-400 hover:text-navy dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  كطالب
                </button>
              </div>
            </div>
          )}
        </div>

        {/* الكارت الأساسي */}
        <div className="max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-3xl p-8 lg:p-12 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-200/60 dark:border-gray-800 relative overflow-hidden transition-all duration-500">
          <div className="absolute top-0 right-0 w-3 h-full bg-gradient-to-b from-primary via-purple-500 to-emerald-400"></div>

          {effectiveUserType === "teacher" ||
          (effectiveUserType === "guest" && activeTab === "teacher") ? (
            // محتوى المعلم
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fadeIn">
              <div className="space-y-6">
                <span className="text-xs font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-900 inline-block">
                  📍 زوّد دخلك واوصل لطلاب منطقتك
                </span>
                <h3 className="text-2xl lg:text-3xl font-black text-navy dark:text-white leading-tight">
                  سجل بياناتك، حدد نطاقك، واستقبل طلابك بضغطة زر!
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm lg:text-base">
                  بمجرد ما تعمل حسابك وتختار{" "}
                  <span className="text-navy dark:text-white font-bold">
                    المحافظة والمنطقة
                  </span>{" "}
                  بتاعتك، اسمك ومادتك هيظهروا فوراً لكل الطلاب اللي بيدوروا في
                  منطقتك من غير إعلانات مكلفة.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                    حرية تامة في قبول الطلبات وتحديد مواعيدك.
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                    نظام تفاوض على السعر يحفظ حقوقك وجهدك.
                  </div>
                </div>
              </div>

              <div className="bg-[#F8F9FA] dark:bg-gray-800/60 p-6 rounded-2xl border border-gray-200/60 dark:border-gray-700 shadow-inner space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://ui-avatars.com/api/?name=أحمد+محمد&background=2563EB&color=fff&bold=true"
                      alt="Teacher"
                      className="w-12 h-12 rounded-full border-2 border-primary"
                    />
                    <div>
                      <h4 className="font-bold text-navy dark:text-white text-base">
                        أ. أحمد محمد
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        معلم رياضيات
                      </p>
                    </div>
                  </div>
                  <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900">
                    🟢 Online ومتاح
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                    <span className="text-gray-400 block mb-1">المحافظة:</span>
                    <span className="font-bold text-navy dark:text-white">
                      القاهرة
                    </span>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                    <span className="text-gray-400 block mb-1">المنطقة:</span>
                    <span className="font-bold text-navy dark:text-white">
                      مدينة نصر
                    </span>
                  </div>
                </div>
                <div className="w-full bg-primary text-white py-2.5 rounded-xl font-bold text-center text-xs shadow-sm">
                  ✨ بروفايلك بيظهر للطلاب في منطقتك حالياً
                </div>
              </div>
            </div>
          ) : (
            // محتوى الطالب
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fadeIn">
              <div className="space-y-6">
                <span className="text-xs font-bold text-primary bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900 inline-block">
                  🔍 ابحث، قارن، واتفق بالسعر اللي يعجبك
                </span>
                <h3 className="text-2xl lg:text-3xl font-black text-navy dark:text-white leading-tight">
                  هتلاقي المدرس الصح جنبك.. وتفاوض على السعر براحتك!
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm lg:text-base">
                  اختار مادتك ومنطقتك، وهنعرض عليك قائمة بأفضل المعلمين{" "}
                  <span className="text-navy dark:text-white font-bold">
                    المتاحين في محيطك
                  </span>
                  . تصفح بروفايلاتهم، واقترح السعر اللي يناسب ميزانيتك بكل
                  مرونة.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                    معلمون كُفء وقريبين من موقعك الجغرافي.
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                    بدون أسعار جبرية.. حط سعرك وتفاوض بسهولة.
                  </div>
                </div>
              </div>

              <div className="bg-[#F8F9FA] dark:bg-gray-800/60 p-6 rounded-2xl border border-gray-200/60 dark:border-gray-700 shadow-inner space-y-4">
                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    المادة:
                  </span>
                  <span className="text-xs font-bold text-navy dark:text-white bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-lg">
                    فيزياء - ثانوية عامة
                  </span>
                </div>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    مكانك:
                  </span>
                  <span className="text-xs font-bold text-navy dark:text-white bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-lg">
                    القاهرة (منطقتك)
                  </span>
                </div>
                <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold text-center text-xs shadow-md">
                  🚀 ظهرلك أفضل المعلمين المتاحين في منطقتك
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default PlatformFeatures;
