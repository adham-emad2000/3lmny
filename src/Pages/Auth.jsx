import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isCreatingAccount = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !isCreatingAccount.current) {
        navigate("/", { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // قاعدة بيانات المحافظات والمناطق
  const egyptRegions = {
    القاهرة: [
      "مدينة نصر",
      "مصر الجديدة",
      "المعادي",
      "التجمع الخامس",
      "المهندسين",
      "شبرا",
      "عين شمس",
      "المرج",
    ],
    الجيزة: [
      "الدقي",
      "المهندسين",
      "الشيخ زايد",
      "6 أكتوبر",
      "الهرم",
      "فيصل",
      "إمبابة",
    ],
    الإسكندرية: [
      "سموحة",
      "ميامي",
      "العصافرة",
      "سيدي بشر",
      "المنشية",
      "الإبراهيمية",
    ],
    القليوبية: ["بنها", "شبرا الخيمة", "قليوب", "الخانكة", "قها"],
    الدقهلية: ["المنصورة", "دكرنس", "ميت غمر", "سنبلاوين", "بلقاس"],
    الشرقية: ["زقازيق", "بلبيس", "منيا القمح", "فاقوس", "العصينة"],
    الغربية: ["طنطا", "المحلة الكبرى", "زفتى", "كفر الزيات"],
    المنوفية: ["شبين الكوم", "منوف", "السادات", "قويسنا"],
    البحيرة: ["دمنهور", "كفر الدوار", "رشيد", "إيتاي البارود"],
    بورسعيد: ["الزهور", "المناخ", "الشرق", "بورفؤاد"],
    السويس: ["السويس", "الأربعين", "فيصل", "عتاقة"],
    الإسماعيلية: ["الإسماعيلية", "فايد", "القنطرة غرب", "البلطيم"],
    أسوان: ["أسوان", "كوم أمبو", "إدفو", "أسوان الجديدة"],
    أسيوط: ["أسيوط", "أسيوط الجديدة", "أبو تيج", "منفلوط"],
    الفيوم: ["الفيوم", "الفيوم الجديدة", "سنورس", "إهناسيا"],
    الأقصر: ["الأقصر", "إسنا", "أرمنت"],
    "البحر الأحمر": ["الغردقة", "سفاجا", "رأس غارب", "مرسى علم"],
    "جنوب سيناء": ["شرم الشيخ", "دهب", "نويبع", "طابا"],
    "بني سويف": ["بني سويف", "بني سويف الجديدة", "الواسطى"],
    المنيا: ["المنيا", "المنيا الجديدة", "ملوي", "بني مزار"],
    سوهاج: ["سوهاج", "سوهاج الجديدة", "جهينة", "طما"],
    قنا: ["قنا", "قنا الجديدة", "نجع حمادي", "دشنا"],
    مطروح: ["مرسى مطروح", "الحمام", "العلمين", "سيدي براني"],
    "كفر الشيخ": ["كفر الشيخ", "دسوق", "بيلا", "فوة"],
    دمياط: ["دمياط", "دمياط الجديدة", "رأس البر", "فارسكور"],
    "الوادي الجديد": ["خارجة", "داخلة", "باريس"],
    "شمال سيناء": ["العريش", "بئر العبد", "رفح"],
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    subject: "رياضيات",
    governorate: "القاهرة",
    area: "",
    teachingType: "أونلاين وفي البيت",
    priceMode: "fixed",
    priceValue: "150",
  });

  const [selectedGrades, setSelectedGrades] = useState([]);

  const handleGradeToggle = (grade) => {
    if (selectedGrades.includes(grade)) {
      setSelectedGrades(selectedGrades.filter((g) => g !== grade));
    } else {
      setSelectedGrades([...selectedGrades, grade]);
    }
  };

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGovernorateChange = (e) => {
    const selectedGov = e.target.value;
    setFormData({
      ...formData,
      governorate: selectedGov,
      area: egyptRegions[selectedGov] ? egyptRegions[selectedGov][0] : "",
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // دالة ضغط الصورة وتصغير حجمها قبل تحويلها لـ Base64
  const compressAndConvertImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          const MAX_WIDTH = 200;
          const MAX_HEIGHT = 200;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(compressedDataUrl);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("صيغة البريد الإلكتروني غير صحيحة.");
      setLoading(false);
      return;
    }

    if (!isLogin) {
      const password = formData.password;
      if (
        password.length < 6 ||
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password) ||
        !/[0-9]/.test(password)
      ) {
        setErrorMessage(
          "كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل، حرف كبير، حروف صغيرة، وأرقام.",
        );
        setLoading(false);
        return;
      }

      if (role === "teacher") {
        const phoneRegex = /^01[0125][0-9]{8}$/;
        if (!phoneRegex.test(formData.phone)) {
          setErrorMessage(
            "رقم الواتساب غير صحيح. يجب أن يكون رقم مصري صحيح مكون من 11 رقم (مثال: 01012345678).",
          );
          setLoading(false);
          return;
        }

        if (selectedGrades.length === 0) {
          setErrorMessage("يرجى اختيار صف دراسي واحد على الأقل تقوم بشرحه.");
          setLoading(false);
          return;
        }
      }
    }

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password,
        );
        const user = userCredential.user;

        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          localStorage.setItem(
            "elemny_user_data",
            JSON.stringify(docSnap.data()),
          );
        }

        navigate("/", { replace: true });
      } else {
        isCreatingAccount.current = true;

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password,
        );
        const user = userCredential.user;

        let avatarUrl = "";
        if (avatar) {
          avatarUrl = await compressAndConvertImage(avatar);
        }

        let finalPrice = "غير معلن (حسب الاتفاق)";
        if (role === "teacher") {
          if (
            formData.priceMode === "fixed" ||
            formData.priceMode === "range"
          ) {
            finalPrice = `${formData.priceValue} ج / الحصة`;
          } else {
            finalPrice = "غير معلن (حسب الاتفاق)";
          }
        }

        const newUserData = {
          uid: user.uid,
          name: formData.name,
          email: formData.email,
          role: role,
          phone: role === "teacher" ? formData.phone : "",
          subject: role === "teacher" ? formData.subject : "",
          grades: role === "teacher" ? selectedGrades : [],
          governorate: role === "teacher" ? formData.governorate : "",
          area: role === "teacher" ? formData.area : "",
          teachingType: role === "teacher" ? formData.teachingType : "",
          price: role === "teacher" ? finalPrice : "",
          avatarUrl: avatarUrl,
          // 🚀 الحقل الجديد الخاص بنظام الباقات للمدرسين (افتراضياً free)
          subscription: {
            tier: "free",
            expiryDate: null,
          },
          createdAt: new Date().toISOString(),
        };

        await setDoc(doc(db, "users", user.uid), newUserData);
        await signOut(auth);

        setSuccessMessage("تم إنشاء الحساب بنجاح! تفضل بتسجيل الدخول.");
        setIsLogin(true);
        setFormData({ ...formData, password: "" });
        setSelectedGrades([]);
        setAvatar(null);
        setAvatarPreview(null);

        isCreatingAccount.current = false;
      }
    } catch (error) {
      console.error(error);
      isCreatingAccount.current = false;

      if (error.code === "auth/email-already-in-use") {
        setErrorMessage("البريد الإلكتروني مستخدم بالفعل.");
      } else if (error.code === "auth/invalid-email") {
        setErrorMessage("صيغة البريد غير صحيحة.");
      } else if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-credential"
      ) {
        setErrorMessage("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      } else {
        setErrorMessage("حدث خطأ، يرجى المحاولة مرة أخرى.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#F8F9FA] dark:bg-gray-950 py-12 px-6 flex items-center justify-center transition-colors duration-300"
    >
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200/80 dark:border-gray-800 shadow-xl space-y-6">
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
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-xs font-bold text-center">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-xl text-xs font-bold text-center">
            {successMessage}
          </div>
        )}

        <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl flex gap-2">
          <button
            onClick={() => {
              setIsLogin(true);
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className={`w-1/2 py-2.5 rounded-xl font-bold text-xs transition-all ${
              isLogin ? "bg-white text-navy shadow-sm" : "text-gray-500"
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className={`w-1/2 py-2.5 rounded-xl font-bold text-xs transition-all ${
              !isLogin ? "bg-white text-navy shadow-sm" : "text-gray-500"
            }`}
          >
            حساب جديد
          </button>
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="flex flex-col items-center justify-center space-y-2 pt-1 pb-2">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full border-2 border-primary/30 overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 shadow-inner">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">📷</span>
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-md cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                الاسم الكامل
              </label>
              <input
                type="text"
                name="name"
                required
                autoComplete="name"
                placeholder="الاسم"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-navy dark:text-white outline-none focus:border-primary"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-navy dark:text-white outline-none focus:border-primary"
            />
            {!isLogin && (
              <p className="text-[11px] text-gray-400 mt-1">
                يرجى إدخال البريد الإلكتروني بشكل صحيح (مثال: name@domain.com)
                لاستخدامه في تسجيل الدخول.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pl-10 text-sm text-navy dark:text-white outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 focus:outline-none"
              >
                {showPassword ? "👁️‍🗨️" : "👁️"}
              </button>
            </div>
          </div>

          {/* حقول المعلم الإضافية */}
          {!isLogin && role === "teacher" && (
            <>
              {/* المحافظة */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                  المحافظة
                </label>
                <select
                  name="governorate"
                  value={formData.governorate}
                  onChange={handleGovernorateChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-navy dark:text-white outline-none focus:border-primary"
                >
                  {Object.keys(egyptRegions).map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
              </div>

              {/* المنطقة */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                  المنطقة أو الحي
                </label>
                <select
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-navy dark:text-white outline-none focus:border-primary"
                >
                  <option value="">اختار المنطقة...</option>
                  {egyptRegions[formData.governorate]?.map((ar) => (
                    <option key={ar} value={ar}>
                      {ar}
                    </option>
                  ))}
                </select>
              </div>

              {/* المادة الدراسية */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                  المادة الدراسية
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-navy dark:text-white outline-none focus:border-primary"
                >
                  <optgroup label="المواد العلمية والرياضية">
                    <option value="رياضيات">رياضيات</option>
                    <option value="فيزياء">فيزياء</option>
                    <option value="كيمياء">كيمياء</option>
                    <option value="أحياء">أحياء</option>
                    <option value="جيولوجيا">جيولوجيا</option>
                    <option value="علوم">علوم</option>
                  </optgroup>
                  <optgroup label="اللغات">
                    <option value="لغة عربية">لغة عربية</option>
                    <option value="لغة إنجليزية">لغة إنجليزية</option>
                    <option value="لغة فرنسية">لغة فرنسية</option>
                    <option value="لغة ألمانية">لغة ألمانية</option>
                  </optgroup>
                  <optgroup label="المواد الأدبية والفلسفية">
                    <option value="تاريخ">تاريخ</option>
                    <option value="جغرافيا">جغرافيا</option>
                    <option value="فلسفة">فلسفة ومنطق</option>
                    <option value="علم نفس">علم نفس واجتماع</option>
                    <option value="دراسات اجتماعية">دراسات اجتماعية</option>
                  </optgroup>
                  <optgroup label="مواضيع أخرى">
                    <option value="حاسب آلي">حاسب آلي وتكنولوجيا</option>
                  </optgroup>
                </select>
              </div>

              {/* الصفوف الدراسية (متعددة) */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-2">
                  الصفوف الدراسية التي تقوم بشرحها (يمكن اختيار أكثر من صف):
                </label>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3 max-h-48 overflow-y-auto">
                  {[
                    {
                      stage: "المرحلة الابتدائية",
                      grades: [
                        "أولى ابتدائي",
                        "تانية ابتدائي",
                        "تالتة ابتدائي",
                        "رابعة ابتدائي",
                        "خامسة ابتدائي",
                        "سادسة ابتدائي",
                      ],
                    },
                    {
                      stage: "المرحلة الإعدادية",
                      grades: ["أولى إعدادي", "تانية إعدادي", "تالتة إعدادي"],
                    },
                    {
                      stage: "المرحلة الثانوية",
                      grades: ["أولى ثانوي", "تانية ثانوي", "تالتة ثانوي"],
                    },
                  ].map((group) => (
                    <div key={group.stage} className="space-y-1">
                      <p className="text-[11px] font-bold text-primary dark:text-blue-400">
                        {group.stage}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {group.grades.map((grade) => (
                          <label
                            key={grade}
                            className="flex items-center gap-2 text-xs text-navy dark:text-gray-200 cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={selectedGrades.includes(grade)}
                              onChange={() => handleGradeToggle(grade)}
                              className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
                            />
                            {grade}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* رقم الواتساب */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                  رقم الواتساب للتواصل
                </label>
                <input
                  type="text"
                  name="phone"
                  required
                  autoComplete="tel"
                  placeholder="01012345678"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-navy dark:text-white outline-none focus:border-primary"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  يجب أن يكون رقماً مصرياً صحيحاً يتكون من 11 رقماً ويبدأ بـ 01.
                </p>
              </div>

              {/* وسيلة التدريس */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                  نوع وسيلة التدريس المتاحة
                </label>
                <select
                  name="teachingType"
                  value={formData.teachingType}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-navy dark:text-white outline-none focus:border-primary"
                >
                  <option value="أونلاين وفي البيت">أونلاين وفي البيت</option>
                  <option value="أونلاين فقط">أونلاين فقط</option>
                  <option value="حضور في البيت فقط">حضور في البيت فقط</option>
                </select>
              </div>

              {/* سعر الحصة */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                  نظام وسعر الحصة
                </label>
                <select
                  name="priceMode"
                  value={formData.priceMode}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-navy dark:text-white outline-none focus:border-primary mb-2"
                >
                  <option value="fixed">سعر ثابت محدد</option>
                  <option value="range">رينج أسعار (من - إلى)</option>
                  <option value="negotiable">غير معلن (حسب الاتفاق)</option>
                </select>

                {formData.priceMode !== "negotiable" && (
                  <input
                    type="text"
                    name="priceValue"
                    required
                    placeholder={
                      formData.priceMode === "fixed"
                        ? "مثال: 150"
                        : "مثال: 200 - 300"
                    }
                    value={formData.priceValue}
                    onChange={handleChange}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-navy dark:text-white outline-none focus:border-primary"
                  />
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-blue-700 flex items-center justify-center text-white font-bold py-3.5 rounded-xl text-sm transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isLogin ? (
              "تسجيل الدخول"
            ) : (
              "إنشاء الحساب"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Auth;
