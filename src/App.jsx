import { useState, useEffect } from "react";
import SongList from "./components/SongList";
import BroadcastGuide from "./components/BroadcastGuide";
import IssueLog from "./components/IssueLog";
import Notice from "./components/Notice";
import Contacts from "./components/Contacts";
import NoticeBar from "./components/NoticeBar";

const NAV_ITEMS = [
  { id: "songs",    label: "곡목 목록",    icon: "🎵" },
  { id: "guide",    label: "방송 가이드",  icon: "📋" },
  { id: "issues",   label: "이슈 기록",    icon: "⚠️" },
  { id: "notice",   label: "공지사항",     icon: "📢" },
  { id: "contacts", label: "담당자",       icon: "📞" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("songs");
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "bg-gray-950 text-gray-100" : "bg-amber-50 text-gray-900"} font-sans transition-colors duration-300`}>

      {/* Top Notice Bar */}
      <NoticeBar darkMode={darkMode} onNavigate={() => setActiveTab("notice")} />

      <div className="flex flex-1 overflow-hidden">

        {/* ── 사이드바 (데스크탑만) ── */}
        <aside className={`
          hidden md:flex flex-col flex-shrink-0 transition-all duration-300
          ${sidebarOpen ? "w-56" : "w-16"}
          ${darkMode ? "bg-gray-900 border-r border-gray-800" : "bg-white border-r border-amber-200"}
        `}>
          {/* Logo */}
          <div className={`flex items-center gap-3 px-4 py-5 border-b ${darkMode ? "border-gray-800" : "border-amber-200"}`}>
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">✝</div>
            {sidebarOpen && (
              <div>
                <p className="font-bold text-sm leading-tight">방송부</p>
                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>통합관리 시스템</p>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 py-4 space-y-1 px-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  activeTab === item.id
                    ? "bg-amber-500 text-white shadow-md"
                    : darkMode
                    ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                    : "text-gray-600 hover:bg-amber-100 hover:text-gray-900"
                }`}
              >
                <span className="text-base flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Bottom */}
          <div className={`p-3 border-t ${darkMode ? "border-gray-800" : "border-amber-200"} space-y-2`}>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors ${
                darkMode ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-amber-100"
              }`}
            >
              <span>{darkMode ? "☀️" : "🌙"}</span>
              {sidebarOpen && <span>{darkMode ? "라이트 모드" : "다크 모드"}</span>}
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors ${
                darkMode ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-amber-100"
              }`}
            >
              <span>{sidebarOpen ? "◀" : "▶"}</span>
              {sidebarOpen && <span>사이드바 접기</span>}
            </button>
          </div>
        </aside>

        {/* ── 메인 콘텐츠 ── */}
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          <div className="max-w-4xl mx-auto p-4 md:p-6">
            {activeTab === "songs"    && <SongList darkMode={darkMode} />}
            {activeTab === "guide"    && <BroadcastGuide darkMode={darkMode} />}
            {activeTab === "issues"   && <IssueLog darkMode={darkMode} />}
            {activeTab === "notice"   && <Notice darkMode={darkMode} />}
            {activeTab === "contacts" && <Contacts darkMode={darkMode} />}
          </div>
        </main>
      </div>

      {/* ── 모바일 하단 탭바 ── */}
      <nav className={`
        fixed bottom-0 left-0 right-0 z-50
        flex md:hidden items-center justify-around
        border-t px-1 py-2
        ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-amber-200"}
      `}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all min-w-0 flex-1 ${
              activeTab === item.id
                ? "text-amber-500"
                : darkMode ? "text-gray-500" : "text-gray-400"
            }`}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="text-[10px] font-medium truncate w-full text-center leading-tight">
              {item.label}
            </span>
            {activeTab === item.id && (
              <span className="w-1 h-1 rounded-full bg-amber-500 mt-0.5" />
            )}
          </button>
        ))}
        {/* 다크모드 토글 */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all min-w-0 flex-1 ${
            darkMode ? "text-gray-500" : "text-gray-400"
          }`}
        >
          <span className="text-xl leading-none">{darkMode ? "☀️" : "🌙"}</span>
          <span className="text-[10px] font-medium truncate w-full text-center leading-tight">
            {darkMode ? "라이트" : "다크"}
          </span>
        </button>
      </nav>
    </div>
  );
}
