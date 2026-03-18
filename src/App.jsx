import { useState } from "react";
import SongList from "./components/SongList";
import BroadcastGuide from "./components/BroadcastGuide";
import IssueLog from "./components/IssueLog";
import Notice from "./components/Notice";
import Contacts from "./components/Contacts";
import NoticeBar from "./components/NoticeBar";

const NAV_ITEMS = [
  { id: "songs",    label: "곡목 목록",   icon: "🎵" },
  { id: "guide",    label: "방송 가이드", icon: "📋" },
  { id: "issues",   label: "이슈 기록",   icon: "⚠️" },
  { id: "notice",   label: "공지사항",    icon: "📢" },
  { id: "contacts", label: "담당자",      icon: "📞" },
];

// 컬러 팔레트 (Rolai 스타일 — 화이트 + 블루)
const C = {
  bg:        "bg-[#f0f4ff]",
  sidebar:   "bg-white",
  border:    "border-[#e2e8f0]",
  accent:    "bg-[#2563eb]",           // 메인 블루
  accentHov: "hover:bg-[#1d4ed8]",
  accentSoft:"bg-[#eff6ff]",
  text:      "text-[#0f172a]",
  textMuted: "text-[#64748b]",
  navActive: "bg-[#2563eb] text-white",
  navHov:    "hover:bg-[#eff6ff] hover:text-[#2563eb]",
  navText:   "text-[#475569]",
  card:      "bg-white border border-[#e2e8f0]",
};

export default function App() {
  const [activeTab, setActiveTab] = useState("songs");

  return (
    <div className={`min-h-screen flex flex-col ${C.bg} font-sans`}>

      {/* 상단 공지 배너 */}
      <NoticeBar onNavigate={() => setActiveTab("notice")} />

      <div className="flex flex-1 overflow-hidden">

        {/* ── 사이드바 (데스크탑) ── */}
        <aside className={`hidden md:flex flex-col flex-shrink-0 w-56 ${C.sidebar} ${C.border} border-r`}>
          {/* 로고 */}
          <div className={`flex items-center gap-3 px-5 py-5 ${C.border} border-b`}>
            <div className="w-8 h-8 rounded-xl bg-[#2563eb] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">✝</div>
            <div>
              <p className={`font-bold text-sm ${C.text}`}>방송부</p>
              <p className={`text-xs ${C.textMuted}`}>통합관리 시스템</p>
            </div>
          </div>

          {/* 내비게이션 */}
          <nav className="flex-1 py-4 space-y-0.5 px-3">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id ? C.navActive : `${C.navText} ${C.navHov}`
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* 하단 */}
          <div className={`px-3 py-4 ${C.border} border-t`}>
            <div className={`px-3 py-2 rounded-xl text-xs ${C.textMuted} text-center`}>
              jsr-broadcast.vercel.app
            </div>
          </div>
        </aside>

        {/* ── 메인 ── */}
        <main className="flex-1 overflow-auto pb-20 md:pb-6">
          <div className="max-w-4xl mx-auto p-4 md:p-6">
            {activeTab === "songs"    && <SongList />}
            {activeTab === "guide"    && <BroadcastGuide />}
            {activeTab === "issues"   && <IssueLog />}
            {activeTab === "notice"   && <Notice />}
            {activeTab === "contacts" && <Contacts />}
          </div>
        </main>
      </div>

      {/* ── 모바일 하단 탭바 ── */}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around border-t px-1 py-1 ${C.sidebar} ${C.border}`}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all flex-1 ${
              activeTab === item.id ? "text-[#2563eb]" : "text-[#94a3b8]"
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            {activeTab === item.id && <span className="w-1 h-1 rounded-full bg-[#2563eb]" />}
          </button>
        ))}
      </nav>
    </div>
  );
}
