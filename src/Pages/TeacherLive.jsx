import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

function TeacherLive() {
  const navigate = useNavigate();
  const [userData] = useState(() => {
    const saved = localStorage.getItem("elemny_user_data");
    return saved ? JSON.parse(saved) : null;
  });

  const [pendingRequests, setPendingRequests] = useState([]);
  const [myLessons, setMyLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states (تم التعديل لـ 4 طلبات في الصفحة كحد أقصى)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Counter offer input state per request id: { [requestId]: price }
  const [counterPrices, setCounterPrices] = useState({});

  const prevPendingCount = useRef(0);

  // التحقق من باقة المدرس الحالية
  const teacherTier = userData?.subscription?.tier || "free";
  const isFree = teacherTier === "free";

  // دالة تنسيق رقم الواتساب بالصيغة المظبوطة بالـ +
  const getWhatsAppUrl = (phone, studentName, subject, lessonTime) => {
    if (!phone) return "#";
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "20" + cleaned.slice(1);
    } else if (!cleaned.startsWith("20")) {
      cleaned = "20" + cleaned;
    }
    return `https://api.whatsapp.com/send?phone=+${cleaned}&text=${encodeURIComponent(
      `أهلاً يا ${studentName}، معك أستاذ ${userData?.name} وموافق على حصة ${subject} في ميعاد (${lessonTime}).`,
    )}`;
  };

  // دالة تشغيل صوت التنبيه
  const playNotificationSound = () => {
    try {
      const audio = new Audio(
        "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
      );
      audio.play().catch(() => {});
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (!userData?.governorate) return;

    const q = query(
      collection(db, "requests"),
      where("governorate", "==", userData.governorate),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allRequests = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // فلترة الطلبات المعلقة وترتيبها من الأحدث للأقدم عشان الجديد يظهر أول واحد
      const pending = allRequests
        .filter(
          (req) =>
            req.status === "pending" &&
            (!userData.subject || req.subject === userData.subject),
        )
        .sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });

      // تشغيل الصوت لو زاد عدد الطلبات المعلقة الجديدة
      if (
        pending.length > prevPendingCount.current &&
        prevPendingCount.current !== 0
      ) {
        playNotificationSound();
      }
      prevPendingCount.current = pending.length;

      const acceptedByMe = allRequests.filter(
        (req) => req.status === "accepted" && req.teacherId === userData.uid,
      );

      setPendingRequests(pending);
      setMyLessons(acceptedByMe);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData]);

  // قبول الطلب مباشرة بالسعر الحالي
  const handleAcceptRequest = async (reqId, currentPrice) => {
    if (!userData) return;
    try {
      await updateDoc(doc(db, "requests", reqId), {
        status: "accepted",
        teacherId: userData.uid,
        teacherName: userData.name,
        teacherPhone: userData.phone,
        teacherPrice: currentPrice,
      });
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  // إرسال عرض سعر جديد (تفاوض) - متاح فقط للباقات المدفوعة
  const handleSendCounterOffer = async (reqId) => {
    if (isFree) {
      navigate("/upgrade");
      return;
    }

    const newPrice = Number(counterPrices[reqId]);
    if (!newPrice || newPrice <= 0) {
      alert("يرجى كتابة سعر صحيح أولاً");
      return;
    }

    try {
      await updateDoc(doc(db, "requests", reqId), {
        status: "negotiating",
        teacherId: userData.uid,
        teacherName: userData.name,
        teacherPhone: userData.phone,
        teacherPrice: newPrice,
      });
    } catch (error) {
      console.error("Error sending counter offer:", error);
    }
  };

  const handleFinishLesson = async (reqId) => {
    try {
      await deleteDoc(doc(db, "requests", reqId));
    } catch (error) {
      console.error("Error finishing lesson:", error);
    }
  };

  // Pagination Logic للطلبات المعلقة (4 في الصفحة)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPendingRequests = pendingRequests.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(pendingRequests.length / itemsPerPage);

  // التأكد من أن الصفحة الحالية لا تتجاوز عدد الصفحات المتاحة لو تم حذف طلبات
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [pendingRequests, currentPage, totalPages]);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#F8F9FA] dark:bg-gray-950 py-12 px-6"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black text-navy dark:text-white">
                مرحباً أستاذ {userData?.name} 👨‍🏫
              </h1>
              {!isFree && (
                <span className="text-xs bg-amber-400 text-white px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                  سريع الرد ⚡
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              لوحة التحكم اللحظية - محافظة {userData?.governorate} | مادة{" "}
              {userData?.subject}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {isFree && (
              <button
                onClick={() => navigate("/upgrade")}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                ✨ ترقية الحساب (فتح التفاوض)
              </button>
            )}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2">
              <span>طلبات متاحة: {pendingRequests.length}</span>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>حصصك المقبولة: {myLessons.length}</span>
            </div>
          </div>
        </div>

        {/* القسم الأول: حصصك النشطة المقبولة */}
        {myLessons.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-navy dark:text-white flex items-center gap-2">
              <span>🟢 حصصك المقبولة (المجدولة والنشطة):</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-3xl p-6 border-2 border-emerald-500/40 shadow-sm space-y-4"
                >
                  <div className="flex justify-between items-start border-b border-emerald-200 dark:border-emerald-900 pb-3">
                    <div>
                      <h3 className="font-extrabold text-navy dark:text-white text-base">
                        الطالب: {lesson.studentName}
                      </h3>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                        {lesson.subject} ({lesson.grade})
                      </p>
                    </div>
                    <span className="text-xs font-bold bg-emerald-600 text-white px-3 py-1 rounded-full">
                      {lesson.teacherPrice || lesson.price} ج.م
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                    <div className="flex justify-between">
                      <span>المكان:</span>
                      <strong className="text-navy dark:text-white">
                        {lesson.governorate} - {lesson.area}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>طريقة التدريس:</span>
                      <strong className="text-navy dark:text-white">
                        {lesson.teachingType}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>رقم تليفون الطالب:</span>
                      <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                        {lesson.studentPhone || "غير مسجل"}
                      </strong>
                    </div>
                    <div className="flex justify-between bg-emerald-100/60 dark:bg-emerald-900/40 p-2.5 rounded-xl">
                      <span className="font-bold text-emerald-900 dark:text-emerald-200">
                        ميعاد الحصة:
                      </span>
                      <strong className="text-emerald-900 dark:text-emerald-200">
                        {lesson.lessonTime}
                      </strong>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <a
                      href={getWhatsAppUrl(
                        lesson.studentPhone,
                        lesson.studentName,
                        lesson.subject,
                        lesson.lessonTime,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs text-center transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>واتساب: {lesson.studentPhone} 💬</span>
                    </a>
                    <button
                      onClick={() => handleFinishLesson(lesson.id)}
                      className="bg-gray-200 hover:bg-red-500 hover:text-white text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-bold px-4 py-3 rounded-xl text-xs transition-all cursor-pointer"
                    >
                      إنهاء الحصة ✅
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* القسم الثاني: الطلبات الجديدة المعلقة مع الباجينيشن */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-navy dark:text-white">
            ⚡ الطلبات اللحظية الجديدة في منطقتك:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-20">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : currentPendingRequests.length > 0 ? (
              currentPendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white dark:bg-gray-900 rounded-3xl p-6 border-2 border-primary/20 shadow-sm space-y-4 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-2 h-full bg-primary"></div>

                  <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-800 pb-3">
                    <div>
                      <h3 className="font-extrabold text-navy dark:text-white text-base">
                        {req.studentName}
                      </h3>
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                        {req.subject} ({req.grade})
                      </p>
                    </div>
                    <span className="text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-100">
                      {req.price} ج.م
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                    <div className="flex justify-between">
                      <span>المكان:</span>
                      <strong className="text-navy dark:text-white">
                        {req.governorate} - {req.area}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>طريقة التدريس:</span>
                      <strong className="text-navy dark:text-white">
                        {req.teachingType}
                      </strong>
                    </div>
                    <div className="flex justify-between bg-blue-50/50 dark:bg-blue-950/30 p-2.5 rounded-xl">
                      <span className="font-bold text-blue-700 dark:text-blue-300">
                        الميعاد المطلوب:
                      </span>
                      <strong className="text-blue-700 dark:text-blue-300">
                        {req.lessonTime}
                      </strong>
                    </div>
                  </div>

                  {/* صندوق التفاوض أو تنبيه الترقية */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2">
                    <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400">
                      اقترح سعراً جديداً (اختياري للتفاوض):
                    </label>
                    {isFree ? (
                      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-3 rounded-xl text-center space-y-2">
                        <p className="text-[11px] text-amber-800 dark:text-amber-300 font-bold">
                          🔒 ميزة التفاوض متاحة للباقات المدفوعة فقط.
                        </p>
                        <button
                          onClick={() => navigate("/upgrade")}
                          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                        >
                          رقّي باقتك لتتمكن من التفاوض 🚀
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder={`السعر الحالي: ${req.price}`}
                          value={counterPrices[req.id] || ""}
                          onChange={(e) =>
                            setCounterPrices({
                              ...counterPrices,
                              [req.id]: e.target.value,
                            })
                          }
                          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-navy dark:text-white"
                        />
                        <button
                          onClick={() => handleSendCounterOffer(req.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-2 rounded-xl text-xs whitespace-nowrap cursor-pointer"
                        >
                          إرسال عرض 💬
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pt-1 flex gap-3">
                    <button
                      onClick={() => handleAcceptRequest(req.id, req.price)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>قبول بالسعر الحالي ({req.price} ج.م) 🟢</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800">
                <p className="text-gray-500 text-sm font-semibold">
                  لا توجد طلبات جديدة معلقة في منطقتك حالياً 📭
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  تابع هذه الشاشة، سيظهر أي طلب جديد لحظياً.
                </p>
              </div>
            )}
          </div>

          {/* الباجينيشن - بيظهر بس لو الطلبات أكتر من 4 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-bold disabled:opacity-50 cursor-pointer shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                السابق
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                        currentPage === page
                          ? "bg-primary text-white shadow-md"
                          : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-bold disabled:opacity-50 cursor-pointer shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                التالي
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherLive;
