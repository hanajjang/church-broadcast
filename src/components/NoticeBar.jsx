import { useState, useEffect } from "react";
import { fetchSheet, DEMO_DATA, CONFIG } from "../config/sheets";

export default function NoticeBar({ darkMode, onNavigate }) {
  const [notices, setNotices] = useState([]);
  const [current, setCurrent] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    async function load() {
      const data = CONFIG.SHEET_ID === "YOUR_GOOGLE_SHEET_ID"
        ? DEMO_DATA.notice
        : await fetchSheet("Notice") || DEMO_DATA.notice;
      setNotices(data.filter(n => n.중요도 === "high" || n.중요도 === "normal"));
    }
    load();
  }, []);

  useEffect(() => {
    if (notices.length <= 1) return;
    const timer = setInterval(() => setCurrent(c => (c + 1) % notices.length), 4000);
    return () => clearInterval(timer);
  }, [notices]);

  if (!notices.length) return null;
  const notice = notices[current];

  return (
    <>
      <div
        className={`relative flex items-center gap-3 px-4 py-2 text-sm cursor-pointer select-none transition-colors ${
          darkMode ? "bg-amber-600 text-white" : "bg-amber-500 text-white"
        }`}
        onClick={() => setShowPopup(true)}
      >
        <span className="flex-shrink-0 font-bold text-xs bg-white text-amber-600 px-2 py-0.5 rounded-full">
          공지
        </span>
        <span className="flex-1 truncate font-medium">{notice?.제목}</span>
        <span className="flex-shrink-0 text-amber-100 text-xs">클릭하여 보기 →</span>
      </div>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowPopup(false)}>
          <div
            className={`w-full max-w-md mx-4 rounded-2xl shadow-2xl p-6 ${darkMode ? "bg-gray-900 border border-gray-700" : "bg-white"}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-amber-500 uppercase tracking-wide">공지사항</span>
                <h3 className="text-lg font-bold mt-1">{notice?.제목}</h3>
                <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{notice?.날짜}</p>
              </div>
              <button onClick={() => setShowPopup(false)} className={`text-xl leading-none ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-400 hover:text-gray-700"}`}>✕</button>
            </div>
            <p className={`text-sm leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{notice?.내용}</p>
            <button
              onClick={() => { setShowPopup(false); onNavigate(); }}
              className="mt-5 w-full py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
            >
              전체 공지사항 보기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
