import { useState, useEffect } from "react";
import SongList from "./components/SongList";
import BroadcastGuide from "./components/BroadcastGuide";
import IssueLog from "./components/IssueLog";
import Notice from "./components/Notice";
import Contacts from "./components/Contacts";
import NoticeBar from "./components/NoticeBar";

const NAV_ITEMS = [
  { id: "songs", label: "🎵 곡목 목록", icon: "🎵" },
  { id: "guide", label: "📋 방송 가이드", icon: "📋" },
  { id: "issues", label: "⚠️ 이슈 기록", icon: "⚠️" },
  { id: "notice", label: "📢 공지사항", icon: "📢" },
  { id: "contacts", label: "📞 담당자 연락처", icon: "📞" },
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

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`${sidebarOpen ? "w-56" : "w-16"} flex-shrink-0 transition-all duration-300 ${
            darkMode ? "bg-gray-900 border-r border-gray-800" : "bg-white border-r border-amber-200"
          } flex flex-col`}
        >
          {/* Logo */}
          <div className={`flex items-center gap-3 px-4 py-5 border-b ${darkMode ? "border-gray-800" : "border-amber-200"}`}>
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              ✝
            </div>
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
                {sidebarOpen && <span className="truncate">{item.label.slice(2)}</span>}
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

        {/* Main */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-6">
            {activeTab === "songs" && <SongList darkMode={darkMode} />}
            {activeTab === "guide" && <BroadcastGuide darkMode={darkMode} />}
            {activeTab === "issues" && <IssueLog darkMode={darkMode} />}
            {activeTab === "notice" && <Notice darkMode={darkMode} />}
            {activeTab === "contacts" && <Contacts darkMode={darkMode} />}
          </div>
        </main>
      </div>
    </div>
  );
}
