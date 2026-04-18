'use client';
import { useEffect, useRef, useState } from 'react';

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    // 모바일: 첫 터치/클릭 시 자동 재생
    const tryPlay = () => {
      audioRef.current?.play()
        .then(() => setPlaying(true))
        .catch(() => {});
    };
    document.addEventListener('touchstart', tryPlay, { once: true });
    document.addEventListener('click', tryPlay, { once: true });
  }, []);

  const toggle = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play();
    setPlaying(p => !p);
  };

  return (
    <>
      <audio ref={audioRef} src="/music/Autumn Tree of Us.mp3" loop />
      <button
        onClick={toggle}
        className="fixed top-4 right-4 z-50 w-9 h-9 rounded-full
          bg-white/70 backdrop-blur-sm border border-stone-200
          flex items-center justify-center text-base"
        aria-label={playing ? '음악 끄기' : '음악 켜기'}
      >
        {playing ? '♪' : '♩'}
      </button>
    </>
  );
}
