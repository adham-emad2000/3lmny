import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⚠️ ضع إيميلك هنا حصرياً لكي تفتح لك أنت فقط
  const ADMIN_EMAIL = "your-email@example.com";
  const currentUserEmail = auth.currentUser?.email;

  const fetchPendingRequests = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const users = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      // جلب المدرسين الذين حالتهم pending ولديهم طلب اشتراك
      const pending = users.filter(
        (u) => u.subscription && u.subscription.status === "pending",
      );
      setPendingUsers(pending);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleApprove = async (userId, tier) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        "subscription.status": "active",
        "subscription.expiryDate": new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      });
      alert("✅ تم تفعيل باقة المعلم بنجاح!");
      fetchPendingRequests();
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء التفعيل.");
    }
  };

  const handleReject = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        subscription: { tier: "free", status: "active", expiryDate: null },
      });
      alert("❌ تم رفض الطلب وإعادة الحساب للباقة المجانية.");
      fetchPendingRequests();
    } catch (error) {
      console.error(error);
    }
  };

  if (currentUserEmail !== ADMIN_EMAIL) {
    return (
      <div
        dir="rtl"
        className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-6"
      >
        <div className="bg-red-950/40 border border-red-900 p-8 rounded-3xl text-center space-y-3">
          <h1 className="text-2xl font-black text-red-500">
            ممنوع الاقتراب 🚫
          </h1>
          <p className="text-xs text-gray-400">
            هذه الصفحة مخصصة للأدمن الرئيسي فقط.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-white">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-950 text-white py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black">لوحة تحكم الأدمن 🛡️</h1>
          <p className="text-xs text-gray-400">
            مراجعة إيصالات تحويل اشتراكات المعلمين وتفعيلها.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingUsers.length > 0 ? (
            pendingUsers.map((user) => (
              <div
                key={user.id}
                className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-4 shadow-xl"
              >
                <div className="flex justify-between items-start border-b border-gray-800 pb-3">
                  <div>
                    <h3 className="font-extrabold text-base">{user.name}</h3>
                    <p className="text-xs text-purple-400">
                      {user.subject} - {user.governorate}
                    </p>
                  </div>
                  <span className="text-xs bg-amber-500/20 text-amber-400 font-bold px-3 py-1 rounded-full border border-amber-500/30">
                    طالب باقة: {user.subscription.tier.toUpperCase()}
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

                {user.subscription.paymentReceipt && (
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

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() =>
                      handleApprove(user.id, user.subscription.tier)
                    }
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-all"
                  >
                    موافقة وتفعيل ✅
                  </button>
                  <button
                    onClick={() => handleReject(user.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-3 rounded-xl text-xs transition-all"
                  >
                    رفض ❌
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-gray-900 rounded-3xl border border-gray-800">
              <p className="text-gray-400 text-sm font-semibold">
                لا توجد طلبات اشتراك معلقة حالياً 📭
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
