import { useState, useEffect, useRef } from "react";
import { fetchSheet, DEMO_DATA, CONFIG } from "../config/sheets";

const CATEGORIES = ["전체", "명곡", "뮤비", "예배찬송/악보영상", "준비찬양"];
const SHEETS_URL = `https://docs.google.com/spreadsheets/d/1TlWKZ5tr531kNZMBLLwb4PjX6ON1JY03i4fHrvJE6OM/edit#gid=0`;

const TAG_COLORS = {
  "명곡":            "bg-purple-100 text-purple-700 border-purple-200",
  "뮤비":            "bg-pink-100 text-pink-700 border-pink-200",
  "예배찬송/악보영상": "bg-green-100 text-green-700 border-green-200",
  "준비찬양":         "bg-blue-100 text-blue-700 border-blue-200",
};

const CONSONANTS = ["ㄱ","ㄴ","ㄷ","ㄹ","ㅁ","ㅂ","ㅅ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ","A-Z"];

function getConsonant(char) {
  const code = char?.charCodeAt(0);
  if (!code) return null;
  if (code >= 65 && code <= 90) return "A-Z";
  if (code >= 97 && code <= 122) return "A-Z";
  if (code < 0xAC00 || code > 0xD7A3) return null;
  const idx = Math.floor((code - 0xAC00) / 28 / 21);
  const cons = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
  const c = cons[idx];
  if (["ㄲ"].includes(c)) return "ㄱ";
  if (["ㄸ"].includes(c)) return "ㄷ";
  if (["ㅃ"].includes(c)) return "ㅂ";
  if (["ㅆ"].includes(c)) return "ㅅ";
  if (["ㅉ"].includes(c)) return "ㅈ";
  return c;
}

function getSongCats(song) {
  return CATEGORIES.filter(c => c !== "전체" && song[c] === "O");
}

const DEMO_SONGS = [
  { 제목: "가는 길",   명곡: "O", 뮤비: "O", "예배찬송/악보영상": "", 준비찬양: "" },
  { 제목: "나의 피난처", 명곡: "", 뮤비: "", "예배찬송/악보영상": "O", 준비찬양: "O" },
  { 제목: "다 드리리", 명곡: "O", 뮤비: "", "예배찬송/악보영상": "", 준비찬양: "" },
  { 제목: "Amazing Grace", 명곡: "O", 뮤비: "", "예배찬송/악보영상": "", 준비찬양: "" },
];

export default function SongList() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("전체");
  const [activeConsonant, setActiveConsonant] = useState(null);
  const listRef = useRef(null);
  const searchRef = useRef(null);
  const rowRefs = useRef({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (CONFIG.SHEET_ID === "YOUR_GOOGLE_SHEET_ID") { setSongs(DEMO_SONGS); setLoading(false); return; }
      const data = await fetchSheet("Songs");
      setSongs(data || DEMO_SONGS);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = songs.filter(s => {
    const matchCat = category === "전체" || s[category] === "O";
    const matchSearch = !search || s.제목?.toLowerCase().includes(search.toLowerCase());
    const matchCons = !activeConsonant || getConsonant(s.제목?.[0]) === activeConsonant;
    return matchCat && matchSearch && matchCons;
  });

  function scrollToConsonant(cons) {
    setActiveConsonant(prev => prev === cons ? null : cons);
    setSearch("");
  }

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

      {/* 검색 — 모바일 sticky */}
      <div ref={searchRef} className="sticky top-0 z-20 bg-[#f0f4ff] pb-2 pt-1">
        <div className="flex items-center rounded-xl border border-[#e2e8f0] bg-white px-3 py-2.5 gap-2 shadow-sm">
          <span className="text-gray-400">🔍</span>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setActiveConsonant(null); }}
            placeholder="곡 제목 검색..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 text-[#0f172a]"
          />
          {search && <button onClick={() => setSearch("")} className="text-gray-400 text-xs">✕</button>}
        </div>

        {/* 카테고리 필터 */}
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                category === cat
                  ? "bg-[#2563eb] text-white border-[#2563eb]"
                  : "border-[#e2e8f0] text-[#64748b] hover:border-[#2563eb] hover:text-[#2563eb] bg-white"
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
        <div className="flex gap-2 mt-2">
          {/* 곡목 리스트 */}
          <div ref={listRef} className="flex-1 min-w-0">
            {/* 데스크탑 테이블 */}
            <div className="hidden md:block rounded-2xl border border-[#e2e8f0] overflow-hidden shadow-sm bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f8faff]">
                    <th className="text-left px-4 py-3 font-semibold text-xs text-[#64748b] w-10">No.</th>
                    <th className="text-left px-4 py-3 font-semibold text-xs text-[#64748b]">제목</th>
                    <th className="text-left px-4 py-3 font-semibold text-xs text-[#64748b]">분류</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-12 text-[#94a3b8]">검색 결과가 없습니다</td></tr>
                  ) : filtered.map((song, i) => (
                    <tr key={i} className="border-t border-[#f1f5f9] hover:bg-[#f8faff] transition-colors">
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
            <div className="md:hidden space-y-1.5">
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-[#94a3b8]">검색 결과가 없습니다</div>
              ) : filtered.map((song, i) => {
                const cats = getSongCats(song);
                const cons = getConsonant(song.제목?.[0]);
                return (
                  <div key={i} ref={el => { if (cons) rowRefs.current[cons] = el; }}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl border border-[#e2e8f0] bg-white">
                    <span className="text-xs font-mono w-5 flex-shrink-0 text-[#94a3b8]">{i + 1}</span>
                    <span className="flex-1 text-sm font-medium text-[#0f172a] min-w-0 truncate">{song.제목}</span>
                    <div className="flex gap-1 flex-shrink-0">
                      {cats.map(cat => (
                        <span key={cat} className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${TAG_COLORS[cat]}`}>
                          {cat === "예배찬송/악보영상" ? "악보" : cat}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ㄱ~ㅎ 사이드 인덱스 바 (모바일만) */}
          <div className="md:hidden flex flex-col items-center gap-0.5 py-1 flex-shrink-0">
            {CONSONANTS.map(cons => (
              <button key={cons} onClick={() => scrollToConsonant(cons)}
                className={`w-5 h-5 flex items-center justify-center rounded text-[9px] font-bold transition-all ${
                  activeConsonant === cons
                    ? "bg-[#2563eb] text-white"
                    : "text-[#94a3b8] hover:text-[#2563eb]"
                }`}>
                {cons}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="mt-3 text-xs text-[#94a3b8]">* 곡목은 Google Sheets에서 실시간으로 반영됩니다</p>
    </div>
  );
}
