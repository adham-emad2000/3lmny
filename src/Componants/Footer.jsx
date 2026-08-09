import React from "react";

function Footer() {
  return (
    <footer
      dir="rtl"
      className="bg-[#0b1329] text-white pt-16 pb-12 border-t border-gray-800"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* العمود الأول: الشعار والنبذة */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-2xl font-black tracking-wide text-white">
              علمني <span className="text-primary">.</span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              منصة "علمني" بتربط الطالب بأفضل المعلمين في محيطه الجغرافي مباشرة،
              مع نظام تفاوض مرن على السعر لضمان مصلحة الطرفين.
            </p>
          </div>

          {/* العمود التاني: روابط سريعة */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
              أقسام الموقع
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  الرئيسية
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  إزاي بتشتغل؟
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  المميزات
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  الأسئلة الشائعة
                </a>
              </li>
            </ul>
          </div>

          {/* العمود التالت: ابدأ معانا */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
              ابدأ معانا
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  ابحث عن معلم
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  انضم كمعلم
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  تسجيل الدخول
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* خط الفاصل وحقوق النشر */}
        <div className="border-t border-gray-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} منصة "علمني". كل الحقوق محفوظة.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-400 transition-colors">
              سياسة الخصوصية
            </a>
            <a href="#" className="hover:text-gray-400 transition-colors">
              شروط الاستخدام
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
