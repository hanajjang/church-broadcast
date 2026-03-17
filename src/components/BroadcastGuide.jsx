import { useState, useEffect } from "react";
import { fetchSheet, DEMO_DATA, CONFIG } from "../config/sheets";

const GUIDE_PARTS = [
  {
    id: "audio",
    label: "🎙 음향 파트",
    desc: "믹서, 마이크, 앰프 운용",
    urlKey: "GUIDE_AUDIO_URL",
    color: "text-purple-400",
    accent: "border-purple-500 bg-purple-500/10",
  },
  {
    id: "pc",
    label: "💻 PC · 자막 · PPT",
    desc: "자막 편집, PPT 운용, PC 관리",
    urlKey: "GUIDE_PC_URL",
    color: "text-blue-400",
    accent: "border-blue-500 bg-blue-500/10",
  },
  {
    id: "camera",
    label: "📹 카메라 · 송출",
    desc: "OBS, 유튜브 송출, DSLR, 본당 모니터",
    urlKey: "GUIDE_CAMERA_URL",
    color: "text-pink-400",
    accent: "border-pink-500 bg-pink-500/10",
  },
  {
    id: "lighting",
    label: "💡 조명 파트",
    desc: "조명 패널, 색온도, 씬 관리",
    urlKey: "GUIDE_LIGHTING_URL",
    color: "text-amber-400",
    accent: "border-amber-500 bg-amber-500/10",
  },
];

export default function BroadcastGuide({ darkMode }) {
  const [tab, setTab] = useState("guide");
  const [guidePart, setGuidePart] = useState("audio");
  const [checklist, setChecklist] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [checked, setChecked] = useState({});

  useEffect(() => {
    async function load() {
      if (CONFIG.SHEET_ID === "YOUR_GOOGLE_SHEET_ID") {
        setChecklist(DEMO_DATA.checklist);
        setBookmarks(DEMO_DATA.bookmarks);
        return;
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

  const toggleCheck = (key) => setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  const resetAll = () => setChecked({});
  const doneCount = Object.values(checked).filter(Boolean).length;
  const totalCount = checklist.length;

  const TABS = [
    { id: "guide", label: "📖 사용 가이드" },
    { id: "checklist", label: "✅ 체크리스트" },
    { id: "bookmarks", label: "🔗 즐겨찾기" },
  ];

  const currentPart = GUIDE_PARTS.find(p => p.id === guidePart);
  const currentUrl = CONFIG[currentPart?.urlKey] || "";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">📋 방송 가이드</h1>
        <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>파트별 인수인계 자료 및 운용 가이드</p>
      </div>

      {/* Sub tabs */}
      <div className={`flex gap-1 p-1 rounded-xl w-fit mb-6 ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-amber-500 text-white shadow"
                : darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── 사용 가이드 ── */}
      {tab === "guide" && (
        <div>
          {/* 파트 선택 — 2×2 그리드 */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {GUIDE_PARTS.map(part => (
              <button
                key={part.id}
                onClick={() => setGuidePart(part.id)}
                className={`text-left p-4 rounded-2xl border transition-all ${
                  guidePart === part.id
                    ? part.accent
                    : darkMode
                      ? "border-gray-800 bg-gray-900 hover:border-gray-600"
                      : "border-gray-200 bg-white hover:border-amber-200"
                }`}
              >
                <p className={`font-semibold text-sm ${
                  guidePart === part.id ? part.color : darkMode ? "text-white" : "text-gray-900"
                }`}>
                  {part.label}
                </p>
                <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{part.desc}</p>
              </button>
            ))}
          </div>

          {/* 슬라이드 임베드 or 안내 */}
          {currentUrl ? (
            <div className="rounded-2xl overflow-hidden border border-gray-700 shadow-xl aspect-video">
              <iframe src={currentUrl} className="w-full h-full" allowFullScreen title={currentPart?.label} />
            </div>
          ) : (
            <div className={`rounded-2xl border-2 border-dashed flex flex-col items-center justify-center h-72 gap-4 ${
              darkMode ? "border-gray-700 text-gray-500" : "border-gray-200 text-gray-400"
            }`}>
              <span className="text-4xl">📊</span>
              <div className="text-center">
                <p className={`font-semibold text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{currentPart?.label} 슬라이드 미연결</p>
                <p className={`text-xs mt-1.5 ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
                  <code className={`px-1.5 py-0.5 rounded ${darkMode ? "bg-gray-800 text-amber-400" : "bg-gray-100 text-amber-600"}`}>
                    {currentPart?.urlKey}
                  </code>
                  {" "}을 .env 파일에 입력하세요
                </p>
              </div>
              <a
                href="https://docs.google.com/presentation"
                target="_blank"
                rel="noreferrer"
                className="text-xs px-4 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition-colors"
              >
                Google Slides 열기 →
              </a>
            </div>
          )}

          <div className={`mt-4 rounded-xl p-4 text-xs leading-relaxed ${darkMode ? "bg-gray-800/60 text-gray-400" : "bg-amber-50 text-gray-600 border border-amber-100"}`}>
            💡 <strong>슬라이드 연결:</strong> Google Slides → 파일 → 웹에 게시 → 임베드 → URL 복사 → .env의{" "}
            <code className={`px-1 rounded ${darkMode ? "bg-gray-700 text-amber-400" : "bg-white text-amber-600"}`}>{currentPart?.urlKey}</code>에 붙여넣기
          </div>
        </div>
      )}

      {/* ── 체크리스트 ── */}
      {tab === "checklist" && (
        <div>
          <div className={`rounded-2xl p-4 mb-5 flex items-center justify-between ${
            darkMode ? "bg-gray-800" : "bg-amber-50 border border-amber-100"
          }`}>
            <div>
              <p className="text-sm font-medium">오늘 진행상황</p>
              <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{doneCount} / {totalCount} 완료</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-32 h-2 rounded-full overflow-hidden ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${totalCount ? (doneCount / totalCount) * 100 : 0}%` }}
                />
              </div>
              <button
                onClick={resetAll}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  darkMode ? "border-gray-600 text-gray-400 hover:bg-gray-700" : "border-gray-200 text-gray-500 hover:bg-gray-100"
                }`}
              >
                초기화
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} className={`rounded-2xl border p-4 ${darkMode ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white"}`}>
                <h3 className="font-semibold text-sm mb-3 text-amber-500">{cat}</h3>
                <div className="space-y-2">
                  {items.map((item, i) => {
                    const key = `${cat}-${i}`;
                    return (
                      <label key={key} className="flex items-center gap-3 cursor-pointer group">
                        <div
                          onClick={() => toggleCheck(key)}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            checked[key]
                              ? "bg-amber-500 border-amber-500"
                              : darkMode ? "border-gray-600 group-hover:border-gray-400" : "border-gray-300 group-hover:border-amber-400"
                          }`}
                        >
                          {checked[key] && <span className="text-white text-xs font-bold">✓</span>}
                        </div>
                        <span className={`text-sm transition-all ${
                          checked[key]
                            ? darkMode ? "line-through text-gray-600" : "line-through text-gray-400"
                            : darkMode ? "text-gray-200" : "text-gray-700"
                        }`}>
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
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bookmarks.map((bm, i) => (
              <a
                key={i}
                href={bm.URL}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.01] hover:shadow-lg ${
                  darkMode
                    ? "border-gray-800 bg-gray-900 hover:border-amber-500/40 hover:bg-gray-800"
                    : "border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-lg flex-shrink-0">🔗</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{bm.이름}</p>
                  <p className={`text-xs truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{bm.설명}</p>
                </div>
                <span className={`text-xs flex-shrink-0 ${darkMode ? "text-gray-600" : "text-gray-300"}`}>↗</span>
              </a>
            ))}
          </div>
          <p className={`mt-4 text-xs ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
            * 즐겨찾기는 Google Sheets "Bookmarks" 시트에서 관리합니다
          </p>
        </div>
      )}
    </div>
  );
}
