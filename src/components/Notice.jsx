import { useState, useEffect } from "react";
import { fetchSheet, appendRow, DEMO_DATA, CONFIG } from "../config/sheets";

const EMPTY_FORM = { 제목: "", 내용: "", 중요도: "normal" };

export default function Notice({ darkMode }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitOk, setSubmitOk] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    if (CONFIG.SHEET_ID === "YOUR_GOOGLE_SHEET_ID") {
      setNotices(DEMO_DATA.notice); setLoading(false); return;
    }
    const data = await fetchSheet("Notice");
    setNotices(data || DEMO_DATA.notice);
    setLoading(false);
  }

  function openModal() {
    setShowModal(true);
    setForm(EMPTY_FORM);
    setSubmitError("");
    setSubmitOk(false);
  }

  async function handleSubmit() {
    if (!form.제목.trim() || !form.내용.trim()) {
      setSubmitError("제목과 내용은 필수입니다.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    const today = new Date().toISOString().slice(0, 10);
    const row = [today, form.제목.trim(), form.내용.trim(), form.중요도];
    try {
      await appendRow("Notice", row);
      setSubmitOk(true);
      await load();
      setTimeout(() => setShowModal(false), 1500);
    } catch (e) {
      setSubmitError(e.message || "저장 중 오류가 발생했습니다.");
    }
    setSubmitting(false);
  }

  const inputCls = `w-full rounded-xl border px-3 py-2 text-sm outline-none transition-colors ${
    darkMode
      ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-amber-500"
      : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-amber-400"
  }`;
  const labelCls = `block text-xs font-semibold mb-1.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">📢 공지사항</h1>
          <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>방송부 전달 사항</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors shadow-sm"
        >
          <span>＋</span> 공지 작성
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-3">
          {notices.length === 0 && (
            <div className={`text-center py-16 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>공지사항이 없습니다</div>
          )}
          {notices.map((notice, i) => (
            <div
              key={i}
              onClick={() => setSelected(selected === i ? null : i)}
              className={`rounded-2xl border cursor-pointer transition-all ${
                notice.중요도 === "high"
                  ? darkMode ? "border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10" : "border-amber-300 bg-amber-50 hover:bg-amber-100"
                  : darkMode ? "border-gray-800 bg-gray-900 hover:border-gray-700" : "border-gray-200 bg-white hover:border-amber-200"
              }`}
            >
              <div className="flex items-center gap-4 p-4">
                <div className="text-2xl flex-shrink-0">{notice.중요도 === "high" ? "🔔" : "📌"}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {notice.중요도 === "high" && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">중요</span>
                    )}
                    <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{notice.날짜}</span>
                  </div>
                  <p className={`font-semibold text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>{notice.제목}</p>
                </div>
                <span className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${selected === i ? "rotate-180" : ""}`}>▾</span>
              </div>
              {selected === i && (
                <div className={`px-4 pb-4 pt-2 border-t ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
                  <p className={`text-sm leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{notice.내용}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Write Modal — 비밀번호 없음 */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 ${darkMode ? "bg-gray-900 border border-gray-700" : "bg-white"}`}
            onClick={e => e.stopPropagation()}
          >
            {submitOk ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-semibold text-lg">공지가 등록되었습니다!</p>
                <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Google Sheets에 저장되었습니다.</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold">📢 공지 작성</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className={`text-xl leading-none w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? "text-gray-400 hover:bg-gray-800" : "text-gray-400 hover:bg-gray-100"}`}
                  >✕</button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>제목 *</label>
                    <input
                      value={form.제목}
                      onChange={e => setForm(f => ({ ...f, 제목: e.target.value }))}
                      placeholder="공지 제목을 입력하세요"
                      className={inputCls}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className={labelCls}>내용 *</label>
                    <textarea
                      value={form.내용}
                      onChange={e => setForm(f => ({ ...f, 내용: e.target.value }))}
                      placeholder="공지 내용을 입력하세요."
                      rows={5}
                      className={`${inputCls} resize-none`}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>중요도</label>
                    <div className="flex gap-3">
                      {[{ v: "normal", label: "📌 일반" }, { v: "high", label: "🔔 중요" }].map(opt => (
                        <button
                          key={opt.v}
                          onClick={() => setForm(f => ({ ...f, 중요도: opt.v }))}
                          className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${
                            form.중요도 === opt.v
                              ? "bg-amber-500 text-white border-amber-500"
                              : darkMode ? "border-gray-700 text-gray-400 hover:border-gray-500" : "border-gray-200 text-gray-600 hover:border-amber-300"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {submitError && <p className="text-red-400 text-xs mt-3">{submitError}</p>}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium ${darkMode ? "border-gray-700 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-50 transition-colors"
                  >
                    {submitting ? "저장 중..." : "등록하기"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
