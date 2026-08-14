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
  HelpCircle,
  Plus,
  Trash2,
  ArrowRight,
  Clock,
  ExternalLink,
  Link as LinkIcon,
} from "lucide-react";

function Quizzes() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [dueDate, setDueDate] = useState("");
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
      collection(db, "rooms", roomId, "quizzes"),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(q, (snapshot) => {
      setQuizzes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
  }, [roomId]);

  const handlePublishQuiz = async (e) => {
    e.preventDefault();
    if (!title || !formUrl) {
      alert("يرجى إدخال عنوان الاختبار ورابط النموذج (Google Form).");
      return;
    }

    setIsCreating(true);
    try {
      await addDoc(collection(db, "rooms", roomId, "quizzes"), {
        title,
        description,
        formUrl,
        dueDate,
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setDescription("");
      setFormUrl("");
      setDueDate("");
      alert("تم نشر الاختبار بنجاح! 🎯");
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء نشر الاختبار.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الاختبار؟")) {
      try {
        await deleteDoc(doc(db, "rooms", roomId, "quizzes", id));
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
            هذه الغرفة ليست ملكك، لا يمكنك إدارة اختباراتها.
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
              إدارة الاختبارات <span className="text-blue-600">Quizzes</span>
            </h1>
          </div>
          <span className="bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold px-4 py-2 rounded-full border border-blue-200 dark:border-blue-500/20 font-mono">
            {quizzes.length} اختبار متاح
          </span>
        </div>

        <div className="bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/10 p-8 rounded-3xl shadow-sm dark:shadow-2xl space-y-6">
          <h3 className="text-base font-black flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-4">
            <Plus size={20} className="text-blue-600" /> إضافة اختبار جديد
            (Google Form)
          </h3>

          <form onSubmit={handlePublishQuiz} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  عنوان الاختبار
                </label>
                <input
                  className="w-full bg-slate-50 dark:bg-[#0a0b0e] border border-slate-200 dark:border-white/10 p-3.5 rounded-2xl text-xs outline-none focus:border-blue-600"
                  placeholder="مثال: كويز الفصل الأول - فيزياء"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  تاريخ النهاية (Deadline)
                </label>
                <input
                  type="date"
                  className="w-full bg-slate-50 dark:bg-[#0a0b0e] border border-slate-200 dark:border-white/10 p-3.5 rounded-2xl text-xs outline-none focus:border-blue-600 font-mono"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                رابط نموذج جوجل (Google Form URL)
              </label>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#0a0b0e] border border-slate-200 dark:border-white/10 px-3.5 rounded-2xl">
                <LinkIcon size={16} className="text-slate-400 shrink-0" />
                <input
                  type="url"
                  className="w-full bg-transparent py-3.5 text-xs outline-none"
                  placeholder="https://forms.gle/..."
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                تعليمات أو وصف إضافي (اختياري)
              </label>
              <textarea
                className="w-full bg-slate-50 dark:bg-[#0a0b0e] border border-slate-200 dark:border-white/10 p-3.5 rounded-2xl text-xs outline-none focus:border-blue-600 h-20 resize-none"
                placeholder="تعليمات سريعة للطلاب قبل فتح الاختبار..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button
              disabled={isCreating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-sm transition-all shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-50"
            >
              {isCreating ? "جاري النشر..." : "نشر الاختبار للطلاب 🎯"}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-black px-1">الاختبارات النشطة</h3>
          {quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm dark:shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-100 dark:border-blue-500/20 shrink-0">
                    <HelpCircle size={22} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-base">{quiz.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {quiz.description || "بدون تعليمات إضافية"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  {quiz.dueDate && (
                    <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 px-3.5 py-1.5 rounded-full text-xs font-bold border border-emerald-100 dark:border-emerald-500/20 font-mono">
                      <Clock size={13} /> {quiz.dueDate}
                    </span>
                  )}

                  {quiz.formUrl && (
                    <a
                      href={quiz.formUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <span>فتح النموذج</span> <ExternalLink size={14} />
                    </a>
                  )}

                  <button
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    className="text-slate-400 hover:text-red-500 p-2.5 rounded-xl transition-colors bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 cursor-pointer"
                    title="حذف الاختبار"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white dark:bg-[#12141c] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
              <p className="text-slate-500 text-sm font-bold">
                لا توجد اختبارات منشورة حتى الآن 📭
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Quizzes;
