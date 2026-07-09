'use client';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import VideoIntro from '@/sections/VideoIntro';
import MainSection from '@/sections/MainSection';
import InfoSection from '@/sections/InfoSection';
import LocationMap from '@/components/content/LocationMap';
import AccountsSection from '@/sections/AccountsSection';
import NoticeSection from '@/sections/NoticeSection';
import KakaoShare from '@/components/content/KakaoShare';
import BackgroundMusic from '@/components/content/BackgroundMusic';
import Guestbook from '@/components/content/Guestbook';
import { media } from '@/lib/media';

const SEEN_KEY = 'wedding-video-seen';

export default function Home() {
  // null = 아직 localStorage 확인 전 (SSR/hydration 대응)
  const [videosDone, setVideosDone] = useState<boolean | null>(null);

  useEffect(() => {
    let seen = false;
    try { seen = window.localStorage?.getItem(SEEN_KEY) === '1'; } catch {}
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
          backgroundImage: `url('${media('/images/frames/mainImage.jpg?v=2')}')`,
          filter: 'blur(40px) brightness(0.85)',
          transform: 'scale(1.15)',
        }}
      />
      <div
        aria-hidden
        className="fixed inset-0 -z-10 hidden lg:block bg-black/20"
      />

      <main className="relative w-full max-w-[430px] md:max-w-[720px] mx-auto bg-[#FDFAF5] overflow-hidden lg:shadow-[0_0_60px_rgba(0,0,0,0.35)]">
        <BackgroundMusic intro={videosDone === false} />

        <AnimatePresence initial={false}>
          {videosDone === false && (
            <motion.div
              key="intro"
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: 'easeInOut' }}
            >
              <VideoIntro onComplete={handleVideoComplete} />
            </motion.div>
          )}

          {videosDone === true && (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.15, ease: 'easeOut' }}
            >
              <MainSection onReplay={handleReplay} />
              <InfoSection />
              <LocationMap />
              <AccountsSection />
              <NoticeSection />
              <Guestbook />
              <KakaoShare />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
