import React, { useState } from "react";

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const faqs = [
    {
      question: "التفاوض على السعر بيتم إزاي؟",
      answer:
        "أول ما بتطلب الحصة، بيجيلك عروض من المدرسين المتاحين بسعرهم المقترح. بتقدر تقبل السعر علطول أو تقترح سعر تاني يناسب ميزانيتك لحد ما تتفقوا سوا.",
    },
    {
      question: "هل التسجيل على المنصة مجاني؟",
      answer:
        "أيوة طبعاً، التسجيل وعمل الحساب مجاني تماماً للطلاب والمعلمين من غير أي رسوم مخفية.",
    },
    {
      question: "إزاي السيستم بيلاقي لي مدرس قريب مني؟",
      answer:
        "بمجرد ما بتسجل وتحدد منطقتك والمحافظة، الموقع بيصفي لك المدرسين اللي شغالين في نفس محيطك الجغرافي بالظبط عشان تسهل الدنيا.",
    },
    {
      question: "الدروس بتتم أونلاين ولا في البيت؟",
      answer:
        "الموضوع راجع لاتفاقكم؛ ممكن تظبطوا حصة أونلاين مباشرة، أو درس حضوري في المكان اللي يناسبكم انتوا الاتنين.",
    },
    {
      question: "أنا مدرس.. إزاي أضمن طريقتي وشغلي؟",
      answer:
        "ليك حرية الاختيار ترحّب أو ترفض أي طلب حسب مواعيدك وسعرك، ومعاك لوحة تحكم تظبط بيها مواعيدك وحصصك بكل راحة.",
    },
    {
      question: "ينفع أغير المدرس لو حسيت إني مش مرتاح؟",
      answer:
        "أكيد عادي جداً، تقدر في أي وقت تلغي الطلب وتشوف مدرس تاني من حسابك من غير أي إحراج ولا تعقيد.",
    },
  ];

  const totalPages = Math.ceil(faqs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFaqs = faqs.slice(indexOfFirstItem, indexOfLastItem);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setOpenIndex(null);
  };

  return (
    <section
      dir="rtl"
      className="py-24 bg-[#F8F9FA] dark:bg-gray-950 relative overflow-hidden transition-colors duration-300"
    >
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* عنوان السيكشن */}
        <div className="text-center mb-16 space-y-4">
          <span className="bg-white dark:bg-gray-900 text-navy dark:text-white text-sm font-bold px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 shadow-xs inline-block">
            💡 الأسئلة المتكررة
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-navy dark:text-white">
            كل ما تريد معرفته عن منصة "علمني"
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-base">
            إجابات واضحة ومباشرة لكل التفاصيل اللي تدور في ذهنك.
          </p>
        </div>

        {/* قائمة الأسئلة */}
        <div className="space-y-4 mb-10">
          {currentFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-3xl border transition-all duration-300 shadow-xs overflow-hidden ${
                  isOpen
                    ? "bg-blue-50/40 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 shadow-md scale-[1.01]"
                    : "bg-gray-50/70 dark:bg-gray-900 border-gray-200/90 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 text-right flex justify-between items-center gap-4 focus:outline-none"
                >
                  <span className="text-base lg:text-lg font-bold text-navy dark:text-white">
                    {faq.question}
                  </span>

                  <span
                    className={`w-9 h-9 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center font-bold text-navy dark:text-white transition-transform duration-300 shrink-0 shadow-2xs ${isOpen ? "rotate-180 bg-navy dark:bg-primary text-white border-navy dark:border-primary" : ""}`}
                  >
                    ↓
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 text-gray-700 dark:text-gray-300 text-sm lg:text-base leading-relaxed border-t border-gray-200/40 dark:border-gray-800 animate-fadeIn">
                    <p className="bg-white dark:bg-gray-800/80 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-inner">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* أزرار التنقل (Pagination) */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (number) => (
                <button
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={`w-11 h-11 rounded-2xl font-extrabold text-sm transition-all duration-300 border ${
                    currentPage === number
                      ? "bg-navy dark:bg-primary text-white border-navy dark:border-primary shadow-lg scale-105"
                      : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {number}
                </button>
              ),
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default FAQ;
