import { useState, useEffect } from "react";
import { fetchSheet, DEMO_DATA, CONFIG } from "../config/sheets";

// Sheets 컬럼명과 동일하게 맞춤
const CATEGORIES = ["전체", "명곡", "뮤비", "예배찬송/악보영상", "준비찬양"];

const TAG_DARK = {
  "명곡":           "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "뮤비":           "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "예배찬송/악보영상": "bg-green-500/20 text-green-400 border-green-500/30",
  "준비찬양":        "bg-blue-500/20 text-blue-400 border-blue-500/30",
};
const TAG_LIGHT = {
  "명곡":           "bg-purple-100 text-purple-700 border-purple-200",
  "뮤비":           "bg-pink-100 text-pink-700 border-pink-200",
  "예배찬송/악보영상": "bg-green-100 text-green-700 border-green-200",
  "준비찬양":        "bg-blue-100 text-blue-700 border-blue-200",
};

// 한 곡이 속한 카테고리 목록 반환 (O 체크 방식)
function getSongCats(song) {
  return CATEGORIES.filter(c => c !== "전체" && song[c] === "O");
}

// 데모 데이터도 B방식으로 변환
const DEMO_SONGS = [
  { 제목: "주님 나라 임하시면", 명곡: "",  뮤비: "",  "예배찬송/악보영상": "",  준비찬양: "O" },
  { 제목: "Amazing Grace",    명곡: "O", 뮤비: "",  "예배찬송/악보영상": "",  준비찬양: "" },
  { 제목: "주는 나를 기르시는 목자", 명곡: "", 뮤비: "", "예배찬송/악보영상": "O", 준비찬양: "" },
  { 제목: "How Great Thou Art", 명곡: "O", 뮤비: "O", "예배찬송/악보영상": "", 준비찬양: "" },
  { 제목: "주님의 은혜라",     명곡: "",  뮤비: "",  "예배찬송/악보영상": "",  준비찬양: "O" },
  { 제목: "Worthy Is The Lamb", 명곡: "", 뮤비: "O", "예배찬송/악보영상": "",  준비찬양: "" },
  { 제목: "축복송",           명곡: "",  뮤비: "",  "예배찬송/악보영상": "O", 준비찬양: "O" },
  { 제목: "10000 Reasons",   명곡: "O", 뮤비: "O", "예배찬송/악보영상": "",  준비찬양: "" },
];

export default function SongList({ darkMode }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("전체");

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (CONFIG.SHEET_ID === "YOUR_GOOGLE_SHEET_ID") {
        setSongs(DEMO_SONGS);
        setLoading(false);
        return;
      }
      const data = await fetchSheet("Songs");
      if (data === null) { setError(true); setSongs(DEMO_SONGS); }
      else setSongs(data);
      setLoading(false);
    }
    load();
  }, []);

  // 다중 분류 필터링 — 선택한 카테고리에 O인 곡만 표시
  const filtered = songs.filter(s => {
    const matchCat = category === "전체" || s[category] === "O";
    const matchSearch = !search || s.제목?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const tagMap = darkMode ? TAG_DARK : TAG_LIGHT;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">🎵 곡목 목록</h1>
          <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {category === "전체" ? `전체 ${songs.length}곡` : `${category} ${filtered.length}곡`}
            {error && <span className="text-amber-400 ml-2">⚠ 시트 연결 실패, 데모 데이터 표시 중</span>}
          </p>
        </div>
        {/* Search */}
        <div className={`relative flex items-center rounded-xl border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} px-3 py-2 gap-2 w-64 shadow-sm`}>
          <span className="text-gray-400">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="곡 제목 검색..."
            className={`flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 ${darkMode ? "text-white" : "text-gray-800"}`}
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {CATEGORIES.map(cat => {
          const count = cat === "전체"
            ? songs.length
            : songs.filter(s => s[cat] === "O").length;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                category === cat
                  ? "bg-amber-500 text-white border-amber-500 shadow-md"
                  : darkMode
                  ? "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
                  : "border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-700"
              }`}
            >
              {cat}
              <span className={`ml-1.5 text-xs ${category === cat ? "text-amber-100" : darkMode ? "text-gray-500" : "text-gray-400"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className={`rounded-2xl border overflow-hidden ${darkMode ? "border-gray-800" : "border-gray-200"} shadow-sm`}>
          <table className="w-full text-sm">
            <thead>
              <tr className={darkMode ? "bg-gray-800/80" : "bg-amber-50"}>
                <th className={`text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide w-10 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>No.</th>
                <th className={`text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide ${darkMode ? "text-gray-400" : "text-gray-500"}`}>제목</th>
                <th className={`text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide ${darkMode ? "text-gray-400" : "text-gray-500"}`}>분류</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className={`text-center py-12 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                    검색 결과가 없습니다
                  </td>
                </tr>
              ) : (
                filtered.map((song, i) => {
                  const cats = getSongCats(song);
                  return (
                    <tr
                      key={i}
                      className={`border-t transition-colors ${
                        darkMode
                          ? "border-gray-800 hover:bg-gray-800/50"
                          : "border-gray-100 hover:bg-amber-50/80"
                      }`}
                    >
                      <td className={`px-4 py-3 font-mono text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                        {i + 1}
                      </td>
                      <td className={`px-4 py-3 font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {song.제목}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 flex-wrap">
                          {cats.map(cat => (
                            <span
                              key={cat}
                              className={`px-2 py-0.5 rounded-full text-xs font-medium border ${tagMap[cat]}`}
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className={`mt-3 text-xs ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
        * 곡목은 Google Sheets에서 실시간으로 반영됩니다
      </p>
    </div>
  );
}
