'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import { media } from '@/lib/media';

// 영상 3개 순서 재생 (seed → waterv1 → treev2)
// 전환: 현재 영상이 흐려지면서(fade out) 다음 영상이 드러남
const VIDEOS = [
  media('/video/seed.mp4'),
  media('/video/waterv1.mp4'),
  media('/video/treev2.mp4'),
];

// waterv1 재생은 VIDEOS 내 인덱스 1
const WATER_IDX = 1;

// waterv1 재생 중 1초마다 한 해씩 표시 (2016 → 2026, 총 11장)
const WATER_CAPTIONS = ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'];

interface Props {
  onComplete: () => void;
}

export default function VideoIntro({ onComplete }: Props) {
  const video1 = useRef<HTMLVideoElement>(null);
  const video2 = useRef<HTMLVideoElement>(null);
  const video3 = useRef<HTMLVideoElement>(null);
  const refs = [video1, video2, video3];

  // 블러 백드롭용 ref (메인 영상과 같이 재생)
  const bg1 = useRef<HTMLVideoElement>(null);
  const bg2 = useRef<HTMLVideoElement>(null);
  const bg3 = useRef<HTMLVideoElement>(null);
  const bgRefs = [bg1, bg2, bg3];

  // 각 영상의 opacity
  const [opacities, setOpacities] = useState([1, 0, 0]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [captionIdx, setCaptionIdx] = useState(-1);

  const fadeToNext = useCallback((currentIdx: number) => {
    const nextIdx = currentIdx + 1;

    if (nextIdx >= VIDEOS.length) {
      onComplete();
      return;
    }

    // 다음 영상 재생 시작 (메인 + 백드롭 동시)
    refs[nextIdx].current?.play();
    bgRefs[nextIdx].current?.play();

    // 현재 영상 fade out → 다음 영상 fade in
    setOpacities(prev => {
      const next = [...prev];
      next[currentIdx] = 0;
      next[nextIdx] = 1;
      return next;
    });
    setActiveIdx(nextIdx);
  }, [onComplete]);

  // 영상 전환 시 자막 리셋 — 표시는 water 영상이 실제 재생돼 currentTime > 0 일 때부터 (onTimeUpdate)
  useEffect(() => {
    setCaptionIdx(-1);
  }, [activeIdx]);

  // 인트로 재생 중에 뒤이어 나올 MainSection 리소스(웨딩 사진 9장 + 메인 프레임 PNG) 프리페치
  useEffect(() => {
    const assets = [
      media('/images/frames/mainImage.jpg'),
      ...Array.from({ length: 9 }, (_, i) => media(`/weddingImages/1-${i + 1}.jpg`)),
    ];
    assets.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  // 영상의 currentTime 으로부터 자막 인덱스 계산 — 버퍼링/지연 시에도 동기 유지
  const CAPTION_INTERVAL = 0.9; // 초
  const handleTimeUpdate = (i: number) => (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (i !== WATER_IDX) return;
    const t = e.currentTarget.currentTime;
    if (t <= 0) return; // 아직 실제 재생 시작 전 (버퍼링 중 등) — 자막 숨김 유지
    const idx = Math.min(Math.floor(t / CAPTION_INTERVAL), WATER_CAPTIONS.length - 1);
    setCaptionIdx((prev) => (prev === idx ? prev : idx));
  };

  return (
    <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] md:max-w-[720px] z-50 bg-[#FDFAF5]">
      {VIDEOS.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0"
          style={{
            opacity: opacities[i],
            transition: 'opacity 0.5s ease',
            zIndex: i,
          }}
        >
          {/* 블러 백드롭 (전 기기 공통 — 여백을 자연스럽게 채움) */}
          <video
            ref={bgRefs[i]}
            src={src}
            autoPlay={i === 0}
            muted
            playsInline
            preload="auto"
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: 'blur(28px) brightness(0.9)',
              transform: 'scale(1.1)',
            }}
          />
          {/* 메인 영상 — 원본 비율 유지 (contain) */}
          <video
            ref={refs[i]}
            src={src}
            autoPlay={i === 0}
            muted
            playsInline
            preload="auto"
            onEnded={() => fadeToNext(i)}
            onTimeUpdate={handleTimeUpdate(i)}
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
      ))}

      {/* waterv1 재생 중 연도 자막 (상단 배치) */}
      {activeIdx === WATER_IDX && captionIdx >= 0 && (
        <div className="absolute inset-x-0 top-[18%] z-20 flex justify-center pointer-events-none">
          <p
            key={captionIdx}
            className="text-center text-4xl md:text-6xl font-cormorant font-light italic tracking-[0.18em] animate-caption-fade"
            style={{
              color: '#6B5D4D',
              textShadow: '0 1px 12px rgba(253,250,245,0.85), 0 0 24px rgba(217,186,140,0.35)',
            }}
          >
            {WATER_CAPTIONS[captionIdx]}
          </p>
        </div>
      )}

    </div>
  );
}
