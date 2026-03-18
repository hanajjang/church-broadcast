// ============================================================
// Google Sheets + Google Drive 설정 가이드
// ============================================================
// 1. https://console.cloud.google.com 접속
// 2. 새 프로젝트 생성
// 3. "Google Sheets API" 검색 → 활성화
// 4. 사용자 인증 정보 → API 키 생성 (읽기 전용)
// 5. 두 시트 모두 공유 설정: 링크 있는 모든 사용자 → 뷰어
//
// 시트 구조:
// [메인 Sheets] Songs / Notice / Contacts / Checklist / Bookmarks
// [이슈 Sheets] Google Form 응답 자동 저장
// ============================================================

export const CONFIG = {
  // 메인 Sheets (Songs, Notice, Contacts, Checklist, Bookmarks)
  SHEET_ID: import.meta.env.VITE_SHEET_ID
    || "1TlWKZ5tr531kNZMBLLwb4PjX6ON1JY03i4fHrvJE6OM",
  // 이슈 응답 Sheets (Google Form 응답 별도 파일)
  ISSUES_SHEET_ID: import.meta.env.VITE_ISSUES_SHEET_ID
    || "1R3V7u77x1LSDPrhlfqZ2vaxtlf6B-oxxpq6NKYcQ5a4",
  API_KEY: import.meta.env.VITE_GOOGLE_API_KEY || "YOUR_GOOGLE_API_KEY",
  APPS_SCRIPT_URL: import.meta.env.VITE_APPS_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbzDyaKz3S_e2TxcJeYM12uPqFsJo9FSvhHYCaOl8t6ps5qpvAvCPf1y_VYf1JRzWsI7/exec",
  WRITE_PASSWORD: import.meta.env.VITE_WRITE_PASSWORD || "broadcast2025",
  // 이슈 기록 Google Form URL
  ISSUE_FORM_URL: import.meta.env.VITE_ISSUE_FORM_URL
    || "https://forms.gle/LHWaVr98pLKwc55x8",
  // 파트별 Google Slides 임베드 URL
  GUIDE_AUDIO_URL: import.meta.env.VITE_GUIDE_AUDIO_URL
    || "https://docs.google.com/presentation/d/e/2PACX-1vRZKJHly6UFgmtNqUrDf7tgVM_GecQ_o-3TnUypBQVAW606xeArSndxZRbbodQkocJ6yE3hvIF4CRtm/pub?start=false&loop=false&delayms=60000&embedded=true",
  GUIDE_PC_URL: import.meta.env.VITE_GUIDE_PC_URL
    || "https://docs.google.com/presentation/d/e/2PACX-1vTg5QHE0QAGhrmHN_sh5ctFAeHbF-MpFJmOkRi14jXfa-8FxzOGEdP0AcqxlkyAgVVInwpRIjIUiMhn/pub?start=false&loop=false&delayms=60000&embedded=true",
  GUIDE_CAMERA_URL: import.meta.env.VITE_GUIDE_CAMERA_URL
    || "https://docs.google.com/presentation/d/e/2PACX-1vQqWeTxJowegjXUNxDK6K4o30aOkoG1v28jaeMOD8k_JnFK1fhW3WRu4pDsqniKeHWrt0yNaweRDrOO/pub?start=false&loop=false&delayms=60000&embedded=true",
  GUIDE_LIGHTING_URL: import.meta.env.VITE_GUIDE_LIGHTING_URL
    || "https://docs.google.com/presentation/d/e/2PACX-1vRH9AAzPYhzGSUfSxH0_ySAPvDjHgkos5t7yx2Yc51Kj5wafI7LXMKfOytUKaqoWQvE542ELJxU4ft0/pub?start=false&loop=false&delayms=60000&embedded=true",
};

const BASE_URL = "https://sheets.googleapis.com/v4/spreadsheets";

export async function fetchSheet(sheetName, sheetId) {
  // sheetId 없으면 메인 SHEET_ID 사용
  const id = sheetId || CONFIG.SHEET_ID;
  const url = `${BASE_URL}/${id}/values/${encodeURIComponent(sheetName)}?key=${CONFIG.API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rows = data.values || [];
    if (rows.length <= 1) return [];
    const headers = rows[0];
    return rows.slice(1).map((row) =>
      headers.reduce((obj, h, i) => ({ ...obj, [h]: row[i] || "" }), {})
    );
  } catch (err) {
    console.error(`fetchSheet(${sheetName}) error:`, err);
    return null;
  }
}

export async function appendRow(sheetName, row) {
  if (!CONFIG.APPS_SCRIPT_URL) {
    throw new Error("Apps Script URL이 설정되지 않았습니다.");
  }
  const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sheet: sheetName, row }),
  });
  if (!res.ok) throw new Error(`Write failed: ${res.status}`);
  return res.json();
}

export function driveUrlToImage(shareUrl) {
  if (!shareUrl) return null;
  const match = shareUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
  return shareUrl;
}

// Demo data
export const DEMO_DATA = {
  songs: [
    { 제목: "주님 나라 임하시면", 명곡: "",  뮤비: "",  "예배찬송/악보영상": "",  준비찬양: "O" },
    { 제목: "Amazing Grace",    명곡: "O", 뮤비: "",  "예배찬송/악보영상": "",  준비찬양: "" },
    { 제목: "주는 나를 기르시는 목자", 명곡: "", 뮤비: "", "예배찬송/악보영상": "O", 준비찬양: "" },
    { 제목: "How Great Thou Art", 명곡: "O", 뮤비: "O", "예배찬송/악보영상": "", 준비찬양: "" },
    { 제목: "주님의 은혜라",     명곡: "",  뮤비: "",  "예배찬송/악보영상": "",  준비찬양: "O" },
    { 제목: "Worthy Is The Lamb", 명곡: "", 뮤비: "O", "예배찬송/악보영상": "",  준비찬양: "" },
  ],
  issues: [
    { 날짜: "2025-03-02", 카테고리: "🖥️  PC · 모니터", 제목: "모니터 화면 미출력", "발생 상황": "HDMI 선이 메인보드 포트에 꽂혀 있었음", "해결 방법": "그래픽카드 포트로 이동", "재발 방지 포인트": "예배 전 HDMI 선 연결 확인" },
    { 날짜: "2025-02-16", 카테고리: "🎙️  음향", 제목: "마이크 잡음", "발생 상황": "무선 마이크에서 잡음 발생", "해결 방법": "배터리 교체", "재발 방지 포인트": "예비 배터리 항상 준비" },
  ],
  notice: [
    { 날짜: "2025-03-10", 제목: "새벽 방송 카페 업로드 방식 변경 안내", 내용: "이번 주부터 유튜브 비공개 업로드 후 카카오톡 공유로 변경됩니다.", 중요도: "high" },
    { 날짜: "2025-03-05", 제목: "장비 점검의 날", 내용: "3월 15일(토) 오후 2시에 전체 장비 점검을 실시합니다.", 중요도: "high" },
    { 날짜: "2025-02-28", 제목: "OBS 업데이트 완료", 내용: "방송 PC OBS 버전이 30.2.0으로 업데이트 되었습니다.", 중요도: "normal" },
  ],
  contacts: [
    { 이름: "김방송", 파트: "총괄/영상", 연락처: "010-1234-5678", 이메일: "kim@church.com", 비고: "담당자" },
    { 이름: "이음향", 파트: "음향", 연락처: "010-2345-6789", 이메일: "lee@church.com", 비고: "" },
    { 이름: "박카메라", 파트: "카메라/OBS", 연락처: "010-3456-7890", 이메일: "park@church.com", 비고: "" },
    { 이름: "최조명", 파트: "조명", 연락처: "010-4567-8901", 이메일: "choi@church.com", 비고: "" },
  ],
  checklist: [
    { 카테고리: "예배 전", 항목: "준비찬양 녹화 확인" },
    { 카테고리: "예배 전", 항목: "OBS 카메라 밝기 설정" },
    { 카테고리: "예배 전", 항목: "마이크 배터리 확인" },
    { 카테고리: "예배 전", 항목: "자막 PPT 오타 확인" },
    { 카테고리: "예배 전", 항목: "스트리밍 키 확인" },
    { 카테고리: "예배 중", 항목: "실시간 채팅 모니터링" },
    { 카테고리: "예배 중", 항목: "음향 레벨 확인" },
    { 카테고리: "예배 후", 항목: "녹화 파일 백업" },
    { 카테고리: "예배 후", 항목: "유튜브 업로드" },
    { 카테고리: "예배 후", 항목: "장비 전원 OFF 확인" },
  ],
  bookmarks: [
    { 이름: "유튜브 스튜디오", URL: "https://studio.youtube.com", 설명: "라이브/영상 관리" },
    { 이름: "교회 카페", URL: "https://cafe.naver.com", 설명: "새벽방송 업로드" },
    { 이름: "OBS 공식 사이트", URL: "https://obsproject.com", 설명: "업데이트/문서" },
    { 이름: "Vrew", URL: "https://vrew.voyagerx.com", 설명: "자막 편집" },
  ],
};
