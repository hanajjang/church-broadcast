import { useState, useEffect } from "react";
import { fetchSheet, DEMO_DATA, CONFIG } from "../config/sheets";

export default function NoticeBar({ onNavigate }) {
  const [notices, setNotices] = useState([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    async function load() {
      if (CONFIG.SHEET_ID === "YOUR_GOOGLE_SHEET_ID") {
        setNotices(DEMO_DATA.notice.filter(n => n.중요도 === "high"));
        return;
      }
      const data = await fetchSheet("Notice");
      if (data) setNotices(data.filter(n => n.중요도 === "high"));
    }
    load();
  }, []);

  useEffect(() => {
    if (notices.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % notices.length), 4000);
    return () => clearInterval(t);
  }, [notices]);

  if (!notices.length) return null;
  const notice = notices[idx];

  return (
    <div className="bg-[#2563eb] text-white text-sm flex items-center px-4 py-2 gap-3 flex-shrink-0">
      <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">공지</span>
      <span className="flex-1 truncate font-medium">{notice?.제목}</span>
      <button
        onClick={onNavigate}
        className="text-xs text-blue-100 hover:text-white flex-shrink-0 underline"
      >
        클릭하여 보기 →
      </button>
    </div>
  );
}
