import { useState, useEffect } from "react";
import { fetchSheet, DEMO_DATA, CONFIG } from "../config/sheets";

const GUIDE_PARTS = [
  {
    id: "audio", label: "🎙 음향 파트", desc: "믹서, 마이크, 앰프 운용",
    color: "text-purple-600", accent: "border-purple-300 bg-purple-50",
    url: "https://docs.google.com/presentation/d/e/2PACX-1vRZKJHly6UFgmtNqUrDf7tgVM_GecQ_o-3TnUypBQVAW606xeArSndxZRbbodQkocJ6yE3hvIF4CRtm/pubembed?start=false&loop=false&delayms=3000",
    editUrl: "https://docs.google.com/presentation/d/1gQ8l6eRZtJsJdOZnWZ-8g1EPGbjJ4NM5CkSkrjuMwDM/edit",
  },
  {
    id: "pc", label: "💻 PC · 자막 · PPT", desc: "자막 편집, PPT 운용, PC 관리",
    color: "text-blue-600", accent: "border-blue-300 bg-blue-50",
    url: "https://docs.google.com/presentation/d/e/2PACX-1vTg5QHE0QAGhrmHN_sh5ctFAeHbF-MpFJmOkRi14jXfa-8FxzOGEdP0AcqxlkyAgVVInwpRIjIUiMhn/pubembed?start=false&loop=false&delayms=3000",
    editUrl: "https://docs.google.com/presentation/d/1zaDegPVGqjkfNvdJ-bmT01ZxanWSNaOjy1ZFWJSpOZ8/edit",
  },
  {
    id: "camera", label: "📹 카메라 · 송출", desc: "OBS, 유튜브 송출, DSLR, 본당 모니터",
    color: "text-pink-600", accent: "border-pink-300 bg-pink-50",
    url: "https://docs.google.com/presentation/d/e/2PACX-1vQqWeTxJowegjXUNxDK6K4o30aOkoG1v28jaeMOD8k_JnFK1fhW3WRu4pDsqniKeHWrt0yNaweRDrOO/pubembed?start=false&loop=false&delayms=3000",
    editUrl: "https://docs.google.com/presentation/d/1kwWrX1M3hzvhuCvQGIqy3JOQyTWbYIHM-zft6RvU9pw/edit",
  },
  {
    id: "lighting", label: "💡 조명 파트", desc: "조명 패널, 색온도, 씬 관리",
    color: "text-amber-600", accent: "border-amber-300 bg-amber-50",
    url: "https://docs.google.com/presentation/d/e/2PACX-1vRH9AAzPYhzGSUfSxH0_ySAPvDjHgkos5t7yx2Yc51Kj5wafI7LXMKfOytUKaqoWQvE542ELJxU4ft0/pubembed?start=false&loop=false&delayms=3000",
    editUrl: "https://docs.google.com/presentation/d/1Q7RdxP-dN2OblMaZQSPRkAckcVpWXc_6FzQYV9rhV18/edit",
  },
];

export default function BroadcastGuide() {
  const [tab, setTab] = useState("guide");
  const [guidePart, setGuidePart] = useState("audio");
  const [checklist, setChecklist] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [checked, setChecked] = useState({});

  useEffect(() => {
    async function load() {
      if (CONFIG.SHEET_ID === "YOUR_GOOGLE_SHEET_ID") {
        setChecklist(DEMO_DATA.checklist); setBookmarks(DEMO_DATA.bookmarks); return;
      }
      const [cl, bm] = await Promise.all([fetchSheet("Checklist"), fetchSheet("Bookmarks")]);
      setChecklist(cl || DEMO_DATA.checklist);
      setBookmarks(bm || DEMO_DATA.bookmarks);
    }
    load();
  }, []);

  const grouped = checklist.reduce((acc, item) => {
    if (!acc[item.카테고리]) acc[item.카테고리] = [];
    acc[item.카테고리].push(item.항목);
    return acc;
  }, {});

  const doneCount = Object.values(checked).filter(Boolean).length;
  const totalCount = checklist.length;
  const currentPart = GUIDE_PARTS.find(p => p.id === guidePart);

  const TABS = [
    { id: "guide", label: "📖 사용 가이드" },
    { id: "checklist", label: "✅ 체크리스트" },
    { id: "bookmarks", label: "🔗 즐겨찾기" },
  ];

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl md:text-2xl font-bold text-[#0f172a]">📋 방송 가이드</h1>
        <p className="text-sm mt-1 text-[#64748b]">파트별 인수인계 자료 및 운용 가이드</p>
      </div>

      {/* 서브 탭 */}
      <div className="flex gap-1 p-1 rounded-xl w-fit mb-5 bg-[#f1f5f9]">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? "bg-[#2563eb] text-white shadow-sm" : "text-[#64748b] hover:text-[#2563eb]"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── 사용 가이드 ── */}
      {tab === "guide" && (
        <div>
          {/* 파트 선택 그리드 */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {GUIDE_PARTS.map(part => (
              <div key={part.id}
                className={`relative rounded-2xl border-2 p-3 transition-all cursor-pointer ${
                  guidePart === part.id ? part.accent : "border-[#e2e8f0] bg-white hover:border-[#93c5fd]"
                }`}
                onClick={() => setGuidePart(part.id)}
              >
                <p className={`font-semibold text-sm ${guidePart === part.id ? part.color : "text-[#0f172a]"}`}>
                  {part.label}
                </p>
                <p className="text-xs mt-1 text-[#64748b]">{part.desc}</p>
                {/* 편집 버튼 */}
                <a
                  href={part.editUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#2563eb] text-white text-[10px] font-medium hover:bg-[#1d4ed8] transition-colors"
                >
                  ✏️ 편집
                </a>
              </div>
            ))}
          </div>

          {/* PPT iframe — 반응형 */}
          <div className="w-full rounded-2xl overflow-hidden border border-[#e2e8f0] shadow-sm bg-white"
            style={{ paddingTop: "56.25%", position: "relative" }}>
            <iframe
              key={currentPart?.url}
              src={currentPart?.url}
              title={currentPart?.label}
              allowFullScreen
              style={{
                position: "absolute", top: 0, left: 0,
                width: "100%", height: "100%", border: "none",
              }}
            />
          </div>

          <p className="mt-3 text-xs text-[#94a3b8]">
            💡 슬라이드 수정은 ✏️ 편집 버튼을 눌러 Google Slides에서 직접 편집하세요. 저장하면 자동 반영됩니다.
          </p>
        </div>
      )}

      {/* ── 체크리스트 ── */}
      {tab === "checklist" && (
        <div>
          <div className="rounded-2xl p-4 mb-5 flex items-center justify-between bg-[#eff6ff] border border-[#bfdbfe]">
            <div>
              <p className="text-sm font-medium text-[#1e40af]">오늘 진행상황</p>
              <p className="text-xs mt-0.5 text-[#3b82f6]">{doneCount} / {totalCount} 완료</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 rounded-full overflow-hidden bg-[#bfdbfe]">
                <div className="h-full bg-[#2563eb] rounded-full transition-all duration-500"
                  style={{ width: `${totalCount ? (doneCount / totalCount) * 100 : 0}%` }} />
              </div>
              <button onClick={() => setChecked({})}
                className="text-xs px-3 py-1.5 rounded-lg border border-[#bfdbfe] text-[#3b82f6] hover:bg-white transition-colors">
                초기화
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
                <h3 className="font-semibold text-sm mb-3 text-[#2563eb]">{cat}</h3>
                <div className="space-y-2">
                  {items.map((item, i) => {
                    const key = `${cat}-${i}`;
                    return (
                      <label key={key} className="flex items-center gap-3 cursor-pointer group">
                        <div onClick={() => setChecked(p => ({ ...p, [key]: !p[key] }))}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            checked[key] ? "bg-[#2563eb] border-[#2563eb]" : "border-[#cbd5e1] group-hover:border-[#2563eb]"
                          }`}>
                          {checked[key] && <span className="text-white text-xs font-bold">✓</span>}
                        </div>
                        <span className={`text-sm transition-all ${checked[key] ? "line-through text-[#94a3b8]" : "text-[#0f172a]"}`}>
                          {item}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 즐겨찾기 ── */}
      {tab === "bookmarks" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {bookmarks.map((bm, i) => (
            <a key={i} href={bm.URL} target="_blank" rel="noreferrer"
              className="flex items-center gap-4 p-4 rounded-2xl border border-[#e2e8f0] bg-white hover:border-[#93c5fd] hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#eff6ff] flex items-center justify-center text-lg flex-shrink-0">🔗</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[#0f172a] truncate">{bm.이름}</p>
                <p className="text-xs text-[#64748b] truncate">{bm.설명}</p>
              </div>
              <span className="text-[#94a3b8] flex-shrink-0">↗</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
