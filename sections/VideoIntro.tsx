'use client';
import { useRef, useEffect } from 'react';
import { media } from '@/lib/media';

// 단일 통합 영상(묘목 심기 → 나무 성장 → 사계절 → 웨딩 피날레) 재생.
const INTRO_VIDEO = media('/video/main.mp4');

interface Props {
  onComplete: () => void;
}

export default function VideoIntro({ onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // 인트로 재생 중에 뒤이어 나올 MainSection 리소스(웨딩 사진 9장 + 메인 프레임) 프리페치
  useEffect(() => {
    const assets = [
      media('/images/frames/mainImage.jpg?v=2'),
      ...Array.from({ length: 9 }, (_, i) => media(`/weddingImages/1-${i + 1}.jpg`)),
    ];
    assets.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  return (
    <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] md:max-w-[720px] z-50 bg-[#FDFAF5]">
      {/* 블러 백드롭 (전 기기 공통 — 여백을 자연스럽게 채움) */}
      <video
        src={INTRO_VIDEO}
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'blur(28px) brightness(0.9)', transform: 'scale(1.1)' }}
      />
      {/* 메인 영상 — 원본 비율 유지 (contain) */}
      <video
        ref={videoRef}
        src={INTRO_VIDEO}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={onComplete}
        className="absolute inset-0 w-full h-full object-contain"
      />
    </div>
  );
}
