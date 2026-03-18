import { useState, useEffect } from "react";
import { fetchSheet, DEMO_DATA, CONFIG } from "../config/sheets";

const NOTICE_SHEETS_URL = `https://docs.google.com/spreadsheets/d/1TlWKZ5tr531kNZMBLLwb4PjX6ON1JY03i4fHrvJE6OM/edit#gid=Notice`;

export default function Notice() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    if (CONFIG.SHEET_ID === "YOUR_GOOGLE_SHEET_ID") { setNotices(DEMO_DATA.notice); setLoading(false); return; }
    const data = await fetchSheet("Notice");
    setNotices(data || DEMO_DATA.notice);
    setLoading(false);
  }

  const sorted = [...notices].sort((a, b) => {
    if (a.중요도 === "high" && b.중요도 !== "high") return -1;
    if (b.중요도 === "high" && a.중요도 !== "high") return 1;
    return (b.날짜 || "").localeCompare(a.날짜 || "");
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#0f172a]">📢 공지사항</h1>
          <p className="text-sm mt-1 text-[#64748b]">방송부 공지 및 안내</p>
        </div>
        <a href={NOTICE_SHEETS_URL} target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2563eb] text-white text-xs font-semibold hover:bg-[#1d4ed8] transition-colors shadow-sm">
          <span>📝</span><span>공지 작성</span>
        </a>
      </div>

      {/* 안내 배너 */}
      <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5 text-sm bg-[#eff6ff] border border-[#bfdbfe] text-[#1e40af]">
        <span>✏️</span>
        <span>공지사항 수정·삭제는 Google Sheets에서 직접 가능합니다.</span>
        <a href={NOTICE_SHEETS_URL} target="_blank" rel="noreferrer" className="ml-auto underline font-medium flex-shrink-0">
          Sheets 열기 →
        </a>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-8 h-8 border-2 border-[#2563eb] border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((notice, i) => (
            <div key={i}
              className={`rounded-2xl border bg-white transition-all cursor-pointer ${
                selected === i ? "border-[#93c5fd] shadow-md" : "border-[#e2e8f0] hover:border-[#93c5fd]"
              }`}
              onClick={() => setSelected(selected === i ? null : i)}
            >
              <div className="flex items-center gap-3 p-4">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${
                  notice.중요도 === "high" ? "bg-red-500" : "bg-[#cbd5e1]"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {notice.중요도 === "high" && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-200">중요</span>
                    )}
                    <span className="text-xs text-[#94a3b8]">{notice.날짜}</span>
                  </div>
                  <p className="font-semibold text-sm mt-1 text-[#0f172a]">{notice.제목}</p>
                </div>
                <span className={`text-[#94a3b8] transition-transform duration-200 flex-shrink-0 ${selected === i ? "rotate-180" : ""}`}>▾</span>
              </div>

              {selected === i && (
                <div className="px-4 pb-4 border-t border-[#f1f5f9] pt-3">
                  <p className="text-sm text-[#334155] whitespace-pre-line leading-relaxed">{notice.내용}</p>
                  {/* 수정/삭제 버튼 */}
                  <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between">
                    <p className="text-xs text-[#94a3b8]">수정·삭제는 Sheets에서 직접 가능합니다</p>
                    <a href={NOTICE_SHEETS_URL} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#e2e8f0] text-xs text-[#64748b] hover:border-[#2563eb] hover:text-[#2563eb] transition-colors bg-white">
                      ✏️ Sheets에서 수정·삭제
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
