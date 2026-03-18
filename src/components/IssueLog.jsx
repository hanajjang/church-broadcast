import { useState, useEffect } from "react";
import { fetchSheet, driveUrlToImage, DEMO_DATA, CONFIG } from "../config/sheets";

const ISSUE_CATEGORIES = ["전체", "PC · 모니터", "음향", "카메라 · 송출", "프로프리젠터", "조명", "네트워크", "기타 장비", "기타"];

const CAT_ICONS = {
  "PC · 모니터":   "🖥️", "음향": "🎙️", "카메라 · 송출": "📹",
  "프로프리젠터":  "📺", "조명": "💡", "네트워크": "🌐",
  "기타 장비":     "🔧", "기타": "📝",
};

const CAT_COLORS = {
  "PC · 모니터":   "bg-blue-100 text-blue-700 border-blue-200",
  "음향":          "bg-purple-100 text-purple-700 border-purple-200",
  "카메라 · 송출": "bg-pink-100 text-pink-700 border-pink-200",
  "프로프리젠터":  "bg-cyan-100 text-cyan-700 border-cyan-200",
  "조명":          "bg-yellow-100 text-yellow-700 border-yellow-200",
  "네트워크":      "bg-green-100 text-green-700 border-green-200",
  "기타 장비":     "bg-orange-100 text-orange-700 border-orange-200",
  "기타":          "bg-gray-100 text-gray-600 border-gray-200",
};

const ISSUES_SHEETS_URL = `https://docs.google.com/spreadsheets/d/1R3V7u77x1LSDPrhlfqZ2vaxtlf6B-oxxpq6NKYcQ5a4/edit`;

function getField(issue, ...keywords) {
  for (const kw of keywords) {
    if (issue[kw] !== undefined && issue[kw] !== "") return issue[kw];
  }
  for (const key of Object.keys(issue)) {
    const cleanKey = key.replace(/[^\w가-힣]/g, "").toLowerCase();
    for (const kw of keywords) {
      const cleanKw = kw.replace(/[^\w가-힣]/g, "").toLowerCase();
      if (cleanKey.includes(cleanKw) || cleanKw.includes(cleanKey)) return issue[key] || "";
    }
  }
  return "";
}

function getTitle(issue)      { return getField(issue, "📌 이슈 제목", "이슈 제목", "제목"); }
function getCategory(issue)   { return getField(issue, "🗂️ 카테고리", "카테고리"); }
function getDate(issue)       { return getField(issue, "📅 발생 날짜", "발생 날짜", "날짜", "Timestamp"); }
function getContent(issue)    { return getField(issue, "🔍 발생 상황", "발생 상황", "내용"); }
function getSolution(issue)   { return getField(issue, "✅ 해결 방법", "해결 방법", "해결방법"); }
function getPrevention(issue) { return getField(issue, "🛡️ 재발 방지 포인트", "재발 방지 포인트"); }
function getAuthor(issue)     { return getField(issue, "✍️ 작성자", "작성자"); }
function getPhotoUrl(issue) {
  const raw = getField(issue, "📷 사진 링크 (Google Drive)", "사진 링크 (Google Drive)", "사진URL");
  if (!raw) return null;
  return driveUrlToImage(raw.split("\n")[0].trim());
}

function getCatIcon(cat) {
  if (!cat) return "📌";
  for (const [key, icon] of Object.entries(CAT_ICONS)) {
    if (cat.replace(/\s/g, "").includes(key.replace(/\s/g, ""))) return icon;
  }
  return "📌";
}
function getCatColor(cat) {
  if (!cat) return "bg-gray-100 text-gray-600 border-gray-200";
  for (const [key, color] of Object.entries(CAT_COLORS)) {
    if (cat.replace(/\s/g, "").includes(key.replace(/\s/g, ""))) return color;
  }
  return "bg-gray-100 text-gray-600 border-gray-200";
}

export default function IssueLog() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("전체");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    if (CONFIG.SHEET_ID === "YOUR_GOOGLE_SHEET_ID") { setIssues(DEMO_DATA.issues); setLoading(false); return; }
    const data = await fetchSheet("Issues", CONFIG.ISSUES_SHEET_ID);
    setIssues(data || DEMO_DATA.issues);
    setLoading(false);
  }

  const filtered = issues.filter(issue => {
    const issueCat = getCategory(issue);
    const matchCat = category === "전체" || issueCat.replace(/\s/g, "").includes(category.replace(/\s/g, ""));
    const matchSearch = !search ||
      getTitle(issue).toLowerCase().includes(search.toLowerCase()) ||
      getContent(issue).toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-5 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#0f172a]">⚠️ 이슈 기록</h1>
          <p className="text-sm mt-1 text-[#64748b]">방송 장애 및 해결 사례 모음</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a href={CONFIG.ISSUE_FORM_URL} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2563eb] text-white text-xs font-semibold hover:bg-[#1d4ed8] transition-colors shadow-sm">
            <span>📋</span><span>이슈 등록</span>
          </a>
        </div>
      </div>

      {/* 안내 배너 */}
      <div className="flex items-start gap-3 rounded-xl px-4 py-3 mb-5 text-sm bg-[#eff6ff] border border-[#bfdbfe] text-[#1e40af]">
        <span className="flex-shrink-0 mt-0.5">📲</span>
        <span className="leading-relaxed">이슈 등록은 Google Form으로 제출하면 텔레그램으로 알람이 발송됩니다.</span>
      </div>

      {/* 검색 */}
      <div className="flex items-center rounded-xl border border-[#e2e8f0] bg-white px-3 py-2.5 gap-2 mb-4 shadow-sm">
        <span className="text-gray-400">🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="이슈 검색..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 text-[#0f172a]" />
        {search && <button onClick={() => setSearch("")} className="text-gray-400 text-xs">✕</button>}
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {ISSUE_CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              category === cat
                ? "bg-[#2563eb] text-white border-[#2563eb]"
                : "border-[#e2e8f0] text-[#64748b] bg-white hover:border-[#2563eb] hover:text-[#2563eb]"
            }`}>
            {cat !== "전체" && <span>{CAT_ICONS[cat]}</span>}
            {cat}
          </button>
        ))}
      </div>

      {/* 이슈 카드 */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-8 h-8 border-2 border-[#2563eb] border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-[#94a3b8]">이슈 기록이 없습니다</div>
          ) : (
            filtered.map((issue, i) => {
              const title = getTitle(issue);
              const category = getCategory(issue);
              const date = getDate(issue);
              const imgUrl = getPhotoUrl(issue);
              const content = getContent(issue);
              const solution = getSolution(issue);
              const prevention = getPrevention(issue);
              const author = getAuthor(issue);
              const catColor = getCatColor(category);
              const catIcon = getCatIcon(category);

              return (
                <div key={i} className={`rounded-2xl border transition-all bg-white ${
                  expanded === i ? "border-[#93c5fd] shadow-md" : "border-[#e2e8f0] hover:border-[#93c5fd]"
                }`}>
                  {/* 카드 헤더 */}
                  <div className="flex items-center gap-3 p-4 cursor-pointer"
                    onClick={() => setExpanded(expanded === i ? null : i)}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${catColor}`}>
                      {catIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${catColor}`}>
                          {category?.replace(/^[^\w가-힣]+/, "").trim()}
                        </span>
                        <span className="text-xs text-[#94a3b8]">{date}</span>
                        {author && <span className="text-xs text-[#94a3b8]">✍️ {author}</span>}
                        {imgUrl && <span className="text-xs text-[#94a3b8]">📷</span>}
                      </div>
                      <p className="font-semibold text-sm mt-1 text-[#0f172a] truncate">{title}</p>
                    </div>
                    <span className={`text-[#94a3b8] transition-transform duration-200 flex-shrink-0 ${expanded === i ? "rotate-180" : ""}`}>▾</span>
                  </div>

                  {/* 펼쳐진 내용 */}
                  {expanded === i && (
                    <div className="px-4 pb-4 border-t border-[#f1f5f9] pt-3 space-y-3">
                      {content && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide mb-1 text-[#64748b]">발생 상황</p>
                          <p className="text-sm whitespace-pre-line text-[#334155] leading-relaxed">{content}</p>
                        </div>
                      )}
                      {imgUrl && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide mb-2 text-[#64748b]">첨부 사진</p>
                          <img src={imgUrl} alt="이슈 사진"
                            className="rounded-xl max-h-64 object-contain cursor-zoom-in hover:opacity-90 transition-opacity border border-[#e2e8f0]"
                            onClick={e => { e.stopPropagation(); setLightbox(imgUrl); }}
                            onError={e => { e.target.parentElement.style.display = "none"; }} />
                        </div>
                      )}
                      {solution && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide mb-1 text-[#2563eb]">해결 방법</p>
                          <p className="text-sm whitespace-pre-line rounded-xl p-3 bg-[#eff6ff] text-[#1e40af] border border-[#bfdbfe] leading-relaxed">✅ {solution}</p>
                        </div>
                      )}
                      {prevention && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide mb-1 text-[#7c3aed]">재발 방지 포인트</p>
                          <p className="text-sm whitespace-pre-line rounded-xl p-3 bg-purple-50 text-purple-800 border border-purple-200 leading-relaxed">🛡️ {prevention}</p>
                        </div>
                      )}
                      {/* 수정/삭제 버튼 */}
                      <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between">
                        <p className="text-xs text-[#94a3b8]">수정·삭제는 Sheets에서 직접 가능합니다</p>
                        <a href={ISSUES_SHEETS_URL} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#e2e8f0] text-xs text-[#64748b] hover:border-[#2563eb] hover:text-[#2563eb] transition-colors bg-white">
                          ✏️ Sheets에서 수정·삭제
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      <p className="mt-4 text-xs text-[#94a3b8]">* 이슈는 Google Form 제출 → Sheets "Issues" 시트에 자동 저장됩니다.</p>

      {/* 라이트박스 */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="확대 사진" className="max-w-full max-h-full rounded-2xl shadow-2xl" />
          <button className="absolute top-5 right-5 text-white text-xl bg-white/10 w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/20">✕</button>
        </div>
      )}
    </div>
  );
}
