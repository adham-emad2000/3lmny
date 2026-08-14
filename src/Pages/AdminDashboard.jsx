import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getCountFromServer,
  query,
  where,
} from "firebase/firestore";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Users,
  GraduationCap,
  UserCheck,
  Activity,
  Mail,
  Phone,
} from "lucide-react";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // pending, approved, rejected, students, teachers

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalRequests: 0,
    pendingRequests: 0,
  });

  // 👇 حط إيميلك الحقيقي هنا، ولازم يكون مطابق حرفياً لنفس الإيميل
  // المكتوب في isAdmin() جوا Firestore Rules
  const ADMIN_EMAIL = "adhamxx05@gmail.com";
  const currentUserEmail = auth.currentUser?.email;

  const fetchAllData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const allUsers = querySnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setUsers(allUsers);

      const usersSnap = await getCountFromServer(collection(db, "users"));

      const teachersQuery = query(
        collection(db, "users"),
        where("role", "==", "teacher"),
      );
      const teachersSnap = await getCountFromServer(teachersQuery);

      const studentsQuery = query(
        collection(db, "users"),
        where("role", "==", "student"),
      );
      const studentsSnap = await getCountFromServer(studentsQuery);

      const requestsSnap = await getCountFromServer(collection(db, "requests"));

      const pendingCount = allUsers.filter(
        (u) => u.subscription?.requestStatus === "pending",
      ).length;

      setStats({
        totalUsers: usersSnap.data().count,
        totalTeachers: teachersSnap.data().count,
        totalStudents: studentsSnap.data().count,
        totalRequests: requestsSnap.data().count,
        pendingRequests: pendingCount,
      });
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const getExpiryDateForTier = (tier) => {
    const date = new Date();
    const normalizedTier = (tier || "").toLowerCase();
    if (normalizedTier === "standard") {
      date.setMonth(date.getMonth() + 3);
    } else if (normalizedTier === "pro") {
      date.setMonth(date.getMonth() + 6);
    } else {
      date.setMonth(date.getMonth() + 3);
    }
    return date.toISOString();
  };

  const handleApprove = async (userId, requestedTier) => {
    try {
      const userRef = doc(db, "users", userId);
      const calculatedExpiry = getExpiryDateForTier(requestedTier);

      await updateDoc(userRef, {
        "subscription.tier": requestedTier,
        "subscription.status": "active",
        "subscription.requestStatus": "approved",
        "subscription.requestedTier": null,
        "subscription.paymentReceipt": null,
        "subscription.startDate": new Date().toISOString(),
        "subscription.expiryDate": calculatedExpiry,
        "subscription.tempExpiryDate": null,
      });
      alert("✅ تمت الموافقة وتفعيل باقة المعلم بنجاح!");
      fetchAllData();
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء التفعيل.");
    }
  };

  const handleReject = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        "subscription.status": "active",
        "subscription.requestStatus": "rejected",
        "subscription.requestedTier": null,
        "subscription.paymentReceipt": null,
        "subscription.tempExpiryDate": null,
      });
      alert("❌ تم رفض الطلب وإبقاء المعلم على باقته السابقة.");
      fetchAllData();
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء الرفض.");
    }
  };

  if (currentUserEmail !== ADMIN_EMAIL)
    return (
      <div className="text-center py-20 text-white min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-red-950/40 border border-red-900 p-8 rounded-3xl">
          <h1 className="text-2xl font-black text-red-500">
            ممنوع الاقتراب 🚫
          </h1>
          <p className="text-xs text-gray-400 mt-2">
            هذه الصفحة مخصصة للأدمن الرئيسي فقط.
          </p>
        </div>
      </div>
    );

  if (loading)
    return (
      <div className="text-center py-20 text-white bg-gray-950 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  const filteredUsers = users.filter((u) => {
    const reqStatus = u.subscription?.requestStatus;
    if (activeTab === "pending") return reqStatus === "pending";
    if (activeTab === "approved") return reqStatus === "approved";
    if (activeTab === "rejected") return reqStatus === "rejected";
    if (activeTab === "students") return u.role === "student";
    if (activeTab === "teachers") return u.role === "teacher";
    return false;
  });

  return (
    <div dir="rtl" className="min-h-screen bg-gray-950 text-white py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-primary" /> لوحة تحكم الأدمن
              والإحصائيات
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              متابعة شاملة لإحصائيات المنصة، بيانات المستخدمين، وطلبات
              الاشتراكات.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gray-900 border border-gray-800 p-5 rounded-3xl space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-bold">إجمالي المستخدمين</span>
              <Users className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-2xl font-black text-white">
              {stats.totalUsers}
            </h3>
          </div>

          <div
            onClick={() => setActiveTab("teachers")}
            className="bg-gray-900 border border-gray-800 p-5 rounded-3xl space-y-2 shadow-sm cursor-pointer hover:border-purple-500/50 transition-all"
          >
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-bold">المعلمون المسجلون</span>
              <GraduationCap className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-2xl font-black text-purple-400">
              {stats.totalTeachers}
            </h3>
            <p className="text-[10px] text-purple-400/70">
              اضغط لعرض القائمة 👇
            </p>
          </div>

          <div
            onClick={() => setActiveTab("students")}
            className="bg-gray-900 border border-gray-800 p-5 rounded-3xl space-y-2 shadow-sm cursor-pointer hover:border-blue-500/50 transition-all"
          >
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-bold">الطلاب المسجلون</span>
              <UserCheck className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-2xl font-black text-blue-400">
              {stats.totalStudents}
            </h3>
            <p className="text-[10px] text-blue-400/70">اضغط لعرض القائمة 👇</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-5 rounded-3xl space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-bold">طلبات الحصص اللحظية</span>
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-black text-emerald-400">
              {stats.totalRequests}
            </h3>
          </div>

          <div
            onClick={() => setActiveTab("pending")}
            className="bg-gray-900 border border-gray-800 p-5 rounded-3xl space-y-2 shadow-sm cursor-pointer hover:border-amber-500/50 transition-all"
          >
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-bold">الطلبات المعلقة</span>
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-2xl font-black text-amber-400">
              {stats.pendingRequests}
            </h3>
            <p className="text-[10px] text-amber-400/70">
              مراجعة الاشتراكات 👇
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center flex-wrap gap-4 pt-4 border-t border-gray-900">
          <h2 className="text-lg font-extrabold">
            {activeTab === "students" && "قائمة الطلاب المسجلين بالمنصة 👨‍🎓"}
            {activeTab === "teachers" && "قائمة المعلمين المسجلين بالمنصة 👨‍🏫"}
            {activeTab === "pending" && "مراجعة طلبات الاشتراكات المعلقة ⏳"}
            {activeTab === "approved" && "اشتراكات المعلمين المقبولة ✅"}
            {activeTab === "rejected" && "طلبات الاشتراكات المرفوضة ❌"}
          </h2>

          <div className="flex bg-gray-900 p-1.5 rounded-2xl border border-gray-800 text-xs font-bold flex-wrap gap-1">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === "pending"
                  ? "bg-amber-500 text-black font-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> المعلقة
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === "students"
                  ? "bg-blue-600 text-white font-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" /> الطلاب (
              {stats.totalStudents})
            </button>
            <button
              onClick={() => setActiveTab("teachers")}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === "teachers"
                  ? "bg-purple-600 text-white font-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" /> المدرسين (
              {stats.totalTeachers})
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === "approved"
                  ? "bg-emerald-600 text-white font-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> المقبولة
            </button>
            <button
              onClick={() => setActiveTab("rejected")}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === "rejected"
                  ? "bg-red-600 text-white font-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <XCircle className="w-3.5 h-3.5" /> المرفوضة
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-4 shadow-xl relative overflow-hidden"
              >
                <div className="flex justify-between items-start border-b border-gray-800 pb-3">
                  <div>
                    <h3 className="font-extrabold text-base flex items-center gap-2">
                      {user.name || "مستخدم بدون اسم"}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {user.role === "teacher"
                        ? `👨‍🏫 معلم مادة: ${user.subject || "غير محدد"}`
                        : "🎓 طالب بالمرحلة الدراسية"}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      user.role === "student"
                        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        : user.role === "teacher"
                          ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                          : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {user.role === "student"
                      ? "طالب"
                      : user.role === "teacher"
                        ? `باقة: ${(user.subscription?.tier || "free").toUpperCase()}`
                        : user.role}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-gray-300">
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />{" "}
                    <strong>الإيميل:</strong> {user.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-400" />{" "}
                    <strong>الهاتف / الواتساب:</strong>{" "}
                    {user.phone || "غير مسجل"}
                  </p>
                  {user.role === "teacher" && (
                    <p>
                      <strong>المحافظة والمنطقة:</strong>{" "}
                      {user.governorate || "غير محدد"} - {user.area || ""}
                    </p>
                  )}
                </div>

                {user.subscription?.paymentReceipt &&
                  activeTab === "pending" && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-gray-400">
                        إيصال التحويل المرفق:
                      </span>
                      <div className="h-48 rounded-2xl overflow-hidden border border-gray-800 bg-black">
                        <img
                          src={user.subscription.paymentReceipt}
                          alt="Receipt"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}

                {activeTab === "pending" && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() =>
                        handleApprove(
                          user.id,
                          user.subscription?.requestedTier || "standard",
                        )
                      }
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-all cursor-pointer"
                    >
                      موافقة وتفعيل ✅
                    </button>
                    <button
                      onClick={() => handleReject(user.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-3 rounded-xl text-xs transition-all cursor-pointer"
                    >
                      رفض ❌
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-gray-900/50 rounded-3xl border border-gray-800">
              <p className="text-gray-400 text-sm font-semibold">
                لا توجد بيانات مطابقة لهذا القسم حالياً 📭
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
