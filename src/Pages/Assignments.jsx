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
  FileText,
  Clock,
  Plus,
  Trash2,
  ArrowRight,
  Download,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function Assignments() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [activeAssId, setActiveAssId] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  // التحقق من ملكية الروم قبل ما نعرض أي أداة إدارة
  const [isOwner, setIsOwner] = useState(null);

  useEffect(() => {
    const checkOwnership = async () => {
      try {
        const roomSnap = await getDoc(doc(db, "rooms", roomId));
        if (
          roomSnap.exists() &&
          roomSnap.data().teacherId === auth.currentUser?.uid
        ) {
          setIsOwner(true);
        } else {
          setIsOwner(false);
        }
      } catch (err) {
        console.error(err);
        setIsOwner(false);
      }
    };
    checkOwnership();
  }, [roomId]);

  useEffect(() => {
    const q = query(
      collection(db, "rooms", roomId, "assignments"),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(q, (snapshot) => {
      setAssignments(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
    });
  }, [roomId]);

  useEffect(() => {
    if (!activeAssId) return;
    setLoadingSubs(true);
    const q = query(
      collection(
        db,
        "rooms",
        roomId,
        "assignments",
        activeAssId,
        "submissions",
      ),
      orderBy("submittedAt", "desc"),
    );
    return onSnapshot(q, (snapshot) => {
      setSubmissions(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
      setLoadingSubs(false);
    });
  }, [roomId, activeAssId]);

  const uploadToCloudinary = async (fileToUpload) => {
    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("upload_preset", "elemny_preset");
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/fwllahzf/upload`,
      {
        method: "POST",
        body: formData,
      },
    );
    const data = await response.json();
    if (!data.secure_url) throw new Error("فشل الرفع");
    return data.secure_url;
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!title || !dueDate) {
      alert("يرجى إدخال عنوان الواجب وتاريخ التسليم.");
      return;
    }

    setIsUploading(true);
    try {
      let fileUrl = "";
      if (file) {
        fileUrl = await uploadToCloudinary(file);
      }

      await addDoc(collection(db, "rooms", roomId, "assignments"), {
        title,
        description,
        dueDate,
        fileUrl,
        fileName: file?.name || "",
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setDescription("");
      setDueDate("");
      setFile(null);
      alert("تم نشر الواجب بنجاح! 🚀");
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الرفع.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("هل أنت متأكد من حذف هذا الواجب نهائياً؟")) {
      try {
        await deleteDoc(doc(db, "rooms", roomId, "assignments", id));
        if (activeAssId === id) setActiveAssId(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (isOwner === null) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center font-mono text-red-500">
        جاري التحقق من الصلاحيات...
      </div>
    );
  }

  if (isOwner === false) {
    return (
      <div className="min-h-screen bg-[#0b0c10] text-white flex flex-col items-center justify-center text-center px-4">
        <div className="bg-red-950/40 border border-red-900 p-8 rounded-3xl max-w-sm">
          <h1 className="text-2xl font-black text-red-500 mb-2">
            ممنوع الاقتراب 🚫
          </h1>
          <p className="text-xs text-gray-400">
            هذه الغرفة ليست ملكك، لا يمكنك إدارة واجباتها.
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
      className="min-h-screen bg-[#0b0c10] text-slate-100 py-10 px-4 md:px-12 font-sans selection:bg-red-600 selection:text-white"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center bg-[#12141c] border border-white/10 p-6 rounded-3xl shadow-xl backdrop-blur-xl">
          <div className="space-y-1">
            <button
              onClick={() => navigate(-1)}
              className="text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1 mb-1 transition-colors cursor-pointer"
            >
              <ArrowRight size={14} /> العودة للروم
            </button>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              إدارة الواجبات <span className="text-red-500">Assignments</span>
            </h1>
          </div>
          <span className="bg-red-500/10 text-red-400 text-xs font-bold px-4 py-2 rounded-full border border-red-500/20 font-mono">
            {assignments.length} واجب نشط
          </span>
        </div>

        <div className="bg-[#12141c] border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center font-bold">
              <Plus size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                إضافة واجب جديد
              </h3>
              <p className="text-xs text-slate-400">
                أنشئ مهام جديدة وارفع الملفات لطلابك بسهولة
              </p>
            </div>
          </div>

          <form onSubmit={handlePublish} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  عنوان الواجب
                </label>
                <input
                  className="w-full bg-[#0a0b0e] border border-white/10 p-3.5 rounded-2xl text-xs outline-none focus:border-red-500 transition-all text-white placeholder:text-slate-600"
                  placeholder="مثال: الواجب الأول - ديناميكا"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  تاريخ التسليم (Deadline)
                </label>
                <input
                  type="date"
                  className="w-full bg-[#0a0b0e] border border-white/10 p-3.5 rounded-2xl text-xs outline-none text-slate-300 focus:border-red-500 transition-all font-mono"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                وصف الواجب والتعليمات
              </label>
              <textarea
                className="w-full bg-[#0a0b0e] border border-white/10 p-3.5 rounded-2xl text-xs outline-none focus:border-red-500 transition-all h-24 resize-none text-white placeholder:text-slate-600"
                placeholder="اكتب تفاصيل الواجب أو التعليمات المطلوبة هنا..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                الملف المرفق (PDF أو صورة)
              </label>
              <div className="flex items-center gap-4 bg-[#0a0b0e] border border-white/10 p-3 rounded-2xl">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-red-600 file:text-white hover:file:bg-red-500 cursor-pointer"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
            </div>

            <button
              disabled={isUploading}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-2xl text-sm transition-all shadow-lg shadow-red-600/20 cursor-pointer disabled:opacity-50"
            >
              {isUploading
                ? "جاري رفع الملف والنشر..."
                : "نشر الواجب للطلاب 🚀"}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-black text-white px-1">
            الواجبات المنشورة وتسلّمات الطلاب
          </h3>

          {assignments.length > 0 ? (
            assignments.map((ass) => {
              const isOpen = activeAssId === ass.id;
              return (
                <div
                  key={ass.id}
                  onClick={() => setActiveAssId(isOpen ? null : ass.id)}
                  className={`bg-[#12141c] border rounded-3xl p-6 shadow-xl transition-all cursor-pointer space-y-4 group ${
                    isOpen
                      ? "border-red-500/60 ring-1 ring-red-500/30"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <FileText size={22} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-base text-white">
                          {ass.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {ass.description || "بدون وصف إضافي"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                      <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3.5 py-1.5 rounded-full text-xs font-bold border border-emerald-500/20 font-mono">
                        <Clock size={13} /> {ass.dueDate}
                      </span>

                      {ass.fileUrl && (
                        <a
                          href={ass.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="bg-white/5 hover:bg-white/10 text-slate-300 p-2.5 rounded-2xl transition-colors text-xs font-bold flex items-center gap-1 border border-white/5 cursor-pointer"
                          title="تحميل الملف الأساسي"
                        >
                          <Download size={15} />
                        </a>
                      )}

                      <button
                        onClick={(e) => handleDelete(ass.id, e)}
                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 p-2.5 rounded-2xl transition-colors border border-rose-500/20 cursor-pointer"
                        title="حذف الواجب"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="text-slate-400 p-1 flex items-center gap-1 text-xs font-bold">
                        <span className="hidden sm:inline">
                          {isOpen ? "إخفاء الحلول" : "عرض الحلول"}
                        </span>
                        {isOpen ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </div>
                    </div>
                  </div>

                  {isOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-4 pt-5 border-t border-white/10 space-y-4 bg-[#0a0b0e] p-5 rounded-2xl border border-white/5"
                    >
                      <div className="flex justify-between items-center">
                        <h5 className="font-extrabold text-xs text-red-400 uppercase tracking-wider flex items-center gap-2 font-mono">
                          <span>📥</span> تسليمات الطلاب لهذا الواجب (
                          {submissions.length})
                        </h5>
                      </div>

                      {loadingSubs ? (
                        <div className="text-center py-6 text-xs text-slate-500 font-mono">
                          جاري تحميل حلول الطلاب...
                        </div>
                      ) : submissions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {submissions.map((sub, idx) => (
                            <div
                              key={idx}
                              className="bg-[#12141c] border border-white/10 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-xs shrink-0 border border-red-500/20">
                                  <User size={18} />
                                </div>
                                <div className="space-y-0.5">
                                  <span className="font-extrabold text-xs text-white block">
                                    {sub.studentName || "طالب"}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono block">
                                    {sub.submittedAt?.toDate
                                      ? sub.submittedAt
                                          .toDate()
                                          .toLocaleString("ar-EG")
                                      : "منذ قليل"}
                                  </span>
                                </div>
                              </div>

                              {sub.fileUrl && (
                                <a
                                  href={sub.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="bg-red-600 hover:bg-red-500 text-white text-[11px] px-4 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-red-600/20 shrink-0 flex items-center gap-1.5 cursor-pointer"
                                >
                                  <span>فتح حل الطالب</span> 📎
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-[#12141c] rounded-2xl border border-dashed border-white/15 space-y-1">
                          <p className="text-xs text-slate-400 font-bold">
                            لم يقم أي طالب بتسليم هذا الواجب حتى الآن 📭
                          </p>
                          <p className="text-[10px] text-slate-500">
                            ستظهر أسماء الطلاب وحلولهم هنا لحظياً فور إرسالها.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-[#12141c] rounded-3xl border border-white/10 space-y-2 shadow-xl">
              <div className="text-4xl">📭</div>
              <p className="text-slate-400 font-bold text-sm">
                لا توجد واجبات منشورة حتى الآن
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Assignments;
