'use client';
import { useRef, useState, useCallback } from 'react';

// 영상 3개 순서 재생
// 전환: 현재 영상이 흐려지면서(fade out) 다음 영상이 드러남
const VIDEOS = [
  '/video/seed.mp4',
  '/video/waterv1.mp4',
  '/video/tree.mp4',
];

interface Props {
  onComplete: () => void;
}

export default function VideoIntro({ onComplete }: Props) {
  const video1 = useRef<HTMLVideoElement>(null);
  const video2 = useRef<HTMLVideoElement>(null);
  const video3 = useRef<HTMLVideoElement>(null);
  const refs = [video1, video2, video3];

  // 각 영상의 opacity
  const [opacities, setOpacities] = useState([1, 0, 0]);

  const fadeToNext = useCallback((currentIdx: number) => {
    const nextIdx = currentIdx + 1;

    if (nextIdx >= VIDEOS.length) {
      onComplete();
      return;
    }

    // 다음 영상 재생 시작
    refs[nextIdx].current?.play();

    // 현재 영상 fade out → 다음 영상 fade in
    setOpacities(prev => {
      const next = [...prev];
      next[currentIdx] = 0;
      next[nextIdx] = 1;
      return next;
    });
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#FDFAF5]">
      {VIDEOS.map((src, i) => (
        <video
          key={src}
          ref={refs[i]}
          src={src}
          autoPlay={i === 0}
          muted
          playsInline
          onEnded={() => fadeToNext(i)}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: opacities[i],
            transition: 'opacity 0.5s ease',
            zIndex: i,
          }}
        />
      ))}
    </div>
  );
}
