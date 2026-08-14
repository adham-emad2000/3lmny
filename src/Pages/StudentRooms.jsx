import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";
import {
  KeyRound,
  ArrowRight,
  Users,
  LogIn,
  GraduationCap,
} from "lucide-react";

function StudentRooms() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomPassword, setRoomPassword] = useState("");
  const [joining, setJoining] = useState(false);

  const userData = JSON.parse(localStorage.getItem("elemny_user_data") || "{}");
  const studentName = userData.name || "طالب";
  const studentUid = userData.uid;

  // جلب الفصول لحظياً - المطابقة بقت بالـ uid بدل الاسم عشان نفرق بين
  // طلاب بنفس الاسم بالظبط
  useEffect(() => {
    if (!studentUid) return;

    const q = collection(db, "rooms");
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const enrolled = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const isMember = data.students?.some((s) =>
          typeof s === "string" ? s === studentName : s.uid === studentUid,
        );
        if (isMember) {
          enrolled.push({ id: docSnap.id, ...data });
        }
      });
      setRooms(enrolled);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [studentUid, studentName]);

  const handleJoinByPassword = async (e) => {
    e.preventDefault();
    if (!roomPassword) {
      alert("يرجى إدخال باسورد الروم أولاً.");
      return;
    }

    setJoining(true);
    try {
      const q = query(
        collection(db, "rooms"),
        where("password", "==", roomPassword.trim()),
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("عذراً، كلمة المرور غير صحيحة أو الروم غير موجود!");
        setJoining(false);
        return;
      }

      const roomDoc = querySnapshot.docs[0];
      const roomRef = doc(db, "rooms", roomDoc.id);

      // نخزن uid واسم الطالب مع بعض عشان نضمن كل طالب معرّف بشكل فريد
      await updateDoc(roomRef, {
        students: arrayUnion({ uid: studentUid, name: studentName }),
      });

      alert("تمت إضافة الفصل إلى فصولك الدراسية بنجاح! 🎓");
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء محاولة الانضمام.");
    } finally {
      setJoining(false);
      setRoomPassword("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0b0c10] flex items-center justify-center font-mono text-blue-600">
        جاري تحميل فصولك الدراسية...
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-white dark:bg-[#0b0c10] text-slate-800 dark:text-slate-100 py-10 px-4 md:px-12 transition-colors duration-300"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center bg-slate-50 dark:bg-[#12141c] border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-sm">
          <div>
            <button
              onClick={() => navigate("/")}
              className="text-slate-500 dark:text-slate-400 text-xs font-bold flex items-center gap-1 mb-1 cursor-pointer"
            >
              <ArrowRight size={14} /> العودة للرئيسية
            </button>
            <h1 className="text-2xl font-black">
              فصولي الدراسية{" "}
              <span className="text-blue-600">Student Rooms</span>
            </h1>
          </div>
          <span className="bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold px-4 py-2 rounded-full border border-blue-200 dark:border-blue-500/20 font-mono">
            {rooms.length} فصول منضم لها
          </span>
        </div>

        <div className="bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/10 p-8 rounded-3xl shadow-sm space-y-5">
          <h3 className="text-base font-black flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-4">
            <KeyRound size={20} className="text-blue-600" /> الانضمام برمز
            المرور (Password) فقط
          </h3>

          <form
            onSubmit={handleJoinByPassword}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                كلمة المرور الخاصة بالروم
              </label>
              <input
                type="text"
                className="w-full bg-slate-50 dark:bg-[#0a0b0e] border border-slate-200 dark:border-white/10 p-3.5 rounded-2xl text-xs outline-none focus:border-blue-600 font-mono"
                placeholder="أدخل باسورد الروم هنا..."
                value={roomPassword}
                onChange={(e) => setRoomPassword(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <button
                disabled={joining}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-2xl text-xs transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <LogIn size={16} />
                <span>{joining ? "جاري الإضافة..." : "انضم للروم 🚀"}</span>
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-black px-1">الفصول المنضم إليها</h3>
          {rooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/10 p-6 rounded-3xl space-y-4 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-lg mb-4 border border-blue-100 dark:border-blue-500/20">
                      🏫
                    </div>
                    <h4 className="font-extrabold text-lg">{room.name}</h4>

                    {/* اسم المعلم */}
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1.5 font-bold">
                      <GraduationCap size={15} /> المعلم:{" "}
                      {room.teacherName || "المعلم المسؤول"}
                    </p>

                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-mono">
                      <Users size={14} /> عدد الطلاب:{" "}
                      {room.students?.length || 0} طالب
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/student-room/${room.id}`)}
                    className="w-full bg-slate-100 dark:bg-white/5 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-200 text-xs py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-white/5 cursor-pointer"
                  >
                    <span>دخول الفصل الدراسي</span> ➔
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-[#12141c] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
              <p className="text-slate-500 text-sm font-bold">
                لم تنضم لأي فصل دراسي حتى الآن 📭
              </p>
              <p className="text-slate-400 text-xs mt-1">
                اكتب الباسورد في الأعلى لتظهر الروم هنا فوراً وتدخلها وقت ما
                تحب!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentRooms;
