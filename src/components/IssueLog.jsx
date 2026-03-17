import { useState, useEffect } from "react";
import { fetchSheet, driveUrlToImage, DEMO_DATA, CONFIG } from "../config/sheets";

// 폼의 카테고리와 동일하게 맞춤
const ISSUE_CATEGORIES = ["전체", "PC · 모니터", "음향", "카메라 · 송출", "프로프리젠터", "조명", "네트워크", "기타 장비", "기타"];

const CAT_ICONS = {
  "PC · 모니터":    "🖥️",
  "음향":           "🎙️",
  "카메라 · 송출":  "📹",
  "프로프리젠터":   "📺",
  "조명":           "💡",
  "네트워크":       "🌐",
  "기타 장비":      "🔧",
  "기타":           "📝",
};

const CAT_COLORS_DARK = {
  "PC · 모니터":   "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "음향":          "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "카메라 · 송출": "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "프로프리젠터":  "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "조명":          "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "네트워크":      "bg-green-500/20 text-green-400 border-green-500/30",
  "기타 장비":     "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "기타":          "bg-gray-500/20 text-gray-400 border-gray-500/30",
};
const CAT_COLORS_LIGHT = {
  "PC · 모니터":   "bg-blue-100 text-blue-700 border-blue-200",
  "음향":          "bg-purple-100 text-purple-700 border-purple-200",
  "카메라 · 송출": "bg-pink-100 text-pink-700 border-pink-200",
  "프로프리젠터":  "bg-cyan-100 text-cyan-700 border-cyan-200",
  "조명":          "bg-yellow-100 text-yellow-700 border-yellow-200",
  "네트워크":      "bg-green-100 text-green-700 border-green-200",
  "기타 장비":     "bg-orange-100 text-orange-700 border-orange-200",
  "기타":          "bg-gray-100 text-gray-600 border-gray-200",
};

// Google Form 카테고리와 Sheets 카테고리 매핑
// (폼에서 "🖥️  PC · 모니터" 형식으로 저장되므로 포함 여부로 비교)
function matchCategory(issueCat, filterCat) {
  if (filterCat === "전체") return true;
  return issueCat?.includes(filterCat.replace(/\s/g, "")) ||
         issueCat?.replace(/\s/g, "").includes(filterCat.replace(/\s/g, "")) ||
         issueCat === filterCat;
}

export default function IssueLog({ darkMode }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState("전체");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    if (CONFIG.SHEET_ID === "YOUR_GOOGLE_SHEET_ID") {
      setIssues(DEMO_DATA.issues);
      setLoading(false);
      return;
    }
    const data = await fetchSheet("Issues", CONFIG.ISSUES_SHEET_ID);
    if (data === null) { setError(true); setIssues(DEMO_DATA.issues); }
    else setIssues(data);
    setLoading(false);
  }

  const filtered = issues.filter(issue => {
    const issueCat = getCategory(issue);
    const issueTitle = getTitle(issue);
    const issueContent = getContent(issue);
    const matchCat = matchCategory(issueCat, category);
    const matchSearch = !search ||
      issueTitle.toLowerCase().includes(search.toLowerCase()) ||
      issueContent.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // 카테고리 아이콘 찾기 (폼 응답에 이모지 포함될 수 있음)
  function getCatIcon(cat) {
    if (!cat) return "📌";
    for (const [key, icon] of Object.entries(CAT_ICONS)) {
      if (cat.includes(key.replace(/\s/g, ""))) return icon;
    }
    return "📌";
  }
  function getCatColor(cat, dark) {
    const map = dark ? CAT_COLORS_DARK : CAT_COLORS_LIGHT;
    if (!cat) return dark ? "bg-gray-500/20 text-gray-400 border-gray-500/30" : "bg-gray-100 text-gray-600 border-gray-200";
    for (const [key, color] of Object.entries(map)) {
      if (cat.replace(/\s/g, "").includes(key.replace(/\s/g, ""))) return color;
    }
    return dark ? "bg-gray-500/20 text-gray-400 border-gray-500/30" : "bg-gray-100 text-gray-600 border-gray-200";
  }

  // 폼 응답 컬럼명 유연하게 처리 — 이모지 포함 키명 대응
  function getField(issue, ...keywords) {
    // 정확한 키 먼저 시도
    for (const kw of keywords) {
      if (issue[kw] !== undefined) return issue[kw] || "";
    }
    // 이모지/특수문자 제거 후 부분 매칭
    for (const key of Object.keys(issue)) {
      const cleanKey = key.replace(/[^\w가-힣]/g, "").toLowerCase();
      for (const kw of keywords) {
        const cleanKw = kw.replace(/[^\w가-힣]/g, "").toLowerCase();
        if (cleanKey.includes(cleanKw) || cleanKw.includes(cleanKey)) {
          return issue[key] || "";
        }
      }
    }
    return "";
  }

  function getTitle(issue)   { return getField(issue, "📌 이슈 제목", "이슈 제목", "제목"); }
  function getCategory(issue){ return getField(issue, "🗂️ 카테고리", "카테고리"); }
  function getDate(issue)    { return getField(issue, "📅 발생 날짜", "발생 날짜", "날짜", "Timestamp"); }
  function getContent(issue) { return getField(issue, "🔍 발생 상황", "발생 상황", "내용"); }
  function getSolution(issue){ return getField(issue, "✅ 해결 방법", "해결 방법", "해결방법"); }
  function getPrevention(issue){ return getField(issue, "🛡️ 재발 방지 포인트", "재발 방지 포인트", "재발"); }
  function getAuthor(issue)  { return getField(issue, "✍️ 작성자", "작성자"); }
  function getPhotoUrl(issue) {
    const raw = getField(issue, "📷 사진 링크 (Google Drive)", "사진 링크 (Google Drive)", "사진URL");
    if (!raw) return null;
    return driveUrlToImage(raw.split("\n")[0].trim());
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">⚠️ 이슈 기록</h1>
          <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            방송 장애 및 해결 사례 모음
            {error && <span className="text-amber-400 ml-2">⚠ 시트 연결 실패, 데모 데이터 표시 중</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* 검색 */}
          <div className={`relative flex items-center rounded-xl border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} px-3 py-2 gap-2 w-48`}>
            <span className="text-gray-400 text-sm">🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="이슈 검색..."
              className={`flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 ${darkMode ? "text-white" : "text-gray-800"}`}
            />
            {search && <button onClick={() => setSearch("")} className="text-gray-400 text-xs">✕</button>}
          </div>
          {/* Google Form 버튼 */}
          <a
            href={CONFIG.ISSUE_FORM_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors shadow-sm"
          >
            <span>📋</span> 이슈 등록
          </a>
        </div>
      </div>

      {/* 안내 배너 */}
      <div className={`flex items-center gap-3 rounded-xl px-4 py-3 mb-5 text-sm ${darkMode ? "bg-amber-500/10 border border-amber-500/20 text-amber-300" : "bg-amber-50 border border-amber-200 text-amber-700"}`}>
        <span>📲</span>
        <span>이슈 등록 시 Google Form을 사용합니다. 등록하면 텔레그램으로 알람이 발송됩니다.</span>
        <a href={CONFIG.ISSUE_FORM_URL} target="_blank" rel="noreferrer" className="ml-auto underline font-medium flex-shrink-0">
          폼 바로가기 →
        </a>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {ISSUE_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              category === cat
                ? "bg-amber-500 text-white border-amber-500"
                : darkMode ? "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white" : "border-gray-200 text-gray-600 hover:border-amber-300"
            }`}
          >
            {cat !== "전체" && <span className="text-xs">{CAT_ICONS[cat]}</span>}
            {cat}
          </button>
        ))}
      </div>

      {/* Issue Cards */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className={`text-center py-16 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              이슈 기록이 없습니다
            </div>
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
              const catColor = getCatColor(category, darkMode);
              const catIcon = getCatIcon(category);

              return (
                <div
                  key={i}
                  className={`rounded-2xl border transition-all ${
                    expanded === i
                      ? darkMode ? "border-amber-500/40 bg-gray-900" : "border-amber-300 bg-amber-50"
                      : darkMode ? "border-gray-800 bg-gray-900 hover:border-gray-700" : "border-gray-200 bg-white hover:border-amber-200"
                  }`}
                >
                  {/* Card Header */}
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer"
                    onClick={() => setExpanded(expanded === i ? null : i)}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${catColor}`}>
                      {catIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${catColor}`}>
                          {category?.replace(/^[^\w가-힣]+/, "").trim() || category}
                        </span>
                        <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                          {date}
                        </span>
                        {author && <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>✍️ {author}</span>}
                        {imgUrl && <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>📷 사진</span>}
                      </div>
                      <p className={`font-semibold text-sm mt-1 ${darkMode ? "text-white" : "text-gray-900"}`}>{title}</p>
                    </div>
                    <span className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${expanded === i ? "rotate-180" : ""}`}>▾</span>
                  </div>

                  {/* Expanded Body */}
                  {expanded === i && (
                    <div className={`px-4 pb-4 border-t pt-3 space-y-3 ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
                      {content && (
                        <div>
                          <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>발생 상황</p>
                          <p className={`text-sm whitespace-pre-line ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{content}</p>
                        </div>
                      )}

                      {imgUrl && (
                        <div>
                          <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>첨부 사진</p>
                          <img
                            src={imgUrl}
                            alt="이슈 사진"
                            className="rounded-xl max-h-64 object-contain cursor-zoom-in hover:opacity-90 transition-opacity border border-gray-700"
                            onClick={e => { e.stopPropagation(); setLightbox(imgUrl); }}
                            onError={e => { e.target.parentElement.style.display = "none"; }}
                          />
                        </div>
                      )}

                      {solution && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide mb-1 text-amber-500">해결 방법</p>
                          <p className={`text-sm whitespace-pre-line rounded-xl p-3 ${darkMode ? "bg-amber-500/10 text-amber-300 border border-amber-500/20" : "bg-amber-50 text-amber-800 border border-amber-200"}`}>
                            ✅ {solution}
                          </p>
                        </div>
                      )}

                      {prevention && (
                        <div>
                          <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>재발 방지 포인트</p>
                          <p className={`text-sm whitespace-pre-line rounded-xl p-3 ${darkMode ? "bg-blue-500/10 text-blue-300 border border-blue-500/20" : "bg-blue-50 text-blue-800 border border-blue-200"}`}>
                            🛡️ {prevention}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      <p className={`mt-4 text-xs ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
        * 이슈는 Google Form으로 등록 → Sheets "Issues" 시트에 자동 저장됩니다.
      </p>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="확대 사진" className="max-w-full max-h-full rounded-2xl shadow-2xl" />
          <button className="absolute top-5 right-5 text-white text-xl bg-white/10 w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/20">✕</button>
        </div>
      )}
    </div>
  );
}};

// Google Form 카테고리와 Sheets 카테고리 매핑
// (폼에서 "🖥️  PC · 모니터" 형식으로 저장되므로 포함 여부로 비교)
function matchCategory(issueCat, filterCat) {
  if (filterCat === "전체") return true;
  return issueCat?.includes(filterCat.replace(/\s/g, "")) ||
         issueCat?.replace(/\s/g, "").includes(filterCat.replace(/\s/g, "")) ||
         issueCat === filterCat;
}

export default function IssueLog({ darkMode }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState("전체");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    if (CONFIG.SHEET_ID === "YOUR_GOOGLE_SHEET_ID") {
      setIssues(DEMO_DATA.issues);
      setLoading(false);
      return;
    }
    const data = await fetchSheet("Issues", CONFIG.ISSUES_SHEET_ID);
    if (data === null) { setError(true); setIssues(DEMO_DATA.issues); }
    else setIssues(data);
    setLoading(false);
  }

  const filtered = issues.filter(issue => {
    const matchCat = matchCategory(issue.카테고리, category);
    const matchSearch = !search ||
      issue.제목?.toLowerCase().includes(search.toLowerCase()) ||
      issue["발생 상황"]?.toLowerCase().includes(search.toLowerCase()) ||
      issue.내용?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // 카테고리 아이콘 찾기 (폼 응답에 이모지 포함될 수 있음)
  function getCatIcon(cat) {
    if (!cat) return "📌";
    for (const [key, icon] of Object.entries(CAT_ICONS)) {
      if (cat.includes(key.replace(/\s/g, ""))) return icon;
    }
    return "📌";
  }
  function getCatColor(cat, dark) {
    const map = dark ? CAT_COLORS_DARK : CAT_COLORS_LIGHT;
    if (!cat) return dark ? "bg-gray-500/20 text-gray-400 border-gray-500/30" : "bg-gray-100 text-gray-600 border-gray-200";
    for (const [key, color] of Object.entries(map)) {
      if (cat.replace(/\s/g, "").includes(key.replace(/\s/g, ""))) return color;
    }
    return dark ? "bg-gray-500/20 text-gray-400 border-gray-500/30" : "bg-gray-100 text-gray-600 border-gray-200";
  }

  // 폼 응답 컬럼명 유연하게 처리 (폼: "발생 상황", 기존: "내용")
  function getContent(issue) { return issue["발생 상황"] || issue.내용 || ""; }
  function getSolution(issue) { return issue["해결 방법"] || issue.해결방법 || ""; }
  function getPrevention(issue) { return issue["재발 방지 포인트"] || ""; }
  function getAuthor(issue) { return issue["작성자"] || ""; }
  function getPhotoUrl(issue) {
    const raw = issue["사진 링크 (Google Drive)"] || issue.사진URL || "";
    return driveUrlToImage(raw.split("\n")[0].trim()); // 첫 번째 링크만 표시
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">⚠️ 이슈 기록</h1>
          <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            방송 장애 및 해결 사례 모음
            {error && <span className="text-amber-400 ml-2">⚠ 시트 연결 실패, 데모 데이터 표시 중</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* 검색 */}
          <div className={`relative flex items-center rounded-xl border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} px-3 py-2 gap-2 w-48`}>
            <span className="text-gray-400 text-sm">🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="이슈 검색..."
              className={`flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 ${darkMode ? "text-white" : "text-gray-800"}`}
            />
            {search && <button onClick={() => setSearch("")} className="text-gray-400 text-xs">✕</button>}
          </div>
          {/* Google Form 버튼 */}
          <a
            href={CONFIG.ISSUE_FORM_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors shadow-sm"
          >
            <span>📋</span> 이슈 등록
          </a>
        </div>
      </div>

      {/* 안내 배너 */}
      <div className={`flex items-center gap-3 rounded-xl px-4 py-3 mb-5 text-sm ${darkMode ? "bg-amber-500/10 border border-amber-500/20 text-amber-300" : "bg-amber-50 border border-amber-200 text-amber-700"}`}>
        <span>📲</span>
        <span>이슈 등록 시 Google Form을 사용합니다. 등록하면 텔레그램으로 알람이 발송됩니다.</span>
        <a href={CONFIG.ISSUE_FORM_URL} target="_blank" rel="noreferrer" className="ml-auto underline font-medium flex-shrink-0">
          폼 바로가기 →
        </a>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {ISSUE_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              category === cat
                ? "bg-amber-500 text-white border-amber-500"
                : darkMode ? "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white" : "border-gray-200 text-gray-600 hover:border-amber-300"
            }`}
          >
            {cat !== "전체" && <span className="text-xs">{CAT_ICONS[cat]}</span>}
            {cat}
          </button>
        ))}
      </div>

      {/* Issue Cards */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className={`text-center py-16 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              이슈 기록이 없습니다
            </div>
          ) : (
            filtered.map((issue, i) => {
              const imgUrl = getPhotoUrl(issue);
              const content = getContent(issue);
              const solution = getSolution(issue);
              const prevention = getPrevention(issue);
              const author = getAuthor(issue);
              const catColor = getCatColor(issue.카테고리, darkMode);
              const catIcon = getCatIcon(issue.카테고리);

              return (
                <div
                  key={i}
                  className={`rounded-2xl border transition-all ${
                    expanded === i
                      ? darkMode ? "border-amber-500/40 bg-gray-900" : "border-amber-300 bg-amber-50"
                      : darkMode ? "border-gray-800 bg-gray-900 hover:border-gray-700" : "border-gray-200 bg-white hover:border-amber-200"
                  }`}
                >
                  {/* Card Header */}
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer"
                    onClick={() => setExpanded(expanded === i ? null : i)}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${catColor}`}>
                      {catIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${catColor}`}>
                          {issue.카테고리?.replace(/^[^\w가-힣]+/, "").trim() || issue.카테고리}
                        </span>
                        <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                          {issue.날짜 || issue["발생 날짜"] || ""}
                        </span>
                        {author && <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>✍️ {author}</span>}
                        {imgUrl && <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>📷 사진</span>}
                      </div>
                      <p className={`font-semibold text-sm mt-1 ${darkMode ? "text-white" : "text-gray-900"}`}>{issue.제목}</p>
                    </div>
                    <span className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${expanded === i ? "rotate-180" : ""}`}>▾</span>
                  </div>

                  {/* Expanded Body */}
                  {expanded === i && (
                    <div className={`px-4 pb-4 border-t pt-3 space-y-3 ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
                      {content && (
                        <div>
                          <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>발생 상황</p>
                          <p className={`text-sm whitespace-pre-line ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{content}</p>
                        </div>
                      )}

                      {imgUrl && (
                        <div>
                          <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>첨부 사진</p>
                          <img
                            src={imgUrl}
                            alt="이슈 사진"
                            className="rounded-xl max-h-64 object-contain cursor-zoom-in hover:opacity-90 transition-opacity border border-gray-700"
                            onClick={e => { e.stopPropagation(); setLightbox(imgUrl); }}
                            onError={e => { e.target.parentElement.style.display = "none"; }}
                          />
                        </div>
                      )}

                      {solution && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide mb-1 text-amber-500">해결 방법</p>
                          <p className={`text-sm whitespace-pre-line rounded-xl p-3 ${darkMode ? "bg-amber-500/10 text-amber-300 border border-amber-500/20" : "bg-amber-50 text-amber-800 border border-amber-200"}`}>
                            ✅ {solution}
                          </p>
                        </div>
                      )}

                      {prevention && (
                        <div>
                          <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>재발 방지 포인트</p>
                          <p className={`text-sm whitespace-pre-line rounded-xl p-3 ${darkMode ? "bg-blue-500/10 text-blue-300 border border-blue-500/20" : "bg-blue-50 text-blue-800 border border-blue-200"}`}>
                            🛡️ {prevention}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      <p className={`mt-4 text-xs ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
        * 이슈는 Google Form으로 등록 → Sheets "Issues" 시트에 자동 저장됩니다.
      </p>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="확대 사진" className="max-w-full max-h-full rounded-2xl shadow-2xl" />
          <button className="absolute top-5 right-5 text-white text-xl bg-white/10 w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/20">✕</button>
        </div>
      )}
    </div>
  );
}
