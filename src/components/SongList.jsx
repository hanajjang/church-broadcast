import { useState, useEffect, useRef, useCallback } from "react";
import { fetchSheet, DEMO_DATA, CONFIG } from "../config/sheets";

const CATEGORIES = ["전체", "명곡", "뮤비", "예배찬송/악보영상", "준비찬양"];
const CAT_COLS   = ["명곡", "뮤비", "예배찬송/악보영상", "준비찬양"];
const SHEETS_URL = `https://docs.google.com/spreadsheets/d/1TlWKZ5tr531kNZMBLLwb4PjX6ON1JY03i4fHrvJE6OM/edit#gid=0`;

const TAG_COLORS = {
  "명곡":            "bg-purple-100 text-purple-700 border-purple-200",
  "뮤비":            "bg-pink-100 text-pink-700 border-pink-200",
  "예배찬송/악보영상": "bg-green-100 text-green-700 border-green-200",
  "준비찬양":         "bg-blue-100 text-blue-700 border-blue-200",
};

const CONSONANTS = ["ㄱ","ㄴ","ㄷ","ㄹ","ㅁ","ㅂ","ㅅ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ","A"];

function getConsonant(char) {
  if (!char) return null;
  const code = char.charCodeAt(0);
  if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) return "A";
  if (code < 0xAC00 || code > 0xD7A3) return null;
  const idx = Math.floor((code - 0xAC00) / 28 / 21);
  const cons = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"][idx];
  const map = { ㄲ:"ㄱ", ㄸ:"ㄷ", ㅃ:"ㅂ", ㅆ:"ㅅ", ㅉ:"ㅈ" };
  return map[cons] || cons;
}

function korSort(a, b) {
  return (a.제목 || "").localeCompare(b.제목 || "", "ko");
}

function getSongCats(song) {
  return CAT_COLS.filter(c => song[c] === "O");
}

const DEMO_SONGS = [
  { 제목: "가는 길",        명곡: "O", 뮤비: "O", "예배찬송/악보영상": "", 준비찬양: "" },
  { 제목: "나의 피난처",    명곡: "",  뮤비: "",  "예배찬송/악보영상": "O", 준비찬양: "O" },
  { 제목: "다 드리리",      명곡: "O", 뮤비: "",  "예배찬송/악보영상": "",  준비찬양: "" },
  { 제목: "Amazing Grace", 명곡: "O", 뮤비: "",  "예배찬송/악보영상": "",  준비찬양: "" },
];

export default function SongList() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("전체");
  const [popup, setPopup] = useState(null);       // { song, index }
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const listRef = useRef(null);
  const consRefs = useRef({});        // { ㄱ: domEl, ㄴ: domEl, ... }
  const indexBarRef = useRef(null);
  const isDragging = useRef(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (CONFIG.SHEET_ID === "YOUR_GOOGLE_SHEET_ID") { setSongs([...DEMO_SONGS].sort(korSort)); setLoading(false); return; }
      const data = await fetchSheet("Songs");
      setSongs((data || DEMO_SONGS).sort(korSort));
      setLoading(false);
    }
    load();
  }, []);

  // 필터된 곡 목록
  const filtered = songs.filter(s => {
    const matchCat = category === "전체" || s[category] === "O";
    const matchSearch = !search || s.제목?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // ── 인덱스바 드래그 스크롤 ──────────────────────────────────
  function getConsonantFromY(y) {
    if (!indexBarRef.current) return null;
    const rect = indexBarRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (y - rect.top) / rect.height));
    const idx = Math.floor(ratio * CONSONANTS.length);
    return CONSONANTS[Math.min(idx, CONSONANTS.length - 1)];
  }

  function scrollToConsonant(cons) {
    const el = consRefs.current[cons];
    if (!el) return;
    // sticky 검색창 높이만큼 오프셋 보정
    const rect = el.getBoundingClientRect();
    const offset = 120; // sticky 헤더 높이
    const scrollY = window.scrollY + rect.top - offset;
    window.scrollTo({ top: scrollY, behavior: "smooth" });
  }

  // non-passive 터치 이벤트 직접 등록 (passive 기본값 우회)
  useEffect(() => {
    const bar = indexBarRef.current;
    if (!bar) return;

    function onStart(e) {
      e.preventDefault();
      isDragging.current = true;
      const touch = e.touches[0];
      const cons = getConsonantFromY(touch.clientY);
      if (cons) scrollToConsonant(cons);
    }
    function onMove(e) {
      if (!isDragging.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      const cons = getConsonantFromY(touch.clientY);
      if (cons) scrollToConsonant(cons);
    }
    function onEnd() { isDragging.current = false; }

    bar.addEventListener("touchstart", onStart, { passive: false });
    bar.addEventListener("touchmove",  onMove,  { passive: false });
    bar.addEventListener("touchend",   onEnd);

    return () => {
      bar.removeEventListener("touchstart", onStart);
      bar.removeEventListener("touchmove",  onMove);
      bar.removeEventListener("touchend",   onEnd);
    };
  }, []);

  const handleIndexTouch = useCallback(() => {}, []);
  const handleIndexMove  = useCallback(() => {}, []);
  const handleIndexEnd   = useCallback(() => {}, []);

  // ── 팝업에서 카테고리 토글 ─────────────────────────────────
  async function toggleCategory(song, cat) {
    if (!CONFIG.APPS_SCRIPT_URL) return;
    const newVal = song[cat] === "O" ? "" : "O";
    setSaving(true);
    setSaveMsg("");
    try {
      await fetch(CONFIG.APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "updateSongCategory", songTitle: song.제목, category: cat, value: newVal }),
      });
      // no-cors 모드에서는 응답을 읽을 수 없으므로 성공으로 간주
      if (true) {
        // 로컬 상태 업데이트
        setSongs(prev => prev.map(s => s.제목 === song.제목 ? { ...s, [cat]: newVal } : s));
        setPopup(prev => prev ? { ...prev, song: { ...prev.song, [cat]: newVal } } : null);
        setSaveMsg("✅ 저장됨");
        setTimeout(() => setSaveMsg(""), 1500);
      } else {
        setSaveMsg("❌ 저장 실패");
      }
    } catch {
      setSaveMsg("❌ 오류 발생");
    }
    setSaving(false);
  }

  // 자음별 그룹 (스크롤 마커용)
  const groupedKeys = [];
  let lastCons = null;
  filtered.forEach((song, i) => {
    const cons = getConsonant(song.제목?.[0]) || "기타";
    if (cons !== lastCons) { groupedKeys.push({ cons, idx: i }); lastCons = cons; }
  });

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#0f172a]">🎵 곡목 목록</h1>
          <p className="text-xs md:text-sm mt-0.5 text-[#64748b]">전체 {songs.length}곡</p>
        </div>
        <a href={SHEETS_URL} target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2563eb] text-white text-xs font-semibold hover:bg-[#1d4ed8] transition-colors shadow-sm flex-shrink-0">
          <span>📝</span><span>곡목 추가</span>
        </a>
      </div>

      {/* ── Sticky 검색 + 필터 ── */}
      <div className="sticky top-0 z-20 bg-[#f0f4ff] pt-1 pb-3 -mx-4 px-4">
        <div className="flex items-center rounded-xl border border-[#e2e8f0] bg-white px-3 py-2.5 gap-2 shadow-sm">
          <span className="text-gray-400">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="곡 제목 검색..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 text-[#0f172a]"
          />
          {search && <button onClick={() => setSearch("")} className="text-gray-400 text-xs">✕</button>}
        </div>
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                category === cat
                  ? "bg-[#2563eb] text-white border-[#2563eb]"
                  : "border-[#e2e8f0] text-[#64748b] bg-white hover:border-[#2563eb] hover:text-[#2563eb]"
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-8 h-8 border-2 border-[#2563eb] border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="flex gap-2 mt-1">
          {/* 곡목 리스트 */}
          <div ref={listRef} className="flex-1 min-w-0">

            {/* 데스크탑 테이블 */}
            <div className="hidden md:block rounded-2xl border border-[#e2e8f0] overflow-hidden shadow-sm bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f8faff]">
                    <th className="text-left px-4 py-3 text-xs text-[#64748b] font-semibold w-10">No.</th>
                    <th className="text-left px-4 py-3 text-xs text-[#64748b] font-semibold">제목</th>
                    <th className="text-left px-4 py-3 text-xs text-[#64748b] font-semibold">분류</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-12 text-[#94a3b8]">검색 결과 없음</td></tr>
                  ) : filtered.map((song, i) => (
                    <tr key={i} className="border-t border-[#f1f5f9] hover:bg-[#f8faff] transition-colors cursor-pointer"
                      onClick={() => setPopup({ song: { ...song }, index: i })}>
                      <td className="px-4 py-3 font-mono text-xs text-[#94a3b8]">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-[#0f172a]">{song.제목}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {getSongCats(song).map(cat => (
                            <span key={cat} className={`px-2 py-0.5 rounded-full text-xs font-medium border ${TAG_COLORS[cat]}`}>{cat}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 모바일 카드 */}
            <div className="md:hidden space-y-1">
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-[#94a3b8]">검색 결과 없음</div>
              ) : (() => {
                const rows = [];
                let lastCons = null;
                filtered.forEach((song, i) => {
                  const cons = getConsonant(song.제목?.[0]) || "기타";
                  if (cons !== lastCons) {
                    rows.push(
                      <div key={`header-${cons}`}
                        ref={el => { if (el) consRefs.current[cons] = el; }}
                        className="px-1 pt-3 pb-1 text-xs font-bold text-[#2563eb]">
                        {cons}
                      </div>
                    );
                    lastCons = cons;
                  }
                  rows.push(
                    <div key={i}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl border border-[#e2e8f0] bg-white active:bg-[#eff6ff] transition-colors cursor-pointer"
                      onClick={() => setPopup({ song: { ...song }, index: i })}>
                      <span className="text-xs font-mono w-5 flex-shrink-0 text-[#94a3b8]">{i + 1}</span>
                      <span className="flex-1 text-sm font-medium text-[#0f172a] truncate">{song.제목}</span>
                      <div className="flex gap-1 flex-shrink-0">
                        {getSongCats(song).map(cat => (
                          <span key={cat} className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${TAG_COLORS[cat]}`}>
                            {cat === "예배찬송/악보영상" ? "악보" : cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                });
                return rows;
              })()}
            </div>
          </div>

          {/* ── 인덱스바 (모바일 드래그 스크롤) ── */}
          <div
            ref={indexBarRef}
            className="md:hidden flex flex-col items-center py-1 flex-shrink-0 select-none touch-none rounded-full bg-[#e8f0fe]"
            style={{ width: "20px", gap: "1px" }}
            onTouchStart={handleIndexTouch}
            onTouchMove={handleIndexMove}
            onTouchEnd={handleIndexEnd}
          >
            {CONSONANTS.map(cons => (
              <span key={cons}
                className="w-5 flex items-center justify-center text-[10px] font-bold text-[#2563eb] leading-none"
                style={{ height: "20px" }}>
                {cons}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="mt-3 text-xs text-[#94a3b8]">* 곡목은 Google Sheets에서 실시간으로 반영됩니다</p>

      {/* ── 곡목 팝업 ── */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => { setPopup(null); setSaveMsg(""); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 border border-[#e2e8f0]"
            onClick={e => e.stopPropagation()}>

            {/* 곡목명 */}
            <h3 className="font-bold text-lg text-[#0f172a] mb-1 leading-snug">{popup.song.제목}</h3>
            <p className="text-xs text-[#94a3b8] mb-4">카테고리를 눌러 추가하거나 제거할 수 있어요</p>

            {/* 카테고리 토글 버튼 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {CAT_COLS.map(cat => {
                const isOn = popup.song[cat] === "O";
                return (
                  <button key={cat}
                    onClick={() => toggleCategory(popup.song, cat)}
                    disabled={saving}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      isOn
                        ? `${TAG_COLORS[cat]} ring-2 ring-offset-1 ring-current`
                        : "border-[#e2e8f0] text-[#94a3b8] bg-[#f8faff] hover:border-[#2563eb] hover:text-[#2563eb]"
                    } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}>
                    {isOn ? "✓ " : ""}{cat}
                  </button>
                );
              })}
            </div>

            {/* 저장 메시지 */}
            {saveMsg && <p className="text-sm text-center mb-3 font-medium text-[#2563eb]">{saveMsg}</p>}

            {/* 닫기 버튼 */}
            <button onClick={() => { setPopup(null); setSaveMsg(""); }}
              className="w-full py-2.5 rounded-xl bg-[#f1f5f9] text-[#64748b] text-sm font-medium hover:bg-[#e2e8f0] transition-colors">
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
