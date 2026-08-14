import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { ArrowRight, ExternalLink, Clock, User } from "lucide-react";

function AssignmentSubmissions() {
  const { roomId, assignmentId } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(null);

  useEffect(() => {
    const checkOwnership = async () => {
      try {
        const roomSnap = await getDoc(doc(db, "rooms", roomId));
        setIsOwner(
          roomSnap.exists() &&
            roomSnap.data().teacherId === auth.currentUser?.uid,
        );
      } catch (err) {
        console.error(err);
        setIsOwner(false);
      }
    };
    checkOwnership();
  }, [roomId]);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const docRef = doc(db, "rooms", roomId, "assignments", assignmentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAssignment(docSnap.data());
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAssignment();
  }, [roomId, assignmentId]);

  useEffect(() => {
    const q = query(
      collection(
        db,
        "rooms",
        roomId,
        "assignments",
        assignmentId,
        "submissions",
      ),
      orderBy("submittedAt", "desc"),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSubmissions(subs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId, assignmentId]);

  if (isOwner === null || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0b0c10] flex items-center justify-center font-mono text-blue-600">
        جاري التحميل...
      </div>
    );
  }

  if (isOwner === false) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0b0c10] text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center text-center px-4">
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-8 rounded-3xl max-w-sm">
          <h1 className="text-2xl font-black text-red-500 mb-2">
            ممنوع الاقتراب 🚫
          </h1>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            هذه التسليمات ليست خاصة بروم تملكه.
          </p>
          <button
            onClick={() => navigate("/teacher-rooms")}
            className="mt-4 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-2xl transition-all text-sm cursor-pointer"
          >
            العودة لرومك
          </button>
        </div>
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
              onClick={() => navigate(-1)}
              className="text-slate-500 dark:text-slate-400 text-xs font-bold flex items-center gap-1 mb-1 cursor-pointer"
            >
              <ArrowRight size={14} /> العودة للواجبات
            </button>
            <h1 className="text-2xl font-black">
              {assignment?.title || "تفاصيل الواجب"}{" "}
              <span className="text-blue-600">| تسليمات الطلاب</span>
            </h1>
          </div>
          <span className="bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold px-4 py-2 rounded-full border border-blue-200 dark:border-blue-500/20 font-mono">
            {submissions.length} طالب سلموا الحل ✅
          </span>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-black px-1">قائمة حلول الطلاب</h3>
          {submissions.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/10 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100 dark:border-blue-500/20">
                      <User size={22} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base">
                        {sub.studentName || "طالب"}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-mono">
                        <Clock size={13} />
                        {sub.submittedAt?.toDate
                          ? new Date(sub.submittedAt.toDate()).toLocaleString(
                              "ar-EG",
                            )
                          : "منذ قليل"}
                      </p>
                    </div>
                  </div>

                  {sub.fileUrl && (
                    <a
                      href={sub.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white text-xs px-6 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <span>معاينة حل الطالب</span> <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-[#12141c] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
              <p className="text-slate-500 text-sm font-bold">
                لم يقم أي طالب بتسليم هذا الواجب حتى الآن 📭
              </p>
              <p className="text-slate-400 text-xs mt-1">
                ستظهر حلول الطلاب هنا لحظياً بمجرد إرسالها.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssignmentSubmissions;
