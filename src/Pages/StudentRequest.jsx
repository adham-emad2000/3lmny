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
  const [timeLeft, setTimeLeft] = useState(300);

  // دالة لتنظيف الرقم وتنسيقه للواتساب
  const getWhatsAppUrl = (phone, teacherName, studentName, lessonTime) => {
    if (!phone) return "#";
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "20" + cleaned.slice(1);
    } else if (!cleaned.startsWith("20")) {
      cleaned = "20" + cleaned;
    }
    return `https://wa.me/${cleaned}?text=${encodeURIComponent(
      `أهلاً يا أستاذ ${teacherName}، أنا ${studentName} ووافقت على طلب الحصة في ميعاد (${lessonTime}) على منصة علمني.`,
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
        if (reqData.createdAt && reqData.createdAt.toMillis) {
          const elapsedSeconds = Math.floor(
            (Date.now() - reqData.createdAt.toMillis()) / 1000,
          );
          setTimeLeft(Math.max(0, 300 - elapsedSeconds));
        }
      } else {
        setActiveRequest(null);
      }
    });
    return () => unsubscribe();
  }, [userData]);

  useEffect(() => {
    if (!activeRequest || activeRequest.status !== "pending") return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleCancelRequest(activeRequest.id);
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
      alert("يرجى إدخال رقم واتساب مصري صحيح (11 رقم)");
      return;
    }
    setLoading(true);
    try {
      const finalLessonTime =
        lessonTimeType === "محدد بوقت" ? customTime : lessonTimeType;
      await addDoc(collection(db, "requests"), {
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
        createdAt: serverTimestamp(),
      });
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await deleteDoc(doc(db, "requests", requestId));
      setActiveRequest(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAcceptCounterOffer = async (reqId, teacherPrice) => {
    try {
      await updateDoc(doc(db, "requests", reqId), {
        price: teacherPrice,
        status: "accepted",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const formatTime = (seconds) =>
    `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#F8F9FA] dark:bg-gray-950 py-12 px-6"
    >
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-extrabold text-center text-navy dark:text-white">
          اطلب حصتك اللحظية 🚀
        </h1>

        {activeRequest ? (
          <div className="bg-white dark:bg-gray-900 border-2 border-primary/40 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
                ⚡ جاري البحث عن معلمين...
              </span>
              {activeRequest.status === "pending" && (
                <span className="text-xs font-bold text-red-500">
                  ⏳ ينتهي خلال: {formatTime(timeLeft)}
                </span>
              )}
            </div>

            {activeRequest.status === "negotiating" ? (
              <div className="bg-purple-50 p-4 rounded-2xl space-y-3">
                <h4 className="font-bold text-sm">
                  💬 عرض سعر جديد من {activeRequest.teacherName}:{" "}
                  {activeRequest.teacherPrice} ج.م
                </h4>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      handleAcceptCounterOffer(
                        activeRequest.id,
                        activeRequest.teacherPrice,
                      )
                    }
                    className="flex-1 bg-emerald-600 text-white font-bold py-2 rounded-xl text-xs"
                  >
                    موافقة ✅
                  </button>
                  <button
                    onClick={() => handleCancelRequest(activeRequest.id)}
                    className="bg-gray-200 py-2 rounded-xl text-xs font-bold px-4"
                  >
                    رفض ❌
                  </button>
                </div>
              </div>
            ) : activeRequest.status === "accepted" ? (
              <div className="bg-emerald-50 p-4 rounded-2xl space-y-3">
                <h4 className="font-bold text-sm text-emerald-800">
                  🎉 وافق المعلم: {activeRequest.teacherName}
                </h4>
                <a
                  href={getWhatsAppUrl(
                    activeRequest.teacherPhone,
                    activeRequest.teacherName,
                    activeRequest.studentName,
                    activeRequest.lessonTime,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full bg-emerald-600 text-white font-bold py-3 rounded-xl text-xs text-center"
                >
                  تواصل عبر واتساب 💬
                </a>
              </div>
            ) : (
              <div className="text-center py-8">جاري البحث...</div>
            )}
          </div>
        ) : (
          <form
            onSubmit={handleCreateRequest}
            className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6"
          >
            {/* Form Fields - Same as before */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm"
              >
                <option value="رياضيات">رياضيات</option>
                <option value="فيزياء">فيزياء</option>
                <option value="كيمياء">كيمياء</option>
              </select>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm"
              >
                <option value="أولى ثانوي">أولى ثانوي</option>
                <option value="تانية ثانوي">تانية ثانوي</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-4 rounded-2xl"
            >
              {loading ? "جاري الإرسال..." : "ابحث عن معلم 🚀"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default StudentRequest;
