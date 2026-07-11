'use client';
import { useEffect, useRef, useState } from 'react';
import { media } from '@/lib/media';

// 단일 통합 영상(묘목 심기 → 나무 성장 → 사계절 → 웨딩 피날레) 재생.
const INTRO_VIDEO = '/video/main.mp4';

interface Props {
  onComplete: () => void;
}

export default function VideoIntro({ onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const doneRef = useRef(false);
  const prefetchedRef = useRef(false);
  const startedRef = useRef(false);
  const [showOnboarding, setShowOnboarding] = useState(true);

  const prefetchMainAssets = () => {
    if (prefetchedRef.current) return;
    prefetchedRef.current = true;

    const assets = [
      media('/images/frames/mainImage.jpg?v=2'),
      ...Array.from({ length: 5 }, (_, i) => media(`/weddingImages/main-${i + 1}.jpg`)),
    ];
    assets.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  };

  const complete = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onComplete();
  };

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (!startedRef.current) complete();
    }, 2000);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] md:max-w-[720px] z-50 bg-[#FDFAF5]">
      <video
        ref={videoRef}
        src={media(INTRO_VIDEO)}
        autoPlay
        muted
        playsInline
        preload="metadata"
        onPlaying={() => {
          startedRef.current = true;
          window.setTimeout(prefetchMainAssets, 1200);
        }}
        onEnded={complete}
        onError={complete}
        onAbort={complete}
        className="absolute inset-0 w-full h-full object-contain"
      />

      {showOnboarding && (
        <button
          type="button"
          onClick={() => setShowOnboarding(false)}
          className="absolute inset-x-6 bottom-[max(4.5rem,env(safe-area-inset-bottom))] z-[55]
            mx-auto flex max-w-[320px] flex-col items-center gap-2 rounded-2xl
            border border-white/25 bg-black/20 px-5 py-4 text-center text-white/90
            shadow-[0_12px_28px_rgba(0,0,0,0.12)] backdrop-blur-[2px]
            transition active:scale-[0.99]"
          aria-label="음악 재생 안내 닫기"
        >
          <span className="text-sm font-jua tracking-wide md:text-base">
            화면을 탭하면 음악이 함께 재생돼요
          </span>
          <span className="text-[11px] text-white/60 md:text-xs">
            탭해서 안내 닫기
          </span>
        </button>
      )}

      {/* 영상 스킵하기 — 재생 중(=이 컴포넌트가 떠 있는 동안)에만 노출. 우측 상단 */}
      <button
        onClick={complete}
        aria-label="영상 스킵하기"
        className="absolute right-16 top-[max(1rem,env(safe-area-inset-top))] z-[60] flex items-center gap-1 rounded-full bg-black/40 hover:bg-black/60 text-white text-[11px] md:text-xs font-jua tracking-wide px-2.5 py-1.5 backdrop-blur-sm shadow-md transition-colors"
      >
        영상 스킵하기
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 4l10 8-10 8V4z" />
          <line x1="19" y1="5" x2="19" y2="19" />
        </svg>
      </button>
    </div>
  );
}
