import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

function TeachersSearch() {
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("elemny_user_data");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      if (userData.role === "teacher") {
        navigate("/", { replace: true });
      }
    }
  }, [navigate]);

  const [governorate, setGovernorate] = useState("");
  const [subject, setSubject] = useState("");
  const [area, setArea] = useState("");
  const [searchName, setSearchName] = useState("");

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem("teacherFavorites");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  useEffect(() => {
    localStorage.setItem("teacherFavorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "users"), where("role", "==", "teacher"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const teachersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTeachers(teachersList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching teachers in real-time:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((favId) => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  // دالة الواتساب المضبوطة بالتكنيك الجديد والـ +
  const getWhatsAppUrl = (phone, name) => {
    if (!phone) return "#";
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "20" + cleaned.slice(1);
    } else if (!cleaned.startsWith("20")) {
      cleaned = "20" + cleaned;
    }
    return `https://api.whatsapp.com/send?phone=+${cleaned}&text=${encodeURIComponent(
      `ازيك يا ${name}، أنا شفت بروفايلك على منصة "علمني" وحابب أتفق معاك على درس.`,
    )}`;
  };

  const egyptRegions = {
    القاهرة: [
      "مدينة نصر",
      "مصر الجديدة",
      "المعادي",
      "التجمع الخامس",
      "المهندسين",
      "شبرا",
      "عين شمس",
      "المرج",
    ],
    الجيزة: [
      "الدقي",
      "المهندسين",
      "الشيخ زايد",
      "6 أكتوبر",
      "الهرم",
      "فيصل",
      "إمبابة",
    ],
    الإسكندرية: [
      "سموحة",
      "ميامي",
      "العصافرة",
      "سيدي بشر",
      "المنشية",
      "الإبراهيمية",
    ],
    القليوبية: ["بنها", "شبرا الخيمة", "قليوب", "الخانكة", "قها"],
    الدقهلية: ["المنصورة", "دكرنس", "ميت غمر", "سنبلاوين", "بلقاس"],
    الشرقية: ["زقازيق", "بلبيس", "منيا القمح", "فاقوس", "العصينة"],
    الغربية: ["طنطا", "المحلة الكبرى", "زفتى", "كفر الزيات"],
    المنوفية: ["شبين الكوم", "منوف", "السادات", "قويسنا"],
    البحيرة: ["دمنهور", "كفر الدوار", "رشيد", "إيتاي البارود"],
    بورسعيد: ["الزهور", "المناخ", "الشرق", "بورفؤاد"],
    السويس: ["السويس", "الأربعين", "فيصل", "عتاقة"],
    الإسماعيلية: ["الإسماعيلية", "فايد", "القنطرة غرب", "البلطيم"],
    أسوان: ["أسوان", "كوم أمبو", "إدفو", "أسوان الجديدة"],
    أسيوط: ["أسيوط", "أسيوط الجديدة", "أبو تيج", "منفلوط"],
    الفيوم: ["الفيوم", "الفيوم الجديدة", "سنورس", "إهناسيا"],
    الأقصر: ["الأقصر", "إسنا", "أرمنت"],
    "البحر الأحمر": ["الغردقة", "سفاجا", "رأس غارب", "مرسى علم"],
    "جنوب سيناء": ["شرم الشيخ", "دهب", "نويبع", "طابا"],
    "بني سويف": ["بني سويف", "بني سويف الجديدة", "الواسطى"],
    المنيا: ["المنيا", "المنيا الجديدة", "ملوي", "بني مزار"],
    سوهاج: ["سوهاج", "سوهاج الجديدة", "جهينة", "طما"],
    قنا: ["قنا", "قنا الجديدة", "نجع حمادي", "دشنا"],
    مطروح: ["مرسى مطروح", "الحمام", "العلمين", "سيدي براني"],
    "كفر الشيخ": ["كفر الشيخ", "دسوق", "بيلا", "فوة"],
    دمياط: ["دمياط", "دمياط الجديدة", "رأس البر", "فارسكور"],
    "الوادي الجديد": ["خارجة", "داخلة", "باريس"],
    "شمال سيناء": ["العريش", "بئر العبد", "رفح"],
  };

  const handleGovernorateChange = (e) => {
    setGovernorate(e.target.value);
    setArea("");
  };

  const getTierWeight = (teacher) => {
    const subTier = teacher.subscription?.tier?.toLowerCase() || "free";
    const subStatus = teacher.subscription?.status === "active";
    if (!subStatus) return 0;
    if (subTier === "pro") return 2;
    if (subTier === "standard") return 1;
    return 0;
  };

  const filteredTeachers = teachers
    .filter((t) => {
      return (
        (governorate === "" || t.governorate === governorate) &&
        (subject === "" || t.subject === subject) &&
        (area === "" || (t.area && t.area.includes(area))) &&
        (searchName === "" || (t.name && t.name.includes(searchName)))
      );
    })
    .sort((a, b) => getTierWeight(b) - getTierWeight(a));

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#F8F9FA] dark:bg-gray-950 py-12 px-6 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-navy dark:text-white">
            ابحث عن معلمك المفضل
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm lg:text-base">
            اختر المحافظة والمادة والمنطقة، وأضف معلميك لمفضلتك لتسهيل الوصول
            إليهم.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
              بحث بالاسم
            </label>
            <input
              type="text"
              placeholder="اكتب اسم المعلم..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-navy dark:text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
              المحافظة
            </label>
            <select
              value={governorate}
              onChange={handleGovernorateChange}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-navy dark:text-white focus:outline-none focus:border-primary"
            >
              <option value="">كل المحافظات</option>
              {Object.keys(egyptRegions).map((gov) => (
                <option key={gov} value={gov}>
                  {gov}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
              المنطقة
            </label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              disabled={!governorate}
              className={`w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-navy dark:text-white focus:outline-none focus:border-primary ${
                !governorate ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <option value="">
                {governorate
                  ? "كل مناطق " + governorate
                  : "اختر المحافظة أولاً"}
              </option>
              {governorate &&
                egyptRegions[governorate].map((ar) => (
                  <option key={ar} value={ar}>
                    {ar}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
              المادة الدراسية
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-navy dark:text-white focus:outline-none focus:border-primary"
            >
              <option value="">كل المواد</option>
              <option value="رياضيات">رياضيات</option>
              <option value="فيزياء">فيزياء</option>
              <option value="كيمياء">كيمياء</option>
              <option value="أحياء">أحياء</option>
              <option value="لغة عربية">لغة عربية</option>
              <option value="لغة إنجليزية">لغة إنجليزية</option>
              <option value="لغة فرنسية">لغة فرنسية</option>
              <option value="تاريخ">تاريخ</option>
              <option value="جغرافيا">جغرافيا</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredTeachers.length > 0 ? (
            filteredTeachers.map((teacher) => {
              const isFavorite = favorites.includes(teacher.id);
              const teacherImage =
                teacher.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  teacher.name || "معلم",
                )}&background=2563EB&color=fff&bold=true`;

              const subTier =
                teacher.subscription?.tier?.toLowerCase() || "free";
              const subStatus = teacher.subscription?.status === "active";

              return (
                <div
                  key={teacher.id}
                  className={`bg-white dark:bg-gray-900 rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between space-y-6 relative overflow-hidden ${
                    subTier === "pro" && subStatus
                      ? "border-2 border-purple-500/50 shadow-xl shadow-purple-500/10"
                      : subTier === "standard" && subStatus
                        ? "border-2 border-amber-500/40 shadow-xl shadow-amber-500/10"
                        : "border-gray-200/80 dark:border-gray-800 shadow-sm"
                  }`}
                >
                  {subTier === "pro" && subStatus && (
                    <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-r from-purple-600 via-pink-500 to-primary"></div>
                  )}
                  {subTier === "standard" && subStatus && (
                    <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500"></div>
                  )}

                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={teacherImage}
                        alt={teacher.name}
                        className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-navy dark:text-white text-base">
                            {teacher.name}
                          </h3>
                          {subStatus && subTier === "pro" && (
                            <span className="text-[10px] bg-purple-600 text-white px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                              مميز ومقترح
                            </span>
                          )}
                          {subStatus && subTier === "standard" && (
                            <span className="text-[10px] bg-amber-500 text-white px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                              مميز ومقترح
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
                          {teacher.subject || "معلم مادة"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleFavorite(teacher.id)}
                        className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-lg transition-transform active:scale-90 cursor-pointer shadow-sm"
                        title={
                          isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"
                        }
                      >
                        {isFavorite ? "❤️" : "🤍"}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">
                        المادة:
                      </span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {teacher.subject || "غير محدد"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">
                        المحافظة:
                      </span>
                      <span className="font-bold text-navy dark:text-white">
                        {teacher.governorate || "غير محدد"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">
                        المنطقة:
                      </span>
                      <span className="font-bold text-navy dark:text-white">
                        {teacher.area || "غير محدد"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">
                        وسيلة التدريس:
                      </span>
                      <span className="font-bold text-primary dark:text-blue-400">
                        {teacher.teachingType || "أونلاين وفي البيت"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">
                        سعر الحصة:
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {teacher.price || "غير معلن (حسب الاتفاق)"}
                      </span>
                    </div>

                    {subStatus && subTier === "pro" && (
                      <div className="flex justify-between items-center bg-purple-50/50 dark:bg-purple-950/30 p-2.5 rounded-xl border border-purple-100 dark:border-purple-900/50">
                        <span className="text-purple-700 dark:text-purple-300 font-bold">
                          التقييم العام:
                        </span>
                        <div className="text-amber-500 font-bold text-sm tracking-widest">
                          ⭐⭐⭐⭐⭐
                        </div>
                      </div>
                    )}
                  </div>

                  {teacher.phone ? (
                    <a
                      href={getWhatsAppUrl(teacher.phone, teacher.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>تواصل عبر واتساب</span>
                    </a>
                  ) : (
                    <div className="w-full bg-gray-200 dark:bg-gray-800 text-gray-400 text-center font-bold py-3 rounded-xl text-xs">
                      رقم الواتساب غير مسجل
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800">
              <p className="text-gray-500 dark:text-gray-400 text-base font-semibold">
                عذراً، لا توجد نتائج مطابقة لفلتر البحث حالياً.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeachersSearch;
