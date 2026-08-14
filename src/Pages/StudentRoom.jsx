import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  BookOpen,
  HelpCircle,
  Video,
  Upload,
  ExternalLink,
  Clock,
  ArrowRight,
  Loader2,
  Bell,
  Sparkles,
  Download,
} from "lucide-react";

function StudentRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("assignments");

  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [classes, setClasses] = useState([]);

  const [submittingId, setSubmittingId] = useState(null);
  const [studentFileUrl, setStudentFileUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submittedAssignmentIds, setSubmittedAssignmentIds] = useState([]);

  const [showNotifications, setShowNotifications] = useState(false);

  const userData = JSON.parse(localStorage.getItem("elemny_user_data") || "{}");
  const studentName = userData.name || "طالب";
  const studentUid = userData.uid;

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const docRef = doc(db, "rooms", roomId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setRoom(docSnap.data());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [roomId]);

  useEffect(() => {
    const unsubAssignments = onSnapshot(
      query(
        collection(db, "rooms", roomId, "assignments"),
        orderBy("createdAt", "desc"),
      ),
      (snap) =>
        setAssignments(
          snap.docs.map((d) => ({ id: d.id, type: "assignment", ...d.data() })),
        ),
    );

    const unsubQuizzes = onSnapshot(
      query(
        collection(db, "rooms", roomId, "quizzes"),
        orderBy("createdAt", "desc"),
      ),
      (snap) =>
        setQuizzes(
          snap.docs.map((d) => ({ id: d.id, type: "quiz", ...d.data() })),
        ),
    );

    const unsubClasses = onSnapshot(
      query(
        collection(db, "rooms", roomId, "classes"),
        orderBy("createdAt", "desc"),
      ),
      (snap) =>
        setClasses(
          snap.docs.map((d) => ({ id: d.id, type: "class", ...d.data() })),
        ),
    );

    return () => {
      unsubAssignments();
      unsubQuizzes();
      unsubClasses();
    };
  }, [roomId]);

  const allNotifications = [
    ...assignments.map((a) => ({ ...a, titleText: `واجب جديد: ${a.title}` })),
    ...quizzes.map((q) => ({ ...q, titleText: `اختبار جديد: ${q.title}` })),
    ...classes.map((c) => ({ ...c, titleText: `حصة مضافة: ${c.title}` })),
  ].sort((a, b) => {
    const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
    const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
    return timeB - timeA;
  });

  useEffect(() => {
    if (!assignments.length || !studentUid) return;
    const checkSubmissions = async () => {
      const checks = assignments.map(async (ass) => {
        const q = query(
          collection(db, "rooms", roomId, "assignments", ass.id, "submissions"),
          where("studentId", "==", studentUid),
        );
        const snap = await getDocs(q);
        return !snap.empty ? ass.id : null;
      });
      const results = await Promise.all(checks);
      setSubmittedAssignmentIds(results.filter(Boolean));
    };
    checkSubmissions();
  }, [assignments, roomId, studentUid]);

  const getClassStatus = (classDateStr, classType) => {
    if (!classDateStr)
      return {
        label:
          classType === "recorded" ? "مشاهدة التسجيل 🎥" : "الانضمام للبث 🔴",
        active: true,
      };

    const classTime = new Date(classDateStr).getTime();
    const now = new Date().getTime();
    const diffMinutes = (classTime - now) / (1000 * 60);

    if (diffMinutes > 30) {
      return { label: "الحصة لم تبدأ بعد ⏳", active: false, badge: "قريباً" };
    } else if (diffMinutes >= -120) {
      return {
        label:
          classType === "recorded" ? "مشاهدة التسجيل 🎥" : "البث مباشر الآن 🔴",
        active: true,
        badge: "مباشر",
      };
    } else {
      return {
        label: "مشاهدة التسجيل (انتهت الحصة) 🎥",
        active: true,
        badge: "منتهي",
      };
    }
  };

  const handleUploadCloudinary = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "elemny_preset");
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/fwllahzf/upload`,
        { method: "POST", body: formData },
      );
      const data = await res.json();
      if (data.secure_url) setStudentFileUrl(data.secure_url);
      else throw new Error("فشل الرفع");
    } catch (err) {
      console.error(err);
      alert("فشل رفع الملف.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitAssignment = async (assignmentId) => {
    if (!studentFileUrl) return;
    try {
      await addDoc(
        collection(
          db,
          "rooms",
          roomId,
          "assignments",
          assignmentId,
          "submissions",
        ),
        {
          studentId: studentUid,
          studentName,
          fileUrl: studentFileUrl,
          submittedAt: serverTimestamp(),
        },
      );
      setSubmittedAssignmentIds((prev) => [...prev, assignmentId]);
      alert("تم تسليم الواجب! 🚀");
      setSubmittingId(null);
      setStudentFileUrl("");
    } catch (err) {
      console.error(err);
      alert("حدث خطأ.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-blue-600 bg-white dark:bg-[#0b0c10]">
        جاري التحميل...
      </div>
    );

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-white dark:bg-[#0b0c10] text-slate-800 dark:text-slate-100 py-10 px-4 md:px-12 relative"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm relative">
          <div>
            <h1 className="text-2xl font-black">
              {room?.name || "القاعة"} |{" "}
              <span className="text-blue-600">الطالب</span>
            </h1>
            <button
              onClick={() => navigate(-1)}
              className="text-xs font-bold flex items-center gap-1 mt-1 cursor-pointer hover:text-blue-600"
            >
              <ArrowRight size={14} /> عودة
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-white/5 border border-blue-100 dark:border-white/10 text-blue-600 dark:text-blue-400 flex items-center justify-center relative cursor-pointer hover:scale-105 transition-transform"
                title="التنبيهات الجديدة"
              >
                <Bell size={20} />
                {allNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-[#12141c]">
                    {allNotifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute left-0 mt-3 w-80 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-4 z-50 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-2">
                    <span className="font-extrabold text-xs flex items-center gap-1.5 text-blue-600">
                      <Sparkles size={14} /> إشعارات القاعة الأخيرة
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {allNotifications.length} جديد
                    </span>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                    {allNotifications.length > 0 ? (
                      allNotifications.map((notif, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 dark:bg-[#0a0b0e] p-3 rounded-2xl border border-slate-100 dark:border-white/5 space-y-1"
                        >
                          <p className="font-bold text-xs">{notif.titleText}</p>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {notif.createdAt?.toDate
                              ? notif.createdAt
                                  .toDate()
                                  .toLocaleDateString("ar-EG")
                              : "منذ قليل"}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-xs text-slate-400 py-6">
                        لا توجد إشعارات جديدة 📭
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 bg-slate-100 dark:bg-[#12141c] p-2 rounded-2xl border border-slate-200 dark:border-white/10">
          {[
            { id: "assignments", label: "الواجبات", icon: BookOpen },
            { id: "quizzes", label: "الاختبارات", icon: HelpCircle },
            { id: "classes", label: "الحصص", icon: Video },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer ${activeTab === tab.id ? "bg-blue-600 text-white shadow-md" : "text-slate-600 dark:text-slate-400"}`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "assignments" && (
          <div className="space-y-4">
            {assignments.map((item) => {
              const isAlreadySubmitted = submittedAssignmentIds.includes(
                item.id,
              );
              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-extrabold text-lg">
                        {item.title}{" "}
                        {isAlreadySubmitted && (
                          <span className="text-emerald-500 text-[10px]">
                            ✔ تم التسليم
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-slate-500 mt-2">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* الجزء الجديد: عرض التاريخ وملف المدرس */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    {item.dueDate && (
                      <span className="text-xs bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg text-slate-500 flex items-center gap-1.5">
                        <Clock size={13} /> الموعد: {item.dueDate}
                      </span>
                    )}
                    {item.fileUrl && (
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:underline"
                      >
                        <Download size={13} /> تحميل ملف الواجب
                      </a>
                    )}
                  </div>

                  {isAlreadySubmitted ? (
                    <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-xl text-xs font-bold text-center">
                      تم تسليم هذا الواجب مسبقاً ✅
                    </div>
                  ) : submittingId === item.id ? (
                    <div className="space-y-4 bg-slate-50 dark:bg-[#0a0b0e] p-4 rounded-2xl border border-slate-200 dark:border-white/10">
                      <div className="flex items-center justify-center p-4 border border-dashed rounded-2xl">
                        {!uploading && !studentFileUrl && (
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleUploadCloudinary}
                          />
                        )}
                        {uploading && (
                          <div className="animate-pulse flex items-center gap-2">
                            <Loader2 className="animate-spin" /> جاري الرفع...
                          </div>
                        )}
                        {studentFileUrl && !uploading && (
                          <span className="text-emerald-500 font-bold">
                            تم رفع الملف! ✅
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          disabled={uploading || !studentFileUrl}
                          onClick={() => handleSubmitAssignment(item.id)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold ${!studentFileUrl ? "bg-slate-300" : "bg-emerald-600 text-white"}`}
                        >
                          تأكيد التسليم
                        </button>
                        <button
                          onClick={() => setSubmittingId(null)}
                          className="px-4 py-2.5 bg-slate-200 rounded-xl text-xs"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSubmittingId(item.id)}
                      className="bg-blue-600 text-white text-xs px-5 py-2.5 rounded-xl font-bold flex items-center gap-2"
                    >
                      <Upload size={14} /> تسليم الحل
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "quizzes" && (
          <div className="space-y-4">
            {quizzes.map((quiz) => {
              const isExpired = new Date(quiz.dueDate) < new Date();
              return (
                <div
                  key={quiz.id}
                  className="bg-white dark:bg-[#12141c] border p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4"
                >
                  <div>
                    <h4 className="font-extrabold text-lg">
                      {quiz.title}{" "}
                      {isExpired && (
                        <span className="text-rose-500 text-[10px]">منتهي</span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {quiz.description}
                    </p>
                    <span
                      className={`text-sm font-mono mt-2 block font-bold ${isExpired ? "text-rose-500" : "text-emerald-600"}`}
                    >
                      الموعد: {quiz.dueDate}
                    </span>
                  </div>

                  <a
                    href={quiz.formUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`px-5 py-3 rounded-xl font-bold text-xs ${isExpired ? "bg-slate-200 cursor-not-allowed" : "bg-purple-600 text-white"}`}
                  >
                    {isExpired ? "منتهي" : "ابدأ الاختبار 🚀"}
                  </a>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "classes" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.map((cls) => {
              const classStatus = getClassStatus(cls.classDate, cls.classType);
              return (
                <div
                  key={cls.id}
                  className="bg-white dark:bg-[#12141c] border p-6 rounded-3xl space-y-4 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-full font-mono">
                        {cls.classType === "recorded"
                          ? "حصة مسجلة"
                          : "حصة مباشرة"}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-lg">{cls.title}</h4>
                    {cls.classDate && (
                      <p className="text-sm text-slate-500 dark:text-slate-300 font-mono font-bold flex items-center gap-1.5">
                        <Clock size={15} /> الموعد:{" "}
                        {new Date(cls.classDate).toLocaleString("ar-EG")}
                      </p>
                    )}
                  </div>
                  <div>
                    {classStatus.active ? (
                      <a
                        href={cls.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl text-xs font-bold transition-all shadow-md"
                      >
                        {classStatus.label}
                      </a>
                    ) : (
                      <button
                        disabled
                        className="w-full bg-slate-100 dark:bg-white/5 text-slate-400 py-3 rounded-2xl text-xs font-bold cursor-not-allowed"
                      >
                        {classStatus.label}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentRoom;
