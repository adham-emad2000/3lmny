import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Video,
  Plus,
  Trash2,
  ArrowRight,
  ExternalLink,
  Link as LinkIcon,
  PlayCircle,
  Clock,
} from "lucide-react";

function OnlineClasses() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [classesList, setClassesList] = useState([]);
  const [title, setTitle] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [classDate, setClassDate] = useState("");
  const [classType, setClassType] = useState("upcoming");
  const [isCreating, setIsCreating] = useState(false);
  const [isOwner, setIsOwner] = useState(null);

  useEffect(() => {
    const checkOwnership = async () => {
      try {
        const roomSnap = await getDoc(doc(db, "rooms", roomId));
        setIsOwner(
          roomSnap.exists() &&
            roomSnap.data().teacherId === auth.currentUser?.uid,
        );
      } catch (err) {
        console.error(err);
        setIsOwner(false);
      }
    };
    checkOwnership();
  }, [roomId]);

  useEffect(() => {
    const q = query(
      collection(db, "rooms", roomId, "classes"),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(q, (snapshot) => {
      setClassesList(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
    });
  }, [roomId]);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!title || !meetingUrl) {
      alert("يرجى إدخال عنوان الحصة والرابط.");
      return;
    }

    setIsCreating(true);
    try {
      await addDoc(collection(db, "rooms", roomId, "classes"), {
        title,
        meetingUrl,
        classDate,
        classType,
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setMeetingUrl("");
      setClassDate("");
      alert("تم إضافة الحصة بنجاح! 🎥");
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء النشر.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الحصة؟")) {
      try {
        await deleteDoc(doc(db, "rooms", roomId, "classes", id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (isOwner === null) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0b0c10] flex items-center justify-center font-mono text-blue-600">
        جاري التحقق من الصلاحيات...
      </div>
    );
  }

  if (isOwner === false) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0b0c10] text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center text-center px-4">
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-8 rounded-3xl max-w-sm">
          <h1 className="text-2xl font-black text-red-500 mb-2">
            ممنوع الاقتراب 🚫
          </h1>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            هذه الغرفة ليست ملكك، لا يمكنك إدارة حصصها.
          </p>
          <button
            onClick={() => navigate("/teacher-rooms")}
            className="mt-4 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-2xl transition-all text-sm cursor-pointer"
          >
            العودة لرومك
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-white dark:bg-[#0b0c10] text-slate-800 dark:text-slate-100 py-10 px-4 md:px-12 transition-colors duration-300"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm dark:shadow-xl">
          <div className="space-y-1">
            <button
              onClick={() => navigate(-1)}
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-xs font-bold flex items-center gap-1 mb-1 transition-colors cursor-pointer"
            >
              <ArrowRight size={14} /> العودة للروم
            </button>
            <h1 className="text-2xl font-black">
              إدارة الحصص المباشرة{" "}
              <span className="text-blue-600">Online Classes</span>
            </h1>
          </div>
          <span className="bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold px-4 py-2 rounded-full border border-blue-200 dark:border-blue-500/20 font-mono">
            {classesList.length} حصة مسجلة
          </span>
        </div>

        <div className="bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/10 p-8 rounded-3xl shadow-sm dark:shadow-2xl space-y-6">
          <h3 className="text-base font-black flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-4">
            <Plus size={20} className="text-blue-600" /> إضافة حصة جديدة (مباشرة
            أو سابقة)
          </h3>

          <form onSubmit={handlePublish} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  عنوان الحصة
                </label>
                <input
                  className="w-full bg-slate-50 dark:bg-[#0a0b0e] border border-slate-200 dark:border-white/10 p-3.5 rounded-2xl text-xs outline-none focus:border-blue-600"
                  placeholder="مثال: مراجعة الباب الثاني - ديناميكا"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  ميعاد الحصة (التاريخ والوقت)
                </label>
                <input
                  type="datetime-local"
                  className="w-full bg-slate-50 dark:bg-[#0a0b0e] border border-slate-200 dark:border-white/10 p-3.5 rounded-2xl text-xs outline-none focus:border-blue-600 font-mono"
                  value={classDate}
                  onChange={(e) => setClassDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  رابط البث / الفيديو (Zoom, Meet, YouTube)
                </label>
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#0a0b0e] border border-slate-200 dark:border-white/10 px-3.5 rounded-2xl">
                  <LinkIcon size={16} className="text-slate-400 shrink-0" />
                  <input
                    type="url"
                    className="w-full bg-transparent py-3.5 text-xs outline-none"
                    placeholder="https://zoom.us/... أو يوتيوب"
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  نوع الحصة
                </label>
                <select
                  className="w-full bg-slate-50 dark:bg-[#0a0b0e] border border-slate-200 dark:border-white/10 p-3.5 rounded-2xl text-xs outline-none focus:border-blue-600"
                  value={classType}
                  onChange={(e) => setClassType(e.target.value)}
                >
                  <option value="upcoming">
                    حصة قادمة / مباشرة (Upcoming)
                  </option>
                  <option value="recorded">حصة سابقة / مسجلة (Archive)</option>
                </select>
              </div>
            </div>

            <button
              disabled={isCreating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-sm transition-all shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-50"
            >
              {isCreating ? "جاري الإضافة..." : "نشر الحصة للطلاب 🎥"}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-black px-1">جدول وحصص المنصة</h3>

          {classesList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classesList.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm dark:shadow-xl flex flex-col justify-between space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border shrink-0 ${
                          item.classType === "recorded"
                            ? "bg-purple-50 dark:bg-purple-500/10 text-purple-600 border-purple-100 dark:border-purple-500/20"
                            : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 border-blue-100 dark:border-blue-500/20"
                        }`}
                      >
                        {item.classType === "recorded" ? (
                          <PlayCircle size={22} />
                        ) : (
                          <Video size={22} />
                        )}
                      </div>
                      <div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-1 ${
                            item.classType === "recorded"
                              ? "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300"
                              : "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300"
                          }`}
                        >
                          {item.classType === "recorded"
                            ? "حصة مسجلة / سابقة"
                            : "حصة قادمة / مباشرة"}
                        </span>
                        <h4 className="font-extrabold text-base">
                          {item.title}
                        </h4>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-slate-400 hover:text-red-500 p-2 rounded-xl transition-colors bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 cursor-pointer"
                      title="حذف الحصة"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {item.classDate && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <Clock size={14} className="text-blue-600" />
                      <span>
                        الموعد:{" "}
                        {new Date(item.classDate).toLocaleString("ar-EG")}
                      </span>
                    </div>
                  )}

                  {item.meetingUrl && (
                    <a
                      href={item.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-slate-100 dark:bg-white/5 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-200 text-xs py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-white/5 cursor-pointer"
                    >
                      <span>
                        {item.classType === "recorded"
                          ? "مشاهدة التسجيل"
                          : "الانضمام للبث المباشر"}
                      </span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-[#12141c] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
              <p className="text-slate-500 text-sm font-bold">
                لا توجد حصص مضافة حتى الآن 📭
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OnlineClasses;
