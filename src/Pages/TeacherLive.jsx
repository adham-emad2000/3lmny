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
  const [counterPrices, setCounterPrices] = useState({});
  const prevPendingCount = useRef(0);

  // دالة تنسيق رقم الواتساب وإضافة علامة الـ + وكود مصر
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
    if (!userData?.governorate) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "requests"),
      where("governorate", "==", userData.governorate),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allRequests = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      const pending = allRequests.filter(
        (req) =>
          req.status === "pending" &&
          (!userData.subject || req.subject === userData.subject),
      );

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

  const handleAcceptRequest = async (reqId, currentPrice) => {
    try {
      await updateDoc(doc(db, "requests", reqId), {
        status: "accepted",
        teacherId: userData.uid,
        teacherName: userData.name,
        teacherPhone: userData.phone,
        teacherPrice: currentPrice,
      });
    } catch (error) {
      alert("حدث خطأ أثناء القبول.");
    }
  };

  const handleFinishLesson = async (reqId) => {
    if (!window.confirm("إنهاء الحصة؟")) return;
    try {
      await deleteDoc(doc(db, "requests", reqId));
    } catch (error) {
      alert("حدث خطأ.");
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
          <h1 className="text-xl font-bold">مرحباً أستاذ {userData?.name}</h1>
          <div className="text-sm font-bold bg-blue-100 text-blue-700 px-4 py-2 rounded-xl">
            طلبات متاحة: {pendingRequests.length}
          </div>
        </div>

        {myLessons.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-700">🟢 حصصك المقبولة:</h2>
            {myLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold">
                    {lesson.studentName} - {lesson.subject}
                  </h3>
                  <p className="text-xs text-gray-500">{lesson.lessonTime}</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={getWhatsAppUrl(
                      lesson.studentPhone,
                      lesson.studentName,
                      lesson.subject,
                      lesson.lessonTime,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
                  >
                    واتساب
                  </a>
                  <button
                    onClick={() => handleFinishLesson(lesson.id)}
                    className="bg-gray-200 px-4 py-2 rounded-lg text-sm font-bold"
                  >
                    إنهاء
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4">
          <h2 className="font-bold text-gray-700">⚡ طلبات جديدة:</h2>
          {loading ? (
            <p>جاري التحميل...</p>
          ) : pendingRequests.length === 0 ? (
            <p>لا توجد طلبات حالياً.</p>
          ) : (
            pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold">{req.studentName}</h3>
                  <p className="text-xs text-gray-500">
                    {req.subject} | {req.price} ج.م
                  </p>
                </div>
                <button
                  onClick={() => handleAcceptRequest(req.id, req.price)}
                  className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold cursor-pointer"
                >
                  قبول
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherLive;
