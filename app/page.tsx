'use client';
import { useState, useEffect } from 'react';
import VideoIntro from '@/sections/VideoIntro';
import MainSection from '@/sections/MainSection';
import JourneySection from '@/sections/JourneySection';
import InfoSection from '@/sections/InfoSection';
import LocationMap from '@/components/content/LocationMap';
import KakaoShare from '@/components/content/KakaoShare';
import BackgroundMusic from '@/components/content/BackgroundMusic';
import { media } from '@/lib/media';

const SEEN_KEY = 'wedding-video-seen';

export default function Home() {
  // null = 아직 localStorage 확인 전 (SSR/hydration 대응)
  const [videosDone, setVideosDone] = useState<boolean | null>(null);

  useEffect(() => {
    const seen = typeof window !== 'undefined' && localStorage.getItem(SEEN_KEY) === '1';
    setVideosDone(seen);
  }, []);

  const handleVideoComplete = () => {
    try { localStorage.setItem(SEEN_KEY, '1'); } catch {}
    setVideosDone(true);
  };

  const handleReplay = () => setVideosDone(false);

  return (
    <>
      {/* 데스크탑(>720px): 메인 이미지 블러 백드롭 */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 hidden lg:block bg-cover bg-center"
        style={{
          backgroundImage: `url('${media('/images/frames/mainImage.jpg')}')`,
          filter: 'blur(40px) brightness(0.85)',
          transform: 'scale(1.15)',
        }}
      />
      <div
        aria-hidden
        className="fixed inset-0 -z-10 hidden lg:block bg-black/20"
      />

      <main className="relative w-full max-w-[430px] md:max-w-[720px] mx-auto bg-[#FDFAF5] overflow-hidden lg:shadow-[0_0_60px_rgba(0,0,0,0.35)]">
        <BackgroundMusic />

        {videosDone === false && (
          <VideoIntro onComplete={handleVideoComplete} />
        )}

        {videosDone === true && (
          <>
            <MainSection onReplay={handleReplay} />
            <JourneySection />
            <InfoSection />
            <LocationMap />
            <KakaoShare />
          </>
        )}
      </main>
    </>
  );
}
