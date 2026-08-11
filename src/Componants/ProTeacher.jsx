import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, getDocs } from "firebase/firestore";

function ProTeacher() {
  const [proTeachers, setProTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const getWhatsAppUrl = (phone, teacherName) => {
    if (!phone) return "#";
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "20" + cleaned.slice(1);
    } else if (!cleaned.startsWith("20")) {
      cleaned = "20" + cleaned;
    }
    return `https://api.whatsapp.com/send?phone=+${cleaned}&text=${encodeURIComponent(
      `أهلاً يا أستاذ ${teacherName}، وجدتك في قائمة المعلمين المميزين (باقة Pro) على منصة علمني وأرغب في الاستفسار عن حصة.`,
    )}`;
  };

  useEffect(() => {
    const fetchProTeachers = async () => {
      try {
        const q = query(collection(db, "users"));
        const querySnapshot = await getDocs(q);
        const teachersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const filtered = teachersList.filter(
          (t) =>
            t.role === "teacher" &&
            t.subscription &&
            t.subscription.tier &&
            t.subscription.tier.toLowerCase() === "pro" &&
            t.subscription.status === "active",
        );

        setProTeachers(filtered);
      } catch (error) {
        console.error("Error fetching pro teachers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProTeachers();
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTeachers = proTeachers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(proTeachers.length / itemsPerPage);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (proTeachers.length === 0) {
    return null;
  }

  return (
    <section
      className="py-16 px-6 bg-gradient-to-b from-transparent to-purple-50/50 dark:to-gray-900/50"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl lg:text-3xl font-black text-navy dark:text-white">
            اقتراحات افضل المدرسين
          </h2>
          <p className="text-gray-500 text-xs">
            اختر من أفضل المعلمين المعتمدين في منصة علمني.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentTeachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 border-2 border-purple-500/50 dark:border-purple-600/50 shadow-xl shadow-purple-500/10 flex flex-col justify-between space-y-4 relative overflow-hidden transition-all hover:-translate-y-1"
            >
              <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-r from-purple-600 to-primary"></div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                  {teacher.avatarUrl ? (
                    <img
                      src={teacher.avatarUrl}
                      alt={teacher.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">
                      👨‍🏫
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-navy dark:text-white text-base">
                      أ. {teacher.name}
                    </h3>
                    <span className="text-[10px] bg-purple-600 text-white px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                      متميز ومقترح
                    </span>
                  </div>
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
                    {teacher.subject}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3.5 rounded-2xl">
                <div className="flex justify-between">
                  <span>المحافظة:</span>
                  <strong className="text-navy dark:text-white">
                    {teacher.governorate} - {teacher.area}
                  </strong>
                </div>

                {/* 👈 عرض الصفوف الدراسية في قسم الكارد الرئيسي */}
                <div className="flex flex-col gap-1">
                  <span>الصفوف:</span>
                  <div className="flex flex-wrap gap-1">
                    {teacher.grades && teacher.grades.length > 0 ? (
                      teacher.grades.map((g, idx) => (
                        <span
                          key={idx}
                          className="bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-md"
                        >
                          {g}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400">غير محدد</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <span>الوسيلة:</span>
                  <strong className="text-navy dark:text-white">
                    {teacher.teachingType}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>السعر:</span>
                  <strong className="text-emerald-600">{teacher.price}</strong>
                </div>
              </div>

              <a
                href={getWhatsAppUrl(teacher.phone, teacher.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs text-center transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>تواصل عبر واتساب 💬</span>
              </a>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 pt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-bold disabled:opacity-50 cursor-pointer"
            >
              السابق
            </button>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
              صفحة {currentPage} من {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-bold disabled:opacity-50 cursor-pointer"
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProTeacher;
