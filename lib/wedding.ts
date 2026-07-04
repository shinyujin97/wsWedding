// 결혼식 / 연애 관련 기준 데이터 — 한 곳에서만 관리한다.
// 카운트다운, "함께한 지" 카운터, 캘린더, 메인 날짜 표기가 모두 이 값을 참조한다.
//
// 시간은 KST(+09:00) 절대 시각으로 고정한다 → 보는 사람 기기 시간대와 무관하게 동일하게 계산.

/** 결혼식 일시: 2026년 10월 17일 (토) 오후 12시 50분 (KST) */
export const WEDDING_DATE = new Date('2026-10-17T12:50:00+09:00');

/** 연애 시작일 — 2016년 4월 5일 (KST). "함께한 지" 카운터 기준일. */
export const RELATIONSHIP_START = new Date('2016-04-05T00:00:00+09:00');

/** 표기용 라벨 */
export const WEDDING_LABEL = {
  dateKo: '2026년 10월 17일 토요일',
  timeKo: '오후 12시 50분',
  venue: '아르베웨딩',
  venueDetail: 'SK리더스뷰 1F',
  address: '서울 강남구 봉은사로 302',
} as const;

/** 두 시각의 남은 시간(일/시/분/초)을 분해. 음수면 모두 0. */
export function untilParts(target: Date, now: Date) {
  let diff = Math.max(0, target.getTime() - now.getTime());
  const sec = Math.floor(diff / 1000);
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  return { days, hours, minutes, seconds };
}

/** D-day 숫자 (오늘 기준 결혼식까지 남은 일수, 당일=0). */
export function dDay(target: Date, now: Date) {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((startOfTarget.getTime() - startOfToday.getTime()) / 86400000);
}

/**
 * from→now 경과 시간을 년/월/일/시/분/초로 분해 (달력 기준, 자릿수 보정).
 * "함께한 지 0년 0개월 0일 0시간 0분 0초" 표기에 사용.
 */
export function elapsedParts(from: Date, now: Date) {
  let y = now.getFullYear() - from.getFullYear();
  let mo = now.getMonth() - from.getMonth();
  let d = now.getDate() - from.getDate();
  let h = now.getHours() - from.getHours();
  let mi = now.getMinutes() - from.getMinutes();
  let s = now.getSeconds() - from.getSeconds();

  if (s < 0) { s += 60; mi -= 1; }
  if (mi < 0) { mi += 60; h -= 1; }
  if (h < 0) { h += 24; d -= 1; }
  if (d < 0) {
    // 전월의 마지막 날 수만큼 일자 빌려오기
    const prevMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    d += prevMonthDays;
    mo -= 1;
  }
  if (mo < 0) { mo += 12; y -= 1; }

  return { years: Math.max(0, y), months: Math.max(0, mo), days: Math.max(0, d), hours: h, minutes: mi, seconds: s };
}
