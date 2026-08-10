import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

function StudentRequest() {
  const navigate = useNavigate();
  const [userData] = useState(() => {
    const saved = localStorage.getItem("elemny_user_data");
    return saved ? JSON.parse(saved) : null;
  });

  const [subject, setSubject] = useState("رياضيات");
  const [grade, setGrade] = useState("أولى ثانوي");
  const [governorate, setGovernorate] = useState(
    userData?.governorate || "القاهرة",
  );
  const [area, setArea] = useState("");
  const [teachingType, setTeachingType] = useState("أونلاين وفي البيت");
  const [studentPhone, setStudentPhone] = useState(userData?.phone || "");

  const [lessonTimeType, setLessonTimeType] = useState("الآن (فوراً)");
  const [customTime, setCustomTime] = useState("");
  const [price, setPrice] = useState(100);

  const [activeRequest, setActiveRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 دقائق (300 ثانية)

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

  useEffect(() => {
    if (!userData?.uid) return;

    const q = query(
      collection(db, "requests"),
      where("studentId", "==", userData.uid),
      where("status", "in", ["pending", "accepted", "negotiating"]),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const reqData = { id: docSnap.id, ...docSnap.data() };
        setActiveRequest(reqData);

        // حساب الوقت المتبقي بناءً على وقت الإنشاء الحقيقي في الفايربيز لمنع إعادة ضبطه عند الـ Refresh
        if (reqData.createdAt && reqData.createdAt.toMillis) {
          const createdMillis = reqData.createdAt.toMillis();
          const elapsedSeconds = Math.floor(
            (Date.now() - createdMillis) / 1000,
          );
          const remaining = Math.max(0, 300 - elapsedSeconds);
          setTimeLeft(remaining);

          // لو الوقت خلص فعلاً وقت الـ refresh، احذف الطلب فوراً
          if (remaining <= 0 && reqData.status === "pending") {
            handleCancelRequest(docSnap.id);
          }
        } else {
          setTimeLeft(300);
        }
      } else {
        setActiveRequest(null);
      }
    });

    return () => unsubscribe();
  }, [userData]);

  // عداد الـ 5 دقائق التنازلي
  useEffect(() => {
    if (!activeRequest || activeRequest.status !== "pending") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleCancelRequest(activeRequest.id); // حذف الطلب تلقائياً لو خلص الوقت
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeRequest]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!userData) return;

    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(studentPhone)) {
      alert(
        "يرجى إدخال رقم واتساب مصري صحيح مكون من 11 رقماً (مثال: 01012345678)",
      );
      return;
    }

    setLoading(true);

    try {
      const finalLessonTime =
        lessonTimeType === "محدد بوقت" ? customTime : lessonTimeType;

      const newReq = {
        studentId: userData.uid,
        studentName: userData.name,
        studentEmail: userData.email,
        studentPhone: studentPhone,
        subject,
        grade,
        governorate,
        area: area || "كل المناطق",
        teachingType,
        lessonTime: finalLessonTime,
        price: Number(price),
        status: "pending",
        teacherId: null,
        teacherName: null,
        teacherPhone: null,
        teacherPrice: null,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "requests"), newReq);
      setLoading(false);
    } catch (error) {
      console.error("Error creating request:", error);
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await deleteDoc(doc(db, "requests", requestId));
      setActiveRequest(null);
    } catch (error) {
      console.error("Error canceling request:", error);
    }
  };

  // موافقة الطالب على سعر المدرس المقترح (التفاوض)
  const handleAcceptCounterOffer = async (reqId, teacherPrice) => {
    try {
      await updateDoc(doc(db, "requests", reqId), {
        price: teacherPrice,
        status: "accepted",
      });
    } catch (error) {
      console.error("Error accepting counter offer:", error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#F8F9FA] dark:bg-gray-950 py-12 px-6"
    >
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-navy dark:text-white">
            اطلب حصتك اللحظية 🚀
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            حدد طلبك، رقمك، وميعاد الحصة، وسيتم إرسال الطلب للمعلمين فوراً.
          </p>
        </div>

        {activeRequest ? (
          <div className="bg-white dark:bg-gray-900 border-2 border-primary/40 rounded-3xl p-6 shadow-xl space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full">
                  ⚡ طلبك جاري البحث عن معلمين...
                </span>
                {activeRequest.status === "pending" && (
                  <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/50 px-2.5 py-1 rounded-full">
                    ⏳ ينتهي خلال: {formatTime(timeLeft)}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleCancelRequest(activeRequest.id)}
                className="text-red-500 text-xs font-bold hover:underline cursor-pointer"
              >
                إلغاء الطلب ❌
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                <span className="text-gray-400">المادة والصف:</span>{" "}
                <strong className="text-navy dark:text-white">
                  {activeRequest.subject} ({activeRequest.grade})
                </strong>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                <span className="text-gray-400">السعر المقترح:</span>{" "}
                <strong className="text-emerald-600">
                  {activeRequest.price} ج.م
                </strong>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                <span className="text-gray-400">المكان:</span>{" "}
                <strong className="text-navy dark:text-white">
                  {activeRequest.governorate} - {activeRequest.area}
                </strong>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                <span className="text-gray-400">رقمك للتواصل:</span>{" "}
                <strong className="text-navy dark:text-white">
                  {activeRequest.studentPhone}
                </strong>
              </div>
            </div>

            {/* حالة التفاوض (المدرس اقترح سعر جديد) */}
            {activeRequest.status === "negotiating" ? (
              <div className="bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900 p-4 rounded-2xl space-y-3">
                <h4 className="font-bold text-purple-800 dark:text-purple-300 text-sm">
                  💬 عرض سعر جديد من المعلم: {activeRequest.teacherName}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  اقترح المعلم سعراً جديداً للحصة:{" "}
                  <strong className="text-emerald-600 font-black text-sm">
                    {activeRequest.teacherPrice} ج.م
                  </strong>{" "}
                  (بدلاً من {activeRequest.price} ج.م)
                </p>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() =>
                      handleAcceptCounterOffer(
                        activeRequest.id,
                        activeRequest.teacherPrice,
                      )
                    }
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs text-center shadow-sm cursor-pointer"
                  >
                    موافقة على السعر الجديد ✅
                  </button>
                  <button
                    onClick={() => handleCancelRequest(activeRequest.id)}
                    className="bg-gray-200 hover:bg-red-500 hover:text-white text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer"
                  >
                    رفض ❌
                  </button>
                </div>
              </div>
            ) : activeRequest.status === "accepted" ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 p-4 rounded-2xl space-y-3">
                <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                  🎉 وافق المعلم: {activeRequest.teacherName}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  السعر المتفق عليه:{" "}
                  <strong className="text-emerald-600">
                    {activeRequest.teacherPrice || activeRequest.price} ج.م
                  </strong>
                </p>

                <div className="flex gap-3 pt-2">
                  <a
                    href={`https://wa.me/${activeRequest.teacherPhone}?text=${encodeURIComponent(
                      `أهلاً يا أستاذ ${activeRequest.teacherName}، أنا ${activeRequest.studentName} ووافقت على طلب الحصة في ميعاد (${activeRequest.lessonTime}) على منصة علمني.`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs text-center shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>تواصل عبر الواتساب 💬</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-gray-500">
                  في انتظار قبول معلم أو تقديم عرض سعر في نطاقك...
                </p>
              </div>
            )}
          </div>
        ) : (
          <form
            onSubmit={handleCreateRequest}
            className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                  المادة الدراسية
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-navy dark:text-white"
                >
                  <optgroup label="المواد العلمية">
                    <option value="رياضيات">رياضيات</option>
                    <option value="فيزياء">فيزياء</option>
                    <option value="كيمياء">كيمياء</option>
                    <option value="أحياء">أحياء</option>
                    <option value="علوم">علوم</option>
                  </optgroup>
                  <optgroup label="اللغات">
                    <option value="لغة عربية">لغة عربية</option>
                    <option value="لغة إنجليزية">لغة إنجليزية</option>
                    <option value="لغة فرنسية">لغة فرنسية</option>
                  </optgroup>
                  <optgroup label="المواد الأدبية">
                    <option value="تاريخ">تاريخ</option>
                    <option value="جغرافيا">جغرافيا</option>
                    <option value="فلسفة">فلسفة</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                  الصف الدراسي
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-navy dark:text-white"
                >
                  <optgroup label="المرحلة الابتدائية">
                    <option value="رابعة ابتدائي">رابعة ابتدائي</option>
                    <option value="خامسة ابتدائي">خامسة ابتدائي</option>
                    <option value="سادسة ابتدائي">سادسة ابتدائي</option>
                  </optgroup>
                  <optgroup label="المرحلة الإعدادية">
                    <option value="أولى إعدادي">أولى إعدادي</option>
                    <option value="تانية إعدادي">تانية إعدادي</option>
                    <option value="تالتة إعدادي">تالتة إعدادي</option>
                  </optgroup>
                  <optgroup label="المرحلة الثانوية">
                    <option value="أولى ثانوي">أولى ثانوي</option>
                    <option value="تانية ثانوي">تانية ثانوي</option>
                    <option value="تالتة ثانوي">تالتة ثانوي</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                  المحافظة
                </label>
                <select
                  value={governorate}
                  onChange={(e) => {
                    setGovernorate(e.target.value);
                    setArea("");
                  }}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-navy dark:text-white"
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
                  المنطقة أو الحي
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  required
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-navy dark:text-white"
                >
                  <option value="">اختر المنطقة...</option>
                  {egyptRegions[governorate]?.map((ar) => (
                    <option key={ar} value={ar}>
                      {ar}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                  رقم الواتساب للتواصل
                </label>
                <input
                  type="text"
                  required
                  placeholder="01012345678"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-navy dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                  ميعاد الحصة المطلوب
                </label>
                <select
                  value={lessonTimeType}
                  onChange={(e) => setLessonTimeType(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-navy dark:text-white"
                >
                  <option value="الآن (فوراً)">الآن (فوراً ⚡)</option>
                  <option value="اليوم خلال ساعات">اليوم خلال ساعات</option>
                  <option value="غداً صباحاً">غداً صباحاً</option>
                  <option value="غداً مساءً">غداً مساءً</option>
                  <option value="محدد بوقت">موعد مخصص...</option>
                </select>
              </div>
            </div>

            {lessonTimeType === "محدد بوقت" && (
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                  اكتب التاريخ والوقت بدقة (مثال: الثلاثاء الساعة 8 مساءً)
                </label>
                <input
                  type="text"
                  required
                  placeholder="اكتب الميعاد هنا..."
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-navy dark:text-white"
                />
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 text-center space-y-3">
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300">
                حدد السعر المقترح للحصة (بالجنيه المصري)
              </label>
              <div className="flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={() => setPrice((p) => Math.max(50, p - 10))}
                  className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xl font-bold text-primary shadow-sm active:scale-95 cursor-pointer"
                >
                  -
                </button>
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {price} <span className="text-xs font-normal">ج.م</span>
                </span>
                <button
                  type="button"
                  onClick={() => setPrice((p) => p + 10)}
                  className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xl font-bold text-primary shadow-sm active:scale-95 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all text-sm cursor-pointer"
            >
              {loading
                ? "جاري الإرسال..."
                : "ابحث عن معلم ونشر الطلب اللحظي 🚀"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default StudentRequest;
