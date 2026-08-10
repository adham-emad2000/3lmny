import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ChevronLeft, ChevronRight, ShieldCheck, Zap } from "lucide-react";

function Subscribe() {
  const [searchParams] = useSearchParams();
  const planName = searchParams.get("plan") || "Standard";
  const planPrice = searchParams.get("price") || "100";
  const navigate = useNavigate();

  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      title: "استقبال الطلبات اللحظية فوراً",
      desc: "سيظهر اسمك فوراً لكل الطلاب الباحثين في نطاقك.",
      image:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80",
    },
    {
      title: "نظام التفاوض الذكي على السعر",
      desc: "اقترح سعرك الخاص وتحكم في أرباحك بكل سهولة.",
      image:
        "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&auto=format&fit=crop&q=80",
    },
    {
      title: "شارة 'سريع الرد' والمصداقية",
      desc: "تمييز خاص يضعك في قمة ترشيحات الطلاب.",
      image:
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80",
    },
  ];

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);

  const userData = JSON.parse(localStorage.getItem("elemny_user_data") || "{}");

  // تفعيل البرومو كود (uwk100 أو uwk200)
  const handleApplyPromo = async (e) => {
    e.preventDefault();
    const code = promoCode.trim().toLowerCase();

    let targetTier = "";
    if (code === "uwk100") targetTier = "standard";
    if (code === "uwk200") targetTier = "pro";

    if (targetTier) {
      setLoading(true);
      try {
        const userRef = doc(db, "users", userData.uid);
        const updatedSubscription = {
          tier: targetTier,
          status: "active",
          startDate: new Date().toISOString(),
          expiryDate: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        };

        await updateDoc(userRef, { subscription: updatedSubscription });
        userData.subscription = updatedSubscription;
        localStorage.setItem("elemny_user_data", JSON.stringify(userData));

        alert(
          `🎉 تم تفعيل باقة ${targetTier.toUpperCase()} بنجاح عبر البرومو كود!`,
        );
        navigate("/", { replace: true });
      } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء تفعيل البرومو.");
      } finally {
        setLoading(false);
      }
    } else {
      setPromoMessage("❌ برومو كود غير صحيح.");
    }
  };

  // رفع الإيصال اليدوي (Pending)
  const handleManualPayment = async (e) => {
    e.preventDefault();
    if (!screenshot) {
      alert("يرجى إرفاق صورة إيصال التحويل أولاً.");
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(screenshot);
      reader.onload = async () => {
        const base64Image = reader.result;
        const userRef = doc(db, "users", userData.uid);

        const updatedSubscription = {
          tier: planName.toLowerCase(),
          status: "pending", // قيد المراجعة حتى يوافق الأدمن
          paymentReceipt: base64Image,
          requestedAt: new Date().toISOString(),
        };

        await updateDoc(userRef, { subscription: updatedSubscription });
        userData.subscription = updatedSubscription;
        localStorage.setItem("elemny_user_data", JSON.stringify(userData));

        alert(
          "✅ تم إرسال إيصال الدفع بنجاح! سيتم مراجعته وتفعيل حسابك قريباً.",
        );
        navigate("/", { replace: true });
      };
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء رفع الإيصال.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#0f1015] text-white py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="bg-primary/20 text-blue-400 text-xs font-bold px-3.5 py-1.5 rounded-full border border-primary/30">
            ⭐ صفحة إتمام الاشتراك الفاخرة
          </span>
          <h1 className="text-3xl md:text-4xl font-black">
            تفعيل باقة <span className="text-primary">{planName}</span>
          </h1>
          <p className="text-gray-400 text-sm">
            التكلفة:{" "}
            <strong className="text-emerald-400 text-lg">
              {planPrice} جنيه
            </strong>
          </p>
        </div>

        {/* Carousel */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold text-amber-400 bg-amber-950/50 px-3 py-1 rounded-full border border-amber-900">
                مميزات الباقة
              </span>
              <h3 className="text-2xl font-black">
                {slides[currentSlide].title}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {slides[currentSlide].desc}
              </p>
            </div>
            <div className="relative h-48 md:h-60 rounded-2xl overflow-hidden border border-gray-800">
              <img
                src={slides[currentSlide].image}
                alt="feature"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-800">
            <button
              onClick={prevSlide}
              className="bg-gray-800 hover:bg-gray-700 p-2.5 rounded-xl text-white font-bold flex items-center gap-1 text-xs"
            >
              <ChevronRight className="w-4 h-4" /> السابق
            </button>
            <div className="flex gap-1.5">
              {slides.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${currentSlide === idx ? "bg-primary w-6" : "bg-gray-700"}`}
                ></span>
              ))}
            </div>
            <button
              onClick={nextSlide}
              className="bg-gray-800 hover:bg-gray-700 p-2.5 rounded-xl text-white font-bold flex items-center gap-1 text-xs"
            >
              التالي <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Promo Code */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
          <h3 className="text-lg font-extrabold flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" /> برومو كود التفعيل الفوري
          </h3>
          <form onSubmit={handleApplyPromo} className="flex gap-3">
            <input
              type="text"
              placeholder="اكتب الكود (uwk100 أو uwk200)"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-xs transition-all"
            >
              تفعيل فوري 🚀
            </button>
          </form>
          {promoMessage && (
            <p className="text-xs text-red-400 font-bold">{promoMessage}</p>
          )}
        </div>

        {/* Manual Payment */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
          <h3 className="text-lg font-extrabold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> الدفع اليدوي
            ورفع الإيصال
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 space-y-1">
              <span className="text-xs text-gray-400">
                إنستا باي (InstaPay):
              </span>
              <p className="text-emerald-400 font-mono font-black text-base">
                01014441277
              </p>
            </div>
            <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 space-y-1">
              <span className="text-xs text-gray-400">فودافون كاش:</span>
              <p className="text-red-400 font-mono font-black text-base">
                01009721205
              </p>
            </div>
          </div>
          <form onSubmit={handleManualPayment} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-2">
                ارفع اسكرين شوت إيصال التحويل:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setScreenshot(e.target.files[0])}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-gray-300 cursor-pointer"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl text-sm transition-all shadow-lg"
            >
              {loading ? "جاري الإرسال..." : "إرسال الإيصال للأدمن للمراجعة ✅"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Subscribe;
