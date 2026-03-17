# ✝ 방송부 통합관리 시스템

React + Tailwind CSS + Google Sheets 기반 교회 방송부 대시보드

## 🚀 기능

- 🎵 **곡목 목록** — 분류별 필터, 실시간 검색
- 📋 **방송 가이드** — Google Slides 임베드 / 체크리스트 / 즐겨찾기
- ⚠️ **이슈 기록** — 카테고리별 방송 장애 기록
- 📢 **공지사항** — 상단 공지 배너 + 게시판
- 📞 **담당자 연락처** — 파트별 카드

---

## ⚙️ 설정 방법

### 1. 프로젝트 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.example`을 복사해서 `.env` 파일로 만들고 값을 입력하세요:

```bash
cp .env.example .env
```

```
VITE_GOOGLE_API_KEY=your_api_key
VITE_SHEET_ID=your_sheet_id
VITE_SLIDES_URL=your_slides_embed_url
```

### 3. Google Sheets API 키 발급

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성
3. `Google Sheets API` 검색 → 활성화
4. 사용자 인증 정보 → `API 키` 생성
5. `VITE_GOOGLE_API_KEY`에 입력

### 4. Google Sheets 구성

시트 이름과 컬럼 구조:

| 시트명 | 컬럼 |
|--------|------|
| Songs | 번호, 제목, 분류, 비고 |
| Issues | 날짜, 카테고리, 제목, 내용, 해결방법 |
| Notice | 날짜, 제목, 내용, 중요도(high/normal) |
| Contacts | 이름, 파트, 연락처, 이메일, 비고 |
| Checklist | 카테고리, 항목 |
| Bookmarks | 이름, URL, 설명 |

> 시트 공유 설정: **링크 있는 모든 사용자 → 뷰어**

Sheet ID는 시트 URL에서 확인:  
`https://docs.google.com/spreadsheets/d/`**여기가_ID**`/edit`

### 5. Google Slides 임베드 (방송 가이드)

1. Google Slides 열기
2. 파일 → 웹에 게시 → 임베드
3. URL 복사 → `VITE_SLIDES_URL`에 입력

---

## 🛠 로컬 실행

```bash
npm run dev
```

## 🌐 Vercel 배포

1. GitHub에 코드 push
2. [Vercel](https://vercel.com) → 새 프로젝트 → GitHub 연결
3. 환경변수 (Settings → Environment Variables) 에 `.env` 값 입력
4. Deploy 클릭!

---

## 📁 폴더 구조

```
src/
├── App.jsx
├── main.jsx
├── index.css
├── config/
│   └── sheets.js       # Google Sheets 설정 + 데모 데이터
└── components/
    ├── NoticeBar.jsx   # 상단 공지 배너
    ├── SongList.jsx    # 곡목 목록
    ├── BroadcastGuide.jsx # 방송 가이드
    ├── IssueLog.jsx    # 이슈 기록
    ├── Notice.jsx      # 공지사항
    └── Contacts.jsx    # 담당자 연락처
```

> **API 키 미설정 시**: 데모 데이터로 자동 실행되어 UI를 미리 확인할 수 있습니다.

---

## 📝 Google Apps Script 설정 (공지/이슈 작성 기능)

공지사항과 이슈를 앱에서 직접 작성하려면 Google Apps Script Web App 설정이 필요합니다.

### 1. Apps Script 열기
Google Sheets 상단 메뉴 → **확장 프로그램** → **Apps Script**

### 2. 아래 코드 붙여넣기

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById('YOUR_SHEET_ID'); // ← 시트 ID 입력
    const sheet = ss.getSheetByName(data.sheet);
    if (!sheet) throw new Error('Sheet not found: ' + data.sheet);
    sheet.appendRow(data.row);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// CORS 허용을 위한 doGet (필요 시)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, message: 'Church Broadcast API' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 3. 배포
1. **배포** → **새 배포** 클릭
2. 유형: **웹 앱**
3. 실행 계정: **나** (본인 Google 계정)
4. 액세스 권한: **모든 사용자** (익명 포함)
5. **배포** 클릭 → URL 복사

### 4. 환경변수 설정
복사한 URL을 `.env`의 `VITE_APPS_SCRIPT_URL`에 붙여넣기

> ⚠️ Apps Script URL은 공개되므로, `VITE_WRITE_PASSWORD`를 반드시 변경하세요!

---

## 📷 이슈 사진 첨부 방법

1. Google Drive에 사진 업로드
2. 사진 우클릭 → **공유** → **링크 복사**
3. 공유 설정을 **"링크 있는 모든 사용자 - 뷰어"** 로 변경
4. 이슈 등록 폼의 "사진 URL" 란에 붙여넣기

> Drive 링크(`https://drive.google.com/file/d/FILE_ID/...`)는 자동으로 이미지 URL로 변환됩니다.
