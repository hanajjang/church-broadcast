import { useState, useEffect } from "react";
import { fetchSheet, DEMO_DATA, CONFIG } from "../config/sheets";

const PART_ICONS = { "총괄/영상": "🎬", "음향": "🎙", "조명": "💡", "자막/PPT": "📝" };

export default function Contacts({ darkMode }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (CONFIG.SHEET_ID === "YOUR_GOOGLE_SHEET_ID") {
        setContacts(DEMO_DATA.contacts);
        setLoading(false);
        return;
      }
      const data = await fetchSheet("Contacts");
      setContacts(data || DEMO_DATA.contacts);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">📞 담당자 연락처</h1>
        <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>방송부 파트별 담당자</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact, i) => (
            <div
              key={i}
              className={`rounded-2xl border p-5 transition-all hover:shadow-lg hover:scale-[1.01] ${
                darkMode ? "border-gray-800 bg-gray-900 hover:border-amber-500/30" : "border-gray-200 bg-white hover:border-amber-300"
              }`}
            >
              {/* Avatar */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-2xl">
                  {PART_ICONS[contact.파트] || "👤"}
                </div>
                <div>
                  <p className="font-bold text-base">{contact.이름}</p>
                  <p className="text-amber-500 text-xs font-medium">{contact.파트}</p>
                </div>
                {contact.비고 && (
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${darkMode ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-700"}`}>
                    {contact.비고}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className={`space-y-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                {contact.연락처 && (
                  <a
                    href={`tel:${contact.연락처}`}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-colors ${darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-50 hover:bg-amber-50"}`}
                  >
                    <span>📱</span>
                    <span className="font-mono">{contact.연락처}</span>
                  </a>
                )}
                {contact.이메일 && (
                  <a
                    href={`mailto:${contact.이메일}`}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-colors ${darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-50 hover:bg-amber-50"}`}
                  >
                    <span>✉️</span>
                    <span className="truncate">{contact.이메일}</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={`mt-6 rounded-2xl border p-4 text-sm ${darkMode ? "border-gray-800 bg-gray-900 text-gray-400" : "border-gray-200 bg-white text-gray-500"}`}>
        <p>📋 담당자 정보는 Google Sheets의 <strong>Contacts</strong> 시트에서 관리합니다.</p>
      </div>
    </div>
  );
}
