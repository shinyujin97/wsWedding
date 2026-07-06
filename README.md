# 청첩장 (wedding-invite)

Next.js 16 청첩장 앱. 프로덕션: **https://wedding-invite-flame-xi.vercel.app**

---

## 공동작업자 셋업 & 배포 가이드

### 0. 준비물 (한 번만)
- **Node 20+** (권장 24), Git
- **Vercel 계정** — 이 프로젝트 팀(`wedding-invite`)에 **멤버 초대가 되어 있어야** 같은 프로덕션 URL로 배포됩니다. (초대는 프로젝트 소유자가 진행 → 아래 "소유자 To-Do" 참고)
- **Kakao JavaScript 키** — 소유자에게 별도로 전달받으세요. (지도/공유 기능용)

### 1. 클론 & 설치
```bash
git clone https://github.com/shinyujin97/wsWedding.git
cd wsWedding
npm install
```
> 이 repo의 루트가 곧 Next 앱입니다. 별도 하위폴더로 들어갈 필요 없음.

### 2. 환경변수 (.env.local)
```bash
cp .env.example .env.local
```
`.env.local`을 열어 **Kakao 키 두 줄**만 실제 값으로 채우세요:
```
NEXT_PUBLIC_KAKAO_MAP_KEY=<전달받은 카카오 JS 키>
NEXT_PUBLIC_KAKAO_APP_KEY=<전달받은 카카오 JS 키>
```
- 사진/영상/음악은 git에 없습니다. `.env.example`에 이미 들어있는
  `NEXT_PUBLIC_MEDIA_BASE`(Vercel Blob 주소) 덕분에 **로컬에 미디어 파일이 없어도**
  개발 서버에서 이미지/영상/음악이 정상 표시됩니다. 이 줄은 건드리지 마세요.
- `.env.local`은 gitignore됨 → 절대 커밋되지 않습니다.

### 3. 로컬 개발
```bash
npm run dev            # http://localhost:3000
```
- 인트로 영상부터 다시 보려면: 브라우저 콘솔(F12)에서 `localStorage.clear()` 후 새로고침
  (안 하면 "이미 봤음" 기록 때문에 본문부터 뜸)

### 4. 브랜치 작업물 프리뷰 배포 (공동작업자용)
> 브랜치에서 작업한 걸 남에게 보여주거나 실기기에서 확인할 때 씁니다.
> **프로덕션(운영 URL)은 안 건드립니다.**

```bash
npx vercel login       # 본인 Vercel 계정으로 로그인 (최초 1회)
npx vercel link        # 프로젝트 연결 (최초 1회) — 아래 주의 참고
npx vercel             # ← --prod 없이 실행 = "프리뷰" 배포
```
→ 실행할 때마다 `wedding-invite-<랜덤>-....vercel.app` 형태의 **일회성 프리뷰 URL**이 나옵니다.
이 URL을 공유해 확인하면 됩니다. 미디어(사진/영상/음악)는 Blob에서 로드되므로 프리뷰에서도 정상 표시됩니다.

- `vercel link` 선택지:
  - 소유자 팀에 **초대받았다면** → 기존 `wedding-invite` 프로젝트 선택 (프리뷰가 소유자 대시보드에도 보임).
  - 초대 못 받았거나 그냥 편하게 → **본인 계정에 새 프로젝트로 링크**해도 됩니다. 프리뷰 용도로는 아무 문제 없어요. (Pro 플랜 불필요)
- ⚠️ 프리뷰라도 **`--prod`는 절대 붙이지 마세요** — 붙이면 진짜 운영에 반영됩니다.

### 4-1. 프로덕션 배포 (소유자 전용)
> ⚠️ GitHub에 push만 하면 **라이브는 안 바뀝니다** (자동배포 미연동). 리뷰가 끝나 브랜치를 합친 뒤,
> **소유자가** 아래로 운영에 반영합니다.

```bash
npx vercel --prod      # 프로덕션 배포 → https://wedding-invite-flame-xi.vercel.app
```
- 코드 변경만이면 이걸로 끝. **사진/영상 교체는 이 방법으로 안 됩니다** (아래 참고).

### 5. 미디어(사진/영상/음악) 교체는?
미디어는 Vercel **Blob**에 있고, git/배포와 별개입니다.
Blob 업로드 토큰(`BLOB_READ_WRITE_TOKEN`)이 필요하며 관리자 전용이므로,
**미디어 교체는 소유자에게 요청**하세요. (자세한 절차는 소유자가 보유)

---

## 소유자 To-Do
1. **Kakao JS 키**를 안전한 경로(메신저 DM 등)로 전달. repo에 커밋 금지.
   → 이것만 있으면 공동작업자는 본인 계정으로 **프리뷰 배포**가 바로 됩니다 (초대 불필요).
2. (선택) 공동작업자에게 **운영 프로젝트 배포 권한**까지 주고 싶다면:
   Vercel 대시보드 → **wedding-invite** → **Settings → Members → Invite** 로 이메일 초대.
   - ⚠️ 팀 멤버 초대는 **Pro 플랜**에서만 됩니다. Hobby(무료)면 프로덕션 반영은 소유자가 대신 하세요.
     (프리뷰는 어차피 공동작업자 본인 계정으로 되니 초대 없이도 문제없음.)

---

## 스택
- Next.js 16.2.4 (App Router) / React / TypeScript
- framer-motion, gsap
- 미디어: Vercel Blob (`lib/media.ts` + `NEXT_PUBLIC_MEDIA_BASE`)
- 지도/공유: Kakao SDK
