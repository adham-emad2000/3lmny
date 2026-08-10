import React from "react";
import { useNavigate } from "react-router-dom";
import { Crown, ArrowLeft } from "lucide-react";

function TeacherPricingCTA() {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("elemny_user_data") || "{}");

  // لو الطالب مسجل دخول، ممكن تخفي السيكشن أو تعرضه حسب رغبتك (هنا ظاهر للكل عشان يشجع الزوار يبقوا معلمين)
  if (userData?.role === "student") return null;

  return (
    <section
      className="py-12 px-6 bg-[#0f1015] border-y border-gray-800"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto bg-gradient-to-r from-purple-900/40 via-gray-900 to-blue-900/40 border border-gray-800 rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        {/* تفاصيل العرض للمعلمين */}
        <div className="space-y-4 text-center md:text-right">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-400 border border-purple-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold">
            <Crown className="w-4 h-4 text-purple-400" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            هل أنت معلم وتريد مضاعفة أرباحك وطلابك؟ 🚀
          </h2>
          <p className="text-gray-300 text-xs md:text-sm max-w-xl leading-relaxed">
            انضم إلى باقات{" "}
            <span className="text-primary font-bold">Standard</span> أو{" "}
            <span className="text-purple-400 font-bold">Pro</span>، واحصل على
            أولوية الظهور في نتائج البحث، ميزة التفاوض الذكي، وشارة المدرس
            المميز.
          </p>
        </div>

        {/* زر الانتقال لصفحة الباقات */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-shrink-0">
          <button
            onClick={() => navigate("/upgrade")}
            className="bg-primary hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>استعرض الباقات والأسعار</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default TeacherPricingCTA;
