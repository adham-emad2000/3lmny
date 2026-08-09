import React, { useState } from "react";
import { Link } from "react-router-dom";

function Auth() {
  // حالة التبديل بين تسجيل الدخول (true) وإنشاء حساب (false)
  const [isLogin, setIsLogin] = useState(true);

  // حالة دور المستخدم (طالب أو معلم)
  const [role, setRole] = useState("student");

  // حقول الإدخال للفورم
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    subject: "رياضيات",
    governorate: "القاهرة",
    grade: "أولى ثانوي",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      alert(`أهلاً بيك، جاري تسجيل الدخول بـ ${formData.email}`);
    } else {
      alert(
        `تم إنشاء حساب ${role === "teacher" ? "معلم" : "طالب"} بنجاح يا ${formData.name}! 🚀`,
      );
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-[calc(100vh-80px)] bg-[#F8F9FA] dark:bg-gray-950 py-12 px-6 flex items-center justify-center transition-colors duration-300"
    >
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200/80 dark:border-gray-800 shadow-xl space-y-6">
        {/* رأس الصفحة والشعار */}
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="text-3xl font-black text-navy dark:text-white inline-block"
          >
            علمني<span className="text-primary">.</span>
          </Link>
          <h2 className="text-xl font-extrabold text-navy dark:text-white">
            {isLogin ? "أهلاً بك مجدداً 👋" : "انضم إلى عائلة علمني 🚀"}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isLogin
              ? "سجل دخولك لتتمكن من الوصول لمفضلتك ومعلميك."
              : "اختر نوع الحساب وأدخل بياناتك للبدء فوراً."}
          </p>
        </div>

        {/* أزرار التبديل بين (تسجيل دخول / إنشاء حساب) */}
        <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl flex gap-2">
          <button
            onClick={() => setIsLogin(true)}
            className={`w-1/2 py-2.5 rounded-xl font-bold text-xs transition-all ${
              isLogin
                ? "bg-white dark:bg-gray-900 text-navy dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-navy dark:hover:text-white"
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`w-1/2 py-2.5 rounded-xl font-bold text-xs transition-all ${
              !isLogin
                ? "bg-white dark:bg-gray-900 text-navy dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-navy dark:hover:text-white"
            }`}
          >
            حساب جديد
          </button>
        </div>

        {/* اختيار الدور لو بنعمل حساب جديد (طالب / معلم) */}
        {!isLogin && (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`py-3 rounded-xl font-bold text-xs border transition-all ${
                role === "student"
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
              }`}
            >
              🎓 أنا طالب
            </button>
            <button
              type="button"
              onClick={() => setRole("teacher")}
              className={`py-3 rounded-xl font-bold text-xs border transition-all ${
                role === "teacher"
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
              }`}
            >
              👨‍🏫 أنا معلم
            </button>
          </div>
        )}

        {/* نموذج الإدخال (Form) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* الاسم (يظهر فقط في إنشاء الحساب) */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                الاسم الكامل
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder={role === "teacher" ? "أ. أحمد محمد" : "عمر طارق"}
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-navy dark:text-white focus:outline-none focus:border-primary"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
              البريد الإلكتروني
            </label>
            <input
              type="email5"
              name="email"
              required
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-navy dark:text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
              كلمة المرور
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-navy dark:text-white focus:outline-none focus:border-primary"
            />
          </div>

          {/* حقول إضافية خاصة بالمعلم عند التسجيل */}
          {!isLogin && role === "teacher" && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                  المادة الدراسية
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-navy dark:text-white focus:outline-none focus:border-primary"
                >
                  <option value="رياضيات">رياضيات</option>
                  <option value="فيزياء">فيزياء</option>
                  <option value="كيمياء">كيمياء</option>
                  <option value="لغة إنجليزية">لغة إنجليزية</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                  رقم الواتساب للتواصل
                </label>
                <input
                  type="text"
                  name="phone"
                  required
                  placeholder="201012345678"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-navy dark:text-white focus:outline-none focus:border-primary"
                />
              </div>
            </>
          )}

          {/* زر التنفيذ */}
          <button
            type="submit"
            className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-blue-500/20"
          >
            {isLogin ? "تسجيل الدخول" : "إنشاء الحساب الآن"}
          </button>
        </form>

        {/* تذييلة سريعة */}
        <div className="text-center pt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isLogin ? "ليس لديك حساب؟ " : "لديك حساب بالفعل؟ "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-bold hover:underline focus:outline-none"
            >
              {isLogin ? "إنشاء حساب جديد" : "سجل دخولك"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;
