'use client';
import { useState } from 'react';
import VideoIntro from '@/sections/VideoIntro';
import MainSection from '@/sections/MainSection';
import InfoSection from '@/sections/InfoSection';
import LocationMap from '@/components/content/LocationMap';
import KakaoShare from '@/components/content/KakaoShare';
import BackgroundMusic from '@/components/content/BackgroundMusic';

export default function Home() {
  const [videosDone, setVideosDone] = useState(false);

  return (
    <main className="w-full max-w-[430px] mx-auto bg-[#FDFAF5]">
      <BackgroundMusic />

      {!videosDone && (
        <VideoIntro onComplete={() => setVideosDone(true)} />
      )}

      {videosDone && (
        <>
          <MainSection />
          <InfoSection />
          <LocationMap />
          <KakaoShare />
        </>
      )}
    </main>
  );
}
