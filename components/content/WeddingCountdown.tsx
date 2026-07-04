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
    <div className="flex flex-col items-center">
      <div className="w-[58px] md:w-[68px] py-3 md:py-3.5 rounded-2xl bg-white/70 border border-stone-200 shadow-sm">
        <span
          className="block text-2xl md:text-3xl font-medium text-stone-700 tabular-nums leading-none"
          style={{ fontFamily: 'serif' }}
        >
          {pad(value)}
        </span>
      </div>
      <span className="mt-2 text-[10px] md:text-xs tracking-[0.15em] text-stone-400 uppercase">{label}</span>
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
      <div>
        <p className="text-xs md:text-sm text-stone-500 mb-4" style={{ fontFamily: 'serif' }}>
          결혼식까지 남은 시간
        </p>
        <div className="flex items-start justify-center gap-2 md:gap-3">
          <Cell value={left.days} label="Days" />
          <span className="text-2xl md:text-3xl text-stone-300 leading-none mt-2.5">:</span>
          <Cell value={left.hours} label="Hour" />
          <span className="text-2xl md:text-3xl text-stone-300 leading-none mt-2.5">:</span>
          <Cell value={left.minutes} label="Min" />
          <span className="text-2xl md:text-3xl text-stone-300 leading-none mt-2.5">:</span>
          <Cell value={left.seconds} label="Sec" />
        </div>
      </div>

      {/* 2) 함께한 지 — 아치 창문(양쪽 셔터 열림) + 추억 사진 */}
      <div className="mt-16 flex flex-col items-center">
        {/* 아치 프레임 */}
        <div className="relative" style={{ maxWidth: 'min(68%, 264px)', width: '100%' }}>
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

          {/* 사진 (아치) */}
          <div
            className="overflow-hidden bg-stone-100 shadow-[0_18px_38px_-18px_rgba(60,48,32,0.4)]"
            style={{ borderRadius: '50% 50% 10px 10px / 32% 32% 6px 6px' }}
          >
            <img
              src={media('/images/frames/image.png')}
              alt="우리의 추억"
              draggable={false}
              className="block w-full h-auto select-none"
            />
          </div>

          {/* 골드 키라인 (아치 윤곽) */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: '50% 50% 10px 10px / 32% 32% 6px 6px',
              boxShadow: 'inset 0 0 0 1px rgba(194,160,108,0.75)',
            }}
          />
        </div>

        {/* 다이아몬드 디바이더 */}
        <div className="flex items-center justify-center gap-3 mt-9 mb-5">
          <div className="h-px w-10 bg-stone-300/60" />
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M8 2L9.5 6.5L14 8L9.5 9.5L8 14L6.5 9.5L2 8L6.5 6.5L8 2Z" fill="#c2a06c" fillOpacity="0.45" />
          </svg>
          <div className="h-px w-10 bg-stone-300/60" />
        </div>

        {/* 라벨 + 카운터 */}
        <p className="text-[10px] md:text-xs tracking-[0.35em] text-stone-400 uppercase mb-3">Our Days</p>
        <div className="flex items-center justify-center gap-2.5 mb-3">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M8 2L9.5 6.5L14 8L9.5 9.5L8 14L6.5 9.5L2 8L6.5 6.5L8 2Z" fill="#c2a06c" fillOpacity="0.6" />
          </svg>
          <span className="text-sm md:text-base text-stone-500" style={{ fontFamily: 'serif' }}>
            우리가 함께한 시간
          </span>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M8 2L9.5 6.5L14 8L9.5 9.5L8 14L6.5 9.5L2 8L6.5 6.5L8 2Z" fill="#c2a06c" fillOpacity="0.6" />
          </svg>
        </div>
        <p className="text-[15px] md:text-lg font-bold text-stone-700 tabular-nums tracking-wide" style={{ fontFamily: 'serif' }}>
          &ldquo;{e.years}년 {e.months}개월 {e.days}일 {e.hours}시간 {e.minutes}분 {e.seconds}초&rdquo;
        </p>
      </div>
    </div>
  );
}
