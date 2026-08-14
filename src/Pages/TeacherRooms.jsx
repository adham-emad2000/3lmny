import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

function TeacherRooms() {
  const navigate = useNavigate();
  const [userData] = useState(() => {
    const saved = localStorage.getItem("elemny_user_data");
    return saved ? JSON.parse(saved) : null;
  });

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomName, setRoomName] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const teacherTier = userData?.subscription?.tier || "free";
  // الميزة دي مقصورة على باقة Pro بس، فأي تير تاني (free أو standard) هيتحجب
  const isPro = teacherTier === "pro";
  const isBlocked = !isPro;

  // دالة لتوليد باسورد عشوائي فريد وقصير
  const generateUniquePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pass = "RM-";
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRoomPassword(pass);
  };

  useEffect(() => {
    if (!userData?.uid || isBlocked) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "rooms"),
      where("teacherId", "==", userData.uid),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRooms = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          const timeA = a.createdAt?.toMillis
            ? a.createdAt.toMillis()
            : Date.now();
          const timeB = b.createdAt?.toMillis
            ? b.createdAt.toMillis()
            : Date.now();
          return timeB - timeA;
        });
      setRooms(fetchedRooms);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData, isBlocked]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!roomName.trim() || !roomPassword.trim()) {
      setErrorMsg("يا بطل، اكتب اسم الروم والباسورد عشان نكمل.");
      return;
    }
    setIsCreating(true);
    try {
      // 1. التحقق من عدم تكرار اسم الروم
      const nameQuery = query(
        collection(db, "rooms"),
        where("name", "==", roomName.trim()),
      );
      const nameSnapshot = await getDocs(nameQuery);
      if (!nameSnapshot.empty) {
        setErrorMsg("اسم الروم ده مستخدم قبل كده، اختار اسم مميز تاني.");
        setIsCreating(false);
        return;
      }

      // 2. التحقق من عدم تكرار باسورد الروم في أي روم أخرى على النظام بالكامل
      const passQuery = query(
        collection(db, "rooms"),
        where("password", "==", roomPassword.trim()),
      );
      const passSnapshot = await getDocs(passQuery);
      if (!passSnapshot.empty) {
        setErrorMsg(
          "الباسورد ده مستخدم لروم أخرى، جرب توليد باسورد عشوائي جديد.",
        );
        setIsCreating(false);
        return;
      }

      // 3. الحفظ في قاعدة البيانات
      await addDoc(collection(db, "rooms"), {
        name: roomName.trim(),
        password: roomPassword.trim(),
        teacherId: userData.uid,
        teacherName: userData.name,
        students: [],
        createdAt: serverTimestamp(),
      });
      setRoomName("");
      setRoomPassword("");
    } catch (error) {
      console.error(error);
      setErrorMsg("حدث خطأ أثناء الإنشاء، جرب تاني.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteRoom = async (roomId, name) => {
    if (window.confirm(`متأكد إنك عاوز تحذف روم "${name}"؟`)) {
      try {
        await deleteDoc(doc(db, "rooms", roomId));
      } catch (error) {
        alert("معرفناش نمسح الروم دلوقتي، جرب تاني.");
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "منذ لحظات";
    return timestamp.toDate().toLocaleDateString("ar-EG", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center p-6 text-center font-sans">
        <div className="bg-[#111827] p-10 rounded-3xl border border-indigo-500/20 max-w-md shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center text-3xl mx-auto border border-indigo-500/20">
            ⚡
          </div>
          <div>
            <h2 className="text-2xl font-black text-white mb-2">
              ميزة خاصة لمشتركي Pro
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              إدارة الفصول والرومات الافتراضية متاحة لباقة Pro بس. رقي حسابك
              وافتح كل الصلاحيات!
            </p>
          </div>
          <button
            onClick={() => navigate("/upgrade")}
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-500/25 cursor-pointer"
          >
            رقي حسابك للـ Pro 🚀
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
        {/* Header Section */}
        <div className="bg-[#111827]/70 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl pointer-events-none"></div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono font-bold mb-3">
              <span> CLASSROOMS </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              إدارة الفصول والرومات 🚀
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              مساحتك الخاصة لإدارة الطلاب، الواجبات، والحصص بكل راحة.
            </p>
          </div>
          <div className="bg-[#090D16] border border-white/10 px-6 py-4 rounded-2xl text-center">
            <span className="text-[10px] text-gray-400 uppercase font-mono block">
              الغرف المتاحة
            </span>
            <span className="text-2xl font-black text-indigo-400 font-mono">
              {rooms.length}
            </span>
          </div>
        </div>

        {/* Create Room Box */}
        <div className="bg-[#111827]/70 backdrop-blur-xl border border-indigo-500/20 p-8 rounded-[2.5rem] shadow-2xl relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-lg">
              ✨
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                إنشاء روم جديدة في ثواني
              </h2>
              <p className="text-xs text-gray-400">
                اكتب اسم الروم وولّد باسورد فريد للدخول
              </p>
            </div>
          </div>

          <form
            onSubmit={handleCreateRoom}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="اسم الروم (مثال: فيزياء 3ث - أ. محمد)"
              className="bg-[#090D16] border border-white/10 text-white placeholder-gray-500 p-4 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all text-sm font-medium"
            />

            <div className="relative flex items-center">
              <input
                type="text"
                value={roomPassword}
                onChange={(e) => setRoomPassword(e.target.value)}
                placeholder="باسورد دخول الطلاب"
                className="w-full bg-[#090D16] border border-white/10 text-white placeholder-gray-500 p-4 pl-28 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all text-sm font-mono"
              />
              <button
                type="button"
                onClick={generateUniquePassword}
                className="absolute left-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[11px] font-bold px-3 py-2 rounded-xl transition-all border border-indigo-500/30 cursor-pointer"
              >
                توليد تلقائي ⚡
              </button>
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-50 text-sm cursor-pointer"
            >
              {isCreating ? "جاري الإنشاء..." : "إنشاء الغرفة الآن ➕"}
            </button>
          </form>

          {errorMsg && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
              <span>⚠️</span> {errorMsg}
            </div>
          )}
        </div>

        {/* Rooms Grid */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-white tracking-wide">
            الغرف الخاصة بك
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-16">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : rooms.length > 0 ? (
              rooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-[#111827]/70 backdrop-blur-xl border border-white/10 hover:border-indigo-500/40 transition-all duration-300 rounded-[2rem] p-6 flex flex-col justify-between group shadow-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full group-hover:bg-indigo-500/10 transition-all"></div>

                  <div>
                    <div className="flex justify-between items-start mb-3 relative z-10">
                      <div>
                        <h3 className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                          {room.name}
                        </h3>
                        <span className="text-[11px] text-gray-400 font-mono mt-0.5 block">
                          أنشئت في: {formatDate(room.createdAt)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteRoom(room.id, room.name)}
                        className="w-8 h-8 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 flex items-center justify-center transition-all text-xs cursor-pointer"
                        title="حذف الروم"
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="bg-[#090D16] border border-white/5 p-3.5 rounded-2xl flex justify-between items-center my-5 relative z-10">
                      <span className="text-xs text-gray-400">الباسورد:</span>
                      <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-xl text-sm">
                        {room.password}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-4 relative z-10">
                      <span className="text-[11px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-3 py-1 rounded-xl font-bold font-mono">
                        👥 {room.students?.length || 0} طلاب منضمين
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/teacher-room/${room.id}`)}
                    className="w-full relative z-10 py-3.5 bg-white/5 group-hover:bg-indigo-600 text-white font-bold rounded-2xl transition-all duration-300 text-sm border border-white/10 group-hover:border-indigo-600 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <span>دخول الروم وإدارتها</span>
                    <span>➔</span>
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-[#111827]/50 rounded-[2.5rem] border border-white/10 space-y-3">
                <div className="text-4xl">📭</div>
                <p className="text-gray-300 font-bold text-lg">
                  مفيش رومات مضافة لحد دلوقتي
                </p>
                <p className="text-gray-500 text-sm">
                  ابدأ وزبط أول روم ليك من الفورم اللي فوق.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherRooms;
