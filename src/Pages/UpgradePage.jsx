import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ShieldCheck, X, Clock, Calendar } from "lucide-react";

function UpgradePage() {
  const navigate = useNavigate();

  // جلب بيانات المستخدم من الـ LocalStorage
  const userData = JSON.parse(localStorage.getItem("elemny_user_data") || "{}");
  const currentTier = (userData?.subscription?.tier || "free").toLowerCase();

  // تدرج المستويات للمقارنة (0 أقل، 2 أعلى)
  const tierWeights = { free: 0, standard: 1, pro: 2 };
  const userWeight = tierWeights[currentTier] ?? 0;

  // حالة Modal تفاصيل الاشتراك الحالي
  const [showModal, setShowModal] = useState(false);

  const plans = [
    {
      name: "Free",
      rawName: "free",
      price: "مجاناً",
      rawPrice: "0",
      period: "للأبد",
      features: [
        "إنشاء بروفايل مدرس",
        "استقبال طلبات لايف",
        "الظهور في نتائج البحث",
      ],
      color: "gray",
    },
    {
      name: "Standard",
      rawName: "standard",
      price: "100 ج.م",
      rawPrice: "100",
      period: "في السنة",
      features: [
        "كل مميزات الفري",
        "إمكانية التفاوض على السعر",
        "شارة 'سريع الرد'",
      ],
      color: "blue",
    },
    {
      name: "Pro",
      rawName: "pro",
      price: "250 ج.م",
      rawPrice: "250",
      period: "في السنة",
      features: [
        "كل مميزات ستاندرد",
        "الظهور في واجهة الموقع",
        "أولوية قصوى في البحث",
      ],
      color: "purple",
    },
  ];

  const handleAction = (plan) => {
    const planWeight = tierWeights[plan.rawName];

    if (planWeight === userWeight) {
      // لو ضغط على باقته الحالية، يفتح له تفاصيل الاشتراك والتوقيت
      setShowModal(true);
    } else if (planWeight > userWeight) {
      // لو باقة أعلى، يوجهه لصفحة الدفع
      navigate(`/subscribe?plan=${plan.name}&price=${plan.rawPrice}`);
    }
  };

  // تنسيق التاريخ والوقت بشكل جميل
  const formatDate = (isoString) => {
    if (!isoString) return "غير متوفر";
    const date = new Date(isoString);
    return date.toLocaleString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16 px-6 relative"
    >
      <div className="max-w-6xl mx-auto text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-black text-navy dark:text-white">
          اختر الباقة المناسبة لمستوى شغلك
        </h2>
        <p className="text-gray-500 mb-12">
          حالتك الحالية مفعلة على باقة:{" "}
          <strong className="text-primary uppercase">{currentTier}</strong>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const planWeight = tierWeights[plan.rawName];
            const isCurrent = planWeight === userWeight;
            const isLower = planWeight < userWeight;

            return (
              <div
                key={plan.name}
                className={`bg-white dark:bg-gray-900 rounded-3xl p-8 border-2 ${
                  isCurrent
                    ? "border-emerald-500 shadow-xl shadow-emerald-500/10"
                    : plan.color === "purple"
                      ? "border-purple-500 shadow-xl shadow-purple-500/10"
                      : "border-gray-200 dark:border-gray-800"
                } transition-all flex flex-col justify-between`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-gray-500">
                      {plan.name}
                    </h3>
                    {isCurrent && (
                      <span className="text-[10px] bg-emerald-500 text-white px-2.5 py-1 rounded-full font-bold">
                        باقفتك الحالية ✨
                      </span>
                    )}
                  </div>

                  <div className="text-4xl font-black text-navy dark:text-white mb-1">
                    {plan.price}
                  </div>
                  <p className="text-sm text-gray-400 mb-6">{plan.period}</p>

                  <ul className="space-y-4 mb-8 text-right">
                    {plan.features.map((feat, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300"
                      >
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleAction(plan)}
                  disabled={isLower}
                  className={`w-full py-4 rounded-xl font-bold transition-all ${
                    isLower
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed opacity-60"
                      : isCurrent
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 cursor-pointer"
                        : "bg-primary hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 cursor-pointer"
                  }`}
                >
                  {isLower
                    ? "غير متاح (تمتلك باقة أعلى)"
                    : isCurrent
                      ? "عرض تفاصيل اشتراكي 📋"
                      : "ترقية الباقة الآن 🚀"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal تفاصيل الاشتراك الحالي بالساعة والتاريخ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 max-w-md w-full space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 dark:hover:text-white bg-gray-100 dark:bg-gray-800 p-2 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto text-xl">
                🛡️
              </div>
              <h3 className="text-xl font-black text-navy dark:text-white">
                تفاصيل اشتراكك الحالي
              </h3>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                باقة {currentTier}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" /> تاريخ التفعيل:
                </span>
                <strong className="text-navy dark:text-white font-mono">
                  {formatDate(
                    userData?.subscription?.startDate || userData?.createdAt,
                  )}
                </strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" /> تاريخ الانتهاء:
                </span>
                <strong className="text-navy dark:text-white font-mono">
                  {userData?.subscription?.expiryDate
                    ? formatDate(userData.subscription.expiryDate)
                    : "صالح مدى الحياة / غير محدود"}
                </strong>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-500">حالة الحساب:</span>
                <span className="bg-emerald-500/10 text-emerald-500 font-bold px-2.5 py-0.5 rounded-full">
                  نشط ويعمل بكفاءة ✅
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 text-white font-bold py-3 rounded-xl text-xs transition-all"
            >
              إغلاق النافذة
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UpgradePage;
