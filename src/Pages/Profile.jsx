import React, { useState } from "react";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

function Profile() {
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem("elemny_user_data");
    return saved ? JSON.parse(saved) : {};
  });

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

  const [formData, setFormData] = useState({
    phone: userData.phone || "",
    subject: userData.subject || "رياضيات (عربي)",
    governorate: userData.governorate || "القاهرة",
    area:
      userData.area ||
      (egyptRegions["القاهرة"] ? egyptRegions["القاهرة"][0] : ""),
    teachingType: userData.teachingType || "أونلاين وفي البيت",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGovernorateChange = (e) => {
    const selectedGov = e.target.value;
    setFormData({
      ...formData,
      governorate: selectedGov,
      area: egyptRegions[selectedGov] ? egyptRegions[selectedGov][0] : "",
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const userRef = doc(db, "users", userData.uid);
      await updateDoc(userRef, formData);

      const updatedData = { ...userData, ...formData };
      localStorage.setItem("elemny_user_data", JSON.stringify(updatedData));
      setUserData(updatedData);

      setMessage("✅ تم تحديث بيانات البروفايل بنجاح!");
    } catch (error) {
      console.error(error);
      setMessage("❌ حدث خطأ أثناء التحديث.");
    } finally {
      setLoading(false);
    }
  };

  const tier = userData?.subscription?.tier || "free";
  const subStatus = userData?.subscription?.status || "active";

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-6"
    >
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-primary/30 flex-shrink-0">
            {userData.avatarUrl ? (
              <img
                src={userData.avatarUrl}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">
                👨‍🏫
              </div>
            )}
          </div>
          <div className="text-center sm:text-right space-y-1">
            <h1 className="text-2xl font-black text-navy dark:text-white">
              {userData.name}
            </h1>
            <p className="text-xs text-gray-500">
              {userData.email} | {userData.role === "teacher" ? "معلم" : "طالب"}
            </p>
            <div className="pt-2 flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs bg-primary/10 text-primary font-bold px-3 py-1 rounded-full">
                الباقة الحالية: {tier.toUpperCase()} (
                {subStatus === "pending" ? "قيد المراجعة ⏳" : "نشطة ✅"})
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-extrabold text-navy dark:text-white">
            تعديل بيانات الحساب
          </h2>
          {message && (
            <div className="p-3 rounded-xl text-xs font-bold bg-blue-50 text-blue-600 text-center">
              {message}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                الاسم الكامل
              </label>
              <input
                type="text"
                value={userData.name || ""}
                disabled
                className="w-full bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-400 cursor-not-allowed"
              />
            </div>

            {userData.role === "teacher" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                    رقم الواتساب
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-navy dark:text-white outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                    المادة الدراسية
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-navy dark:text-white outline-none focus:border-primary"
                  >
                    <optgroup label="القرآن الكريم والشرعيات">
                      <option value="تحفيظ قرآن وتجويد">
                        تحفيظ قرآن وتجويد
                      </option>
                      <option value="تربية إسلامية">تربية إسلامية</option>
                    </optgroup>
                    <optgroup label="مراحل التأسيس والمهارات">
                      <option value="تأسيس مبكر وقراءة وكتابة">
                        تأسيس مبكر (قراءة وكتابة)
                      </option>
                      <option value="تأسيس لغة إنجليزية (Phonics)">
                        تأسيس لغة إنجليزية (Phonics)
                      </option>
                      <option value="تأسيس رياضيات وحساب">
                        تأسيس رياضيات وحساب
                      </option>
                    </optgroup>
                    <optgroup label="رياضيات">
                      <option value="رياضيات (عربي)">رياضيات (عربي)</option>
                      <option value="رياضيات (لغات)">
                        رياضيات (لغات - Math)
                      </option>
                    </optgroup>
                    <optgroup label="العلوم والفيزياء والكيمياء والأحياء">
                      <option value="علوم (عربي)">علوم (عربي)</option>
                      <option value="علوم (لغات)">علوم (لغات - Science)</option>
                      <option value="فيزياء (عربي)">فيزياء (عربي)</option>
                      <option value="فيزياء (لغات)">
                        فيزياء (لغات - Physics)
                      </option>
                      <option value="كيمياء (عربي)">كيمياء (عربي)</option>
                      <option value="كيمياء (لغات)">
                        كيمياء (لغات - Chemistry)
                      </option>
                      <option value="أحياء (عربي)">أحياء (عربي)</option>
                      <option value="أحياء (لغات)">
                        أحياء (لغات - Biology)
                      </option>
                      <option value="جيولوجيا">جيولوجيا</option>
                    </optgroup>
                    <optgroup label="اللغات">
                      <option value="لغة عربية">لغة عربية</option>
                      <option value="لغة إنجليزية">
                        لغة إنجليزية (English)
                      </option>
                      <option value="لغة فرنسية">لغة فرنسية (Français)</option>
                      <option value="لغة ألمانية">لغة ألمانية (Deutsch)</option>
                    </optgroup>
                    <optgroup label="المواد الأدبية">
                      <option value="تاريخ">تاريخ</option>
                      <option value="جغرافيا">جغرافيا</option>
                      <option value="فلسفة ومنطق">فلسفة ومنطق</option>
                      <option value="علم نفس واجتماع">علم نفس واجتماع</option>
                      <option value="دراسات اجتماعية">دراسات اجتماعية</option>
                    </optgroup>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                      المحافظة
                    </label>
                    <select
                      name="governorate"
                      value={formData.governorate}
                      onChange={handleGovernorateChange}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-navy dark:text-white outline-none focus:border-primary"
                    >
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
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-navy dark:text-white outline-none focus:border-primary"
                    >
                      {egyptRegions[formData.governorate]?.map((ar) => (
                        <option key={ar} value={ar}>
                          {ar}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md cursor-pointer"
            >
              {loading ? "جاري الحفظ..." : "حفظ التعديلات ✅"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
