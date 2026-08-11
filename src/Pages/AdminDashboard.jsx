import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { Clock, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // pending, approved, rejected

  const ADMIN_EMAIL = "your-email@example.com"; // 👈 حط إيميلك هنا
  const currentUserEmail = auth.currentUser?.email;

  const fetchAllUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const allUsers = querySnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setUsers(allUsers);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // دالة حساب مدة الاشتراك بدقة حسب الباقة: Standard = 3 شهور، Pro = 6 شهور
  // بتتحسب من لحظة الموافقة نفسها (مش من وقت رفع الإيصال)
  const getExpiryDateForTier = (tier) => {
    const date = new Date();
    const normalizedTier = (tier || "").toLowerCase();
    if (normalizedTier === "standard") {
      date.setMonth(date.getMonth() + 3);
    } else if (normalizedTier === "pro") {
      date.setMonth(date.getMonth() + 6);
    } else {
      // fallback احتياطي في حالة قيمة غير متوقعة، افتراضي 3 شهور
      date.setMonth(date.getMonth() + 3);
    }
    return date.toISOString();
  };

  // الموافقة على الطلب وتحويله للباقة الجديدة
  const handleApprove = async (userId, requestedTier) => {
    try {
      const userRef = doc(db, "users", userId);
      const calculatedExpiry = getExpiryDateForTier(requestedTier);

      await updateDoc(userRef, {
        "subscription.tier": requestedTier,
        "subscription.status": "active",
        "subscription.requestStatus": "approved", // أرشفة الطلب كمقبول
        "subscription.requestedTier": null,
        "subscription.paymentReceipt": null,
        "subscription.startDate": new Date().toISOString(),
        "subscription.expiryDate": calculatedExpiry,
        "subscription.tempExpiryDate": null, // تنظيف القيمة المؤقتة بعد التفعيل الفعلي
      });
      alert("✅ تمت الموافقة وتفعيل باقة المعلم بنجاح!");
      fetchAllUsers();
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء التفعيل.");
    }
  };

  // رفض الطلب وإبقاؤه على باقته القديمة
  const handleReject = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        "subscription.status": "active",
        "subscription.requestStatus": "rejected", // أرشفة الطلب كمرفوض
        "subscription.requestedTier": null,
        "subscription.paymentReceipt": null,
        "subscription.tempExpiryDate": null,
      });
      alert("❌ تم رفض الطلب وإبقاء المعلم على باقته السابقة.");
      fetchAllUsers();
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
      <div className="text-center py-20 text-white bg-gray-950 min-h-screen">
        جاري التحميل...
      </div>
    );

  // تصفية المستخدمين بناءً على التبويب النشط
  const filteredUsers = users.filter((u) => {
    const reqStatus = u.subscription?.requestStatus;
    if (activeTab === "pending") return reqStatus === "pending";
    if (activeTab === "approved") return reqStatus === "approved";
    if (activeTab === "rejected") return reqStatus === "rejected";
    return false;
  });

  return (
    <div dir="rtl" className="min-h-screen bg-gray-950 text-white py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-primary" /> لوحة تحكم الأدمن
              والطلبات
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              إدارة ومراجعة اشتراكات المعلمين بدقة وأمان تام.
            </p>
          </div>

          {/* تبويبات التنقل بين الطلبات */}
          <div className="flex bg-gray-900 p-1.5 rounded-2xl border border-gray-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === "pending"
                  ? "bg-amber-500 text-black font-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Clock className="w-4 h-4" /> الطلبات المعلقة
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === "approved"
                  ? "bg-emerald-600 text-white font-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" /> المقبولة
            </button>
            <button
              onClick={() => setActiveTab("rejected")}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === "rejected"
                  ? "bg-red-600 text-white font-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <XCircle className="w-4 h-4" /> المرفوضة
            </button>
          </div>
        </div>

        {/* عرض الكاردز حسب التبويب */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-4 shadow-xl relative overflow-hidden"
              >
                <div className="flex justify-between items-start border-b border-gray-800 pb-3">
                  <div>
                    <h3 className="font-extrabold text-base">{user.name}</h3>
                    <p className="text-xs text-purple-400">
                      {user.subject} - {user.governorate}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      activeTab === "pending"
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        : activeTab === "approved"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : "bg-red-500/20 text-red-400 border-red-500/30"
                    }`}
                  >
                    {activeTab === "pending"
                      ? `طلب باقة: ${(user.subscription.requestedTier || "").toUpperCase()}`
                      : activeTab === "approved"
                        ? `الباقة المفعلة: ${(user.subscription.tier || "").toUpperCase()}`
                        : "طلب مرفوض"}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-gray-300">
                  <p>
                    <strong>الهاتف:</strong> {user.phone}
                  </p>
                  <p>
                    <strong>الإيميل:</strong> {user.email}
                  </p>
                </div>

                {user.subscription.paymentReceipt &&
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

                {/* أزرار الإجراءات تظهر فقط للطلبات المعلقة */}
                {activeTab === "pending" && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() =>
                        handleApprove(
                          user.id,
                          user.subscription.requestedTier || "standard",
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
                {activeTab === "pending"
                  ? "لا توجد طلبات اشتراك معلقة حالياً 📭"
                  : activeTab === "approved"
                    ? "لا توجد طلبات تم قبولها مسبقاً 📂"
                    : "لا توجد طلبات مرفوضة 📂"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
