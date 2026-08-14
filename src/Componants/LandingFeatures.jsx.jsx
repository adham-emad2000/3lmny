import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../Context/AuthContext";
import {
  BookOpen,
  HelpCircle,
  Video,
  ShieldCheck,
  Zap,
  Sparkles,
  Crown,
  GraduationCap,
  ArrowLeft,
} from "lucide-react";

function LandingFeatures() {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const isStudent = userData?.role === "student";

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section
      dir="rtl"
      className="py-20 px-4 md:px-12 bg-slate-50 dark:bg-[#0b0c10] transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 md:p-12 overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col gap-12">
            {isStudent ? (
              // 🎓 واجهة الطالب المجانية المخصصة للانضمام والواجبات
              <>
                <motion.div
                  variants={itemVariants}
                  className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 rounded-3xl p-1 shadow-lg"
                >
                  <div className="bg-slate-900 rounded-[1.4rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>

                    <div className="flex items-center gap-5 z-10 text-right">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                        <GraduationCap size={32} className="text-white" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-2xl font-black text-white">
                            بوابة الطالب الدراسية
                          </h3>
                          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            مجاني بالكامل 🎓
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm font-medium">
                          انضم لمعلمك الخاص بررمز المرور، تابع دروسك، وحل
                          الأسايمنت وابعتها بكل سهولة!
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate("/student-rooms")}
                      className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 z-10 hover:scale-105 cursor-pointer whitespace-nowrap"
                    >
                      <span>فصولي الدراسية</span> <ArrowLeft size={16} />
                    </button>
                  </div>
                </motion.div>

                <div className="space-y-6">
                  <motion.div
                    variants={itemVariants}
                    className="text-center md:text-right space-y-2"
                  >
                    <h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white flex items-center justify-center md:justify-start gap-2">
                      <Sparkles size={24} className="text-blue-500" /> تفاعل مع
                      معلمك وتفوق في دراستك
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      كل ما تحتاجه لإدارة واجباتك ومتابعة حصصك في مكان واحد
                      منظم.
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                    <motion.div
                      variants={itemVariants}
                      className="group bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-6 rounded-3xl hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
                    >
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <BookOpen size={24} />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-slate-800 dark:text-white mb-2">
                            Assignments & تسليم الواجبات
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            ارفع حلول الأسايمنت والواجبات الخاصة بك بصيغة PDF أو
                            صور مباشرة للمعلم، وتأكد من وصولها لحسابك بسلام.
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="group bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-6 rounded-3xl hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all"
                    >
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                          <HelpCircle size={24} />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-slate-800 dark:text-white mb-2">
                            Quizzes & الاختبارات
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            شارك في الاختبارات والكويزات الميدانية واختبر
                            استيعابك للمنهج في المواعيد المحددة بدقة.
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="group bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-6 rounded-3xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all"
                    >
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <Video size={24} />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-slate-800 dark:text-white mb-2">
                            Live Classes & الحصص
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            احضر البث المباشر مع معلمك وتابع الحصص المسجلة في أي
                            وقت لتراجع دروسك بكل مروءة وسهولة.
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="group bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-6 rounded-3xl hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all"
                    >
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                          <ShieldCheck size={24} />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-slate-800 dark:text-white mb-2">
                            تواصل وانضمام مباشر
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            انضم لغرف المعلمين بسهولة باستخدام رمز المرور وابق
                            على اتصال دائم بكل تحديثات الفصل الدراسي.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </>
            ) : (
              // 👨‍🏫 واجهة المعلم أو الزائر (باقة Pro والإدارة المتقدمة)
              <>
                <motion.div
                  variants={itemVariants}
                  className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-1 shadow-lg"
                >
                  <div className="bg-slate-900 rounded-[1.4rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>

                    <div className="flex items-center gap-5 z-10 text-right">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                        <Crown size={32} className="text-white" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-2xl font-black text-white">
                            باقة المعلم المحترف (Pro)
                          </h3>
                          <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                            عرض حصري
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm font-medium">
                          امتلك سيستم كامل لإدارة فصولك وطلابك بـ{" "}
                          <span className="text-amber-400 font-bold text-lg mx-1">
                            250 ج.م
                          </span>{" "}
                          فقط لمدة 6 شهور!
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate("/upgrade")}
                      className="w-full md:w-auto bg-white hover:bg-slate-100 text-blue-900 font-black px-8 py-4 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 z-10 hover:scale-105 cursor-pointer whitespace-nowrap"
                    >
                      <Zap size={18} className="text-amber-500" /> اشترك الآن
                      وابدأ
                    </button>
                  </div>
                </motion.div>

                <div className="space-y-6">
                  <motion.div
                    variants={itemVariants}
                    className="text-center md:text-right space-y-2"
                  >
                    <h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white flex items-center justify-center md:justify-start gap-2">
                      <Sparkles size={24} className="text-blue-500" /> قوة
                      المنصة بين إيديك
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      أدوات متطورة صُممت خصيصاً لتسهيل العملية التعليمية وتوفير
                      وقتك.
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                    <motion.div
                      variants={itemVariants}
                      className="group bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-6 rounded-3xl hover:bg-blue-50 dark:hover:bg-blue-500/15 transition-all"
                    >
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <BookOpen size={24} />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-slate-800 dark:text-white mb-2">
                            Assignments & إدارة الواجبات
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            نظام متكامل لرفع ملفات الـ PDF والصور، مع لوحة
                            متابعة دقيقة لتسليمات الطلاب وتقييم الأداء لحظياً.
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="group bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-6 rounded-3xl hover:bg-purple-50 dark:hover:bg-purple-500/15 transition-all"
                    >
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                          <HelpCircle size={24} />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-slate-800 dark:text-white mb-2">
                            Quizzes & الاختبارات
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            قم بإرفاق روابط اختباراتك الذكية وتحديد مواعيد
                            الإغلاق لتتبع نتائج الطلاب واختباراتهم بمرونة.
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="group bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-6 rounded-3xl hover:bg-emerald-50 dark:hover:bg-emerald-500/15 transition-all"
                    >
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <Video size={24} />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-slate-800 dark:text-white mb-2">
                            Live Classes & الحصص
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            إدارة شاملة للبث المباشر والحصص المسجلة ومشاركة
                            الروابط مع الفصول بأعلى كفاءة.
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="group bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-6 rounded-3xl hover:bg-rose-50 dark:hover:bg-rose-500/15 transition-all"
                    >
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                          <ShieldCheck size={24} />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-slate-800 dark:text-white mb-2">
                            Security & حماية المحتوى
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            حماية تامة لمحتواك التعليمي برمز مرور مشفر لكل غرفة
                            دراسية لضمان خصوصية تامة لفصولك.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default LandingFeatures;
