import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

function RoomDetails() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "rooms", roomId), (docSnap) => {
      if (docSnap.exists()) {
        setRoom({ id: docSnap.id, ...docSnap.data() });
      } else {
        setRoom(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId]);

  const handleRemoveStudent = async (studentTarget) => {
    const studentName =
      typeof studentTarget === "string"
        ? studentTarget
        : studentTarget.name || "الطالب";
    if (window.confirm(`متأكد إنك عاوز تشيل "${studentName}" من الروم؟`)) {
      try {
        const updatedStudents = room.students.filter(
          (s) => s !== studentTarget,
        );
        await updateDoc(doc(db, "rooms", roomId), {
          students: updatedStudents,
        });
      } catch (error) {
        console.error("Error removing student:", error);
        alert("حصلت مشكلة أثناء محاولة حذف الطالب.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center font-mono text-indigo-400">
        جاري تحميل بيانات الروم...
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[#090D16] text-white flex flex-col items-center justify-center text-center px-4 font-sans">
        <div className="text-4xl mb-3">📭</div>
        <h2 className="text-2xl font-black mb-2 text-white">
          الروم غير موجودة أو تم حذفها
        </h2>
        <button
          onClick={() => navigate("/teacher-rooms")}
          className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-2xl transition-all text-sm cursor-pointer"
        >
          العودة لقائمة الرومات
        </button>
      </div>
    );
  }

  // 👇 تحقق الملكية: الصفحة دي بتديك تحكم كامل في الروم (باسورد، طلاب، محتوى)
  // فلازم تتأكد إن اليوزر الحالي هو المعلم صاحب الروم فعلاً
  if (room.teacherId !== auth.currentUser?.uid) {
    return (
      <div className="min-h-screen bg-[#090D16] text-white flex flex-col items-center justify-center text-center px-4 font-sans">
        <div className="bg-red-950/40 border border-red-900 p-8 rounded-3xl max-w-sm">
          <h1 className="text-2xl font-black text-red-500 mb-2">
            ممنوع الاقتراب 🚫
          </h1>
          <p className="text-xs text-gray-400">
            هذه الغرفة ليست ملكك، لا يمكنك إدارتها.
          </p>
          <button
            onClick={() => navigate("/teacher-rooms")}
            className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-2xl transition-all text-sm cursor-pointer"
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
      className="min-h-screen bg-[#090D16] text-white py-14 px-6 md:px-12 font-sans selection:bg-indigo-500 selection:text-white"
    >
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="bg-[#111827]/70 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl pointer-events-none"></div>

          <div>
            <button
              onClick={() => navigate("/teacher-rooms")}
              className="text-gray-400 hover:text-white transition-colors text-xs font-mono font-bold uppercase mb-3 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>←</span> العودة للرومات
            </button>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              {room.name}
            </h1>
            <p className="text-gray-400 text-sm mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              • إجمالي الطلاب المنضمين:{" "}
              <strong className="text-white">
                {room.students?.length || 0}
              </strong>{" "}
              طالب
            </p>
          </div>

          <div className="bg-[#090D16] border border-white/10 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-inner">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
              🔑
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-mono block">
                باسورد الدخول للطلاب
              </span>
              <span className="font-mono font-black text-xl text-indigo-400 tracking-wider">
                {room.password}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111827]/70 backdrop-blur-xl border border-white/10 hover:border-indigo-500/40 transition-all duration-300 rounded-[2rem] p-7 flex flex-col justify-between group shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full group-hover:bg-emerald-500/10 transition-all"></div>
            <div>
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-2xl mb-5">
                📚
              </div>
              <h3 className="text-xl font-extrabold text-white mb-2">
                الواجبات والتسليمات
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                نشر التكاليف المنزلية، متابعة ملفات حلول الطلاب، وتقييمهم أول
                بأول.
              </p>
            </div>
            <button
              onClick={() => navigate(`/teacher-room/${roomId}/assignments`)}
              className="w-full py-3.5 bg-white/5 group-hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all duration-300 text-sm border border-white/10 group-hover:border-emerald-600 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>إدارة الأرشيف</span>
              <span>➔</span>
            </button>
          </div>

          <div className="bg-[#111827]/70 backdrop-blur-xl border border-white/10 hover:border-indigo-500/40 transition-all duration-300 rounded-[2rem] p-7 flex flex-col justify-between group shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full group-hover:bg-purple-500/10 transition-all"></div>
            <div>
              <div className="w-12 h-12 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-2xl flex items-center justify-center text-2xl mb-5">
                📝
              </div>
              <h3 className="text-xl font-extrabold text-white mb-2">
                الامتحان
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                تضمين نماذج جوجل (Google Forms) لاختبار استيعاب الطلاب ونتائجهم
                اللحظية.
              </p>
            </div>
            <button
              onClick={() => navigate(`/teacher-room/${roomId}/quizzes`)}
              className="w-full py-3.5 bg-white/5 group-hover:bg-purple-600 text-white font-bold rounded-2xl transition-all duration-300 text-sm border border-white/10 group-hover:border-purple-600 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>إدارة النماذج</span>
              <span>➔</span>
            </button>
          </div>

          <div className="bg-[#111827]/70 backdrop-blur-xl border border-white/10 hover:border-indigo-500/40 transition-all duration-300 rounded-[2rem] p-7 flex flex-col justify-between group shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-bl-full group-hover:bg-sky-500/10 transition-all"></div>
            <div>
              <div className="w-12 h-12 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-2xl flex items-center justify-center text-2xl mb-5">
                💻
              </div>
              <h3 className="text-xl font-extrabold text-white mb-2">
                بث حصص الأونلاين
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                جدولة وإطلاق روابط الحصص المباشرة (Zoom أو Meet) لتجمع الطلاب في
                قاعة واحدة.
              </p>
            </div>
            <button
              onClick={() => navigate(`/teacher-room/${roomId}/classes`)}
              className="w-full py-3.5 bg-white/5 group-hover:bg-sky-600 text-white font-bold rounded-2xl transition-all duration-300 text-sm border border-white/10 group-hover:border-sky-600 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>إعداد الحصة</span>
              <span>➔</span>
            </button>
          </div>
        </div>

        <div className="bg-[#111827]/70 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-xl">
                👥
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">
                  قائمة الطلاب المنضمين
                </h2>
              </div>
            </div>
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-4 py-1.5 rounded-2xl text-xs font-mono font-bold">
              {room.students?.length || 0} طالب
            </span>
          </div>

          {room.students && room.students.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {room.students.map((student, index) => (
                <div
                  key={index}
                  className="bg-[#090D16] border border-white/10 p-4 rounded-2xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-white/5 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0 border border-white/10">
                      {index + 1}
                    </div>
                    <span className="font-bold text-sm text-gray-200 truncate">
                      {typeof student === "string"
                        ? student
                        : student.name || "طالب مسجل"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveStudent(student)}
                    className="w-8 h-8 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 flex items-center justify-center transition-all text-xs shrink-0 cursor-pointer"
                    title="إزالة الطالب من الروم"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#090D16] rounded-3xl border border-white/5 space-y-2">
              <div className="text-3xl">📭</div>
              <p className="text-gray-400 font-bold text-base">
                مفيش طلاب انضموا لحد دلوقتي
              </p>
              <p className="text-gray-500 text-xs">
                شارك اسم الروم والباسورد مع طلابك عشان يبدأوا يدخلوا.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

RoomDetails.displayName = "RoomDetails";

export default RoomDetails;
