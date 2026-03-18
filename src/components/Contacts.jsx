import { useState, useEffect } from "react";
import { fetchSheet, DEMO_DATA, CONFIG } from "../config/sheets";

const CONTACTS_SHEETS_URL = `https://docs.google.com/spreadsheets/d/1TlWKZ5tr531kNZMBLLwb4PjX6ON1JY03i4fHrvJE6OM/edit`;

const PART_ICONS = {
  "총괄/영상": "🎬", "음향": "🎙️", "조명": "💡",
  "자막/PPT": "📝", "카메라": "📹", "카메라/OBS": "📹",
  "PC": "💻", "PC·자막": "💻",
};

const PART_FILTERS = ["전체", "PC·음향", "조명", "카메라·송출", "기타"];

function getPartGroup(part) {
  if (!part) return "기타";
  if (part.includes("음향") || part.includes("PC") || part.includes("자막") || part.includes("PPT")) return "PC·음향";
  if (part.includes("조명")) return "조명";
  if (part.includes("카메라") || part.includes("영상") || part.includes("송출")) return "카메라·송출";
  return "기타";
}

function korSort(a, b) {
  return (a.이름 || "").localeCompare(b.이름 || "", "ko");
}

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("전체");

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (CONFIG.SHEET_ID === "YOUR_GOOGLE_SHEET_ID") {
        setContacts([...DEMO_DATA.contacts].sort(korSort));
        setLoading(false);
        return;
      }
      const data = await fetchSheet("Contacts");
      setContacts((data || DEMO_DATA.contacts).sort(korSort));
      setLoading(false);
    }
    load();
  }, []);

  const filtered = contacts.filter(c =>
    filter === "전체" || getPartGroup(c.파트) === filter
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#0f172a]">📞 담당자 연락처</h1>
          <p className="text-sm mt-1 text-[#64748b]">방송부 파트별 담당자</p>
        </div>
        <a href={CONTACTS_SHEETS_URL} target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2563eb] text-white text-xs font-semibold hover:bg-[#1d4ed8] transition-colors shadow-sm">
          <span>➕</span><span>담당자 추가</span>
        </a>
      </div>

      {/* 파트 필터 */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {PART_FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              filter === f
                ? "bg-[#2563eb] text-white border-[#2563eb]"
                : "border-[#e2e8f0] text-[#64748b] bg-white hover:border-[#2563eb] hover:text-[#2563eb]"
            }`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-8 h-8 border-2 border-[#2563eb] border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
          {filtered.map((contact, i) => (
            <div key={i} className="rounded-2xl border border-[#e2e8f0] bg-white p-3 md:p-4 hover:border-[#93c5fd] hover:shadow-md transition-all">
              <div className="flex items-start gap-2 md:gap-3">
                {/* 아이콘 */}
                <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-[#eff6ff] flex items-center justify-center text-xl flex-shrink-0">
                  {PART_ICONS[contact.파트] || "👤"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-bold text-sm md:text-base text-[#0f172a] truncate">{contact.이름}</p>
                    {contact.비고 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] flex-shrink-0">
                        {contact.비고}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#2563eb] font-medium mt-0.5 truncate">{contact.파트}</p>

                  <div className="mt-2 space-y-1">
                    {contact.연락처 && (
                      <a href={`tel:${contact.연락처}`}
                        className="flex items-center gap-1.5 text-xs text-[#334155] hover:text-[#2563eb] transition-colors">
                        <span className="text-[#94a3b8]">📱</span>
                        <span className="truncate">{contact.연락처}</span>
                      </a>
                    )}
                    {contact.이메일 && (
                      <a href={`mailto:${contact.이메일}`}
                        className="flex items-center gap-1.5 text-xs text-[#334155] hover:text-[#2563eb] transition-colors">
                        <span className="text-[#94a3b8]">✉️</span>
                        <span className="truncate">{contact.이메일}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-xs text-[#94a3b8]">* 담당자 정보는 Google Sheets "Contacts" 시트에서 관리합니다</p>
    </div>
  );
}
