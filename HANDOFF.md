# 작업 인계 메모 (2026-06-06)

## 확정된 연출 기법 (기록용)

### 연도 자막: 수채 번짐 모프 (blur crossfade morph)
- 이전 연도가 **블러 10px로 풀리며**(물감이 물에 풀리듯) 위로 떠올라 사라지는 **동시에**
  다음 연도가 블러 상태에서 또렷하게 **맺힘** → fade가 아니라 "녹아 이어지는" 느낌.
- 구현: 연도 전부 렌더하고 상태별 inline style — active(블러0/불투명) /
  past(블러10px/위로+확대) / upcoming(블러10px/아래+축소), `transition 0.75s ease`.
- 후보였던 오도미터 롤링(자릿수 슬롯 굴림)은 비교 후 탈락 (2026-06-06).
- 위치: 중앙 배치, 시작 62% → 한 해당 6%씩 상승 (식물 끝보다 항상 위).
- 2026: tree 클립 상단 6%, `captionHold` 키프레임 (블러14px→0 + 0.7→1배 확대, 1.6s).
- 클립 전환: 겹침 디졸브 — 끝나기 0.5초 전 다음 클립 미리 재생 + 0.5초 크로스페이드.

자고 일어나서 이거 보고 이어가면 됨.

## 지금 어디까지 했나

### 1. 배포 막힘 해결 ✅ (완료)
- GitHub repo(`shinyujin97/wsWedding`)가 **private이라 Vercel 배포가 막혀** 있었음.
- 개인정보/미디어가 git에서 분리됐는지 검증 → 추적 파일·히스토리·소스 전부 클린 확인.
- repo **public 전환 완료**.
- 프로덕션 배포 1회 성공 → 라이브: **https://wedding-invite-flame-xi.vercel.app**
- 미디어(사진/영상/음악)는 git이 아니라 **Vercel Blob**에서 로드됨
  (`NEXT_PUBLIC_MEDIA_BASE` 환경변수 + `lib/media.ts`). 전부 200 확인됨.

### 2. 인트로 영상 전환 자연스럽게 (진행 중 — 로컬만, 배포 안 함)
클라이언트 요청: "영상이 좀 더 자연스럽게 이어졌으면" → **클립 간 전환(프리즈/하드컷)** 문제.

수정 파일: `sections/VideoIntro.tsx`

**바꾼 내용:**
- 기존: 클립이 완전히 끝난 뒤(`onEnded`) 다음 클립 0.5초 크로스페이드
  → `움직임 → 정지(프리즈) → 페이드 → 움직임` 으로 끊겨 보였음.
- 변경: 끝나기 직전(`lead`초 전)에 다음 클립을 미리 재생 + 0.9초 겹침 디졸브
  → 양쪽이 둘 다 움직이는 중에 녹아들어 프리즈 사라짐.
- 클립별 타이밍을 파일 상단 `TRANSITION` 배열로 분리.

**영상 길이:** seed 3.04s / waterv1 10.04s / treev2 7.04s

**seed가 짧다(3초)는 요청 반영:**
seed는 `lead:0, hold:1.0` → 끝까지 재생 후 마지막 프레임에서 1초 더 머문 뒤 water로 전환.
```js
// sections/VideoIntro.tsx 상단
const TRANSITION = [
  { lead: 0,   hold: 1.0 }, // seed ← hold 숫자가 "머무는 시간". 길게 1.5 / 짧게 0.5
  { lead: 0.9, hold: 0   }, // water
  { lead: 0.9, hold: 0   }, // tree (마지막 → onComplete)
];
const DISSOLVE = 0.9; // 크로스페이드 길이(초)
```

seed 타임라인(현재 hold=1.0):
```
0 ──── 3.04초 ──── 4.04초 ──── 4.94초
 seed 재생   1초 머무름   0.9초 디졸브 → water
```

## 일어나서 할 일 (TODO)

1. **로컬에서 seed 타이밍 확인**
   - dev 서버: `npm run dev` → http://localhost:3000
     (서버 꺼졌으면 다시 실행)
   - 인트로 다시 보기: F12 콘솔에 `localStorage.clear()` 입력 후 새로고침
     (안 그러면 "이미 봤음" 기록 때문에 본문부터 뜸)
2. **`hold` 값 튜닝** — 1초가 길면 0.5, 짧으면 1.5로. `TRANSITION` 배열에서 seed의 hold만 수정 (핫리로드 즉시 반영)
3. **만족스러우면 배포**
   - `npx vercel --prod --yes`
   - 배포 후 라이브에서 영상 전환 한 번 더 확인

## 참고
- 빌드 검증: `npm run build` (현재 통과 상태)
- 아직 git commit / push 안 함. 배포 후 커밋할지 결정.
- Vercel CLI 로그인 돼있음 (계정 ssy66822-5360).
