'use client';
import { useEffect, useState } from 'react';
import { WEDDING_DATE, RELATIONSHIP_START, untilParts, elapsedParts } from '@/lib/wedding';
import { media } from '@/lib/media';

/**
 * WeddingCountdown — 결혼식 카운트다운 + "함께한 지" 카운터
 *
 * 구성(위→아래): 캘린더 바로 아래에 붙는다.
 *   1) 결혼식까지 실시간 Days : Hour : Min : Sec
 *   2) 대표 이미지 (image.png)
 *   3) 함께한 지 0년 0개월 0일 0시간 0분 0초 (실시간)
 *
 * 매초 갱신. SSR/hydration 불일치 방지를 위해 마운트 전엔 now=null로 자리만 잡는다.
 */

const pad = (n: number) => String(n).padStart(2, '0');

function Cell({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-w-[56px] md:min-w-[68px] flex-col items-center">
      <div className="relative w-[56px] md:w-[68px] overflow-hidden rounded-lg border border-[#d8bf8f]/60 bg-gradient-to-b from-white/90 to-[#f7efe2]/80 py-3 md:py-3.5 shadow-[0_12px_26px_-18px_rgba(70,52,28,0.55)]">
        <span className="absolute inset-x-3 top-1 h-px bg-gradient-to-r from-transparent via-[#c2a06c]/50 to-transparent" />
        <span
          className="block text-2xl md:text-3xl font-semibold text-[#5b4730] tabular-nums leading-none"
          style={{ fontFamily: 'serif' }}
        >
          {pad(value)}
        </span>
      </div>
      <span className="mt-2 text-[9px] md:text-[10px] tracking-[0.2em] text-[#9a7a47] uppercase">{label}</span>
    </div>
  );
}

export default function WeddingCountdown() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const ready = now !== null;
  const left = ready ? untilParts(WEDDING_DATE, now!) : { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const e = ready
    ? elapsedParts(RELATIONSHIP_START, now!)
    : { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };

  return (
    <div className="text-center" style={{ visibility: ready ? 'visible' : 'hidden' }}>
      {/* 1) 결혼식까지 실시간 카운트다운 — 캘린더 바로 아래 */}
      <div className="mx-auto max-w-[390px] rounded-lg border border-[#d8bf8f]/45 bg-white/45 px-3.5 py-6 shadow-[0_18px_42px_-30px_rgba(70,52,28,0.55)]">
        <div className="mb-4 flex items-center justify-center gap-3">
          <div className="h-px w-9 bg-gradient-to-r from-transparent to-[#c2a06c]/45" />
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M8 2L9.5 6.5L14 8L9.5 9.5L8 14L6.5 9.5L2 8L6.5 6.5L8 2Z" fill="#c2a06c" fillOpacity="0.55" />
          </svg>
          <div className="h-px w-9 bg-gradient-to-l from-transparent to-[#c2a06c]/45" />
        </div>
        <p className="mb-1 text-[10px] tracking-[0.32em] text-[#a48655] uppercase">Wedding Day</p>
        <p className="text-sm md:text-base text-stone-600 mb-5" style={{ fontFamily: 'serif' }}>
          결혼식까지 남은 시간
        </p>
        <div className="flex items-start justify-center gap-1.5 md:gap-2.5">
          <Cell value={left.days} label="Days" />
          <span className="text-xl md:text-2xl text-[#c2a06c]/45 leading-none mt-3">:</span>
          <Cell value={left.hours} label="Hour" />
          <span className="text-xl md:text-2xl text-[#c2a06c]/45 leading-none mt-3">:</span>
          <Cell value={left.minutes} label="Min" />
          <span className="text-xl md:text-2xl text-[#c2a06c]/45 leading-none mt-3">:</span>
          <Cell value={left.seconds} label="Sec" />
        </div>
      </div>

      {/* 2) 함께한 지 — 사진과 Our Days를 하나의 아치 프레임으로 묶음 */}
      <div className="mt-16 flex flex-col items-center">
        <div
          className="relative overflow-hidden bg-white/45 shadow-[0_22px_46px_-22px_rgba(60,48,32,0.45)]"
          style={{
            maxWidth: 'min(78%, 320px)',
            width: '100%',
            borderRadius: '50% 50% 18px 18px / 28% 28% 7% 7%',
          }}
        >
          {/* 아치 꼭대기 다이아몬드 */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            className="absolute left-1/2 -translate-x-1/2 -top-3 z-10"
            aria-hidden
          >
            <path d="M8 2L9.5 6.5L14 8L9.5 9.5L8 14L6.5 9.5L2 8L6.5 6.5L8 2Z" fill="#c2a06c" fillOpacity="0.55" />
          </svg>

          <img
            src={media('/images/frames/image.png')}
            alt="우리의 추억"
            draggable={false}
            className="block w-full h-auto select-none"
          />

          <div className="relative px-4 pt-5 pb-5 bg-[#FDFAF5]/82">
            <div className="absolute left-8 right-8 top-0 h-px bg-gradient-to-r from-transparent via-[#c2a06c]/50 to-transparent" />
            <p className="text-[10px] md:text-xs tracking-[0.35em] text-stone-400 uppercase mb-3">Our Days</p>
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M8 2L9.5 6.5L14 8L9.5 9.5L8 14L6.5 9.5L2 8L6.5 6.5L8 2Z" fill="#c2a06c" fillOpacity="0.55" />
              </svg>
              <span className="text-sm md:text-base text-stone-500" style={{ fontFamily: 'serif' }}>
                우리가 함께한 시간
              </span>
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M8 2L9.5 6.5L14 8L9.5 9.5L8 14L6.5 9.5L2 8L6.5 6.5L8 2Z" fill="#c2a06c" fillOpacity="0.55" />
              </svg>
            </div>
            <p className="text-[13px] md:text-base font-bold text-stone-700 tabular-nums tracking-wide whitespace-nowrap" style={{ fontFamily: 'serif' }}>
              &ldquo;{e.years}년 {e.months}개월 {e.days}일 {e.hours}시간 {e.minutes}분 {e.seconds}초&rdquo;
            </p>
          </div>

          {/* 골드 키라인 (아치 윤곽) */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: '50% 50% 18px 18px / 28% 28% 7% 7%',
              boxShadow: 'inset 0 0 0 1px rgba(194,160,108,0.75)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
