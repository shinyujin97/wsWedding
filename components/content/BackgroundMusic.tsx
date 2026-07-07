'use client';
import { useEffect, useRef, useState } from 'react';
import { media } from '@/lib/media';

export default function BackgroundMusic({ intro = false }: { intro?: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const loadingRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const buttonPosition = intro ? 'fixed top-4 right-4 z-[80]' : 'fixed top-4 right-4 z-50';

  const play = async () => {
    const audio = audioRef.current;
    if (!audio || loadingRef.current) return false;
    if (!audio.paused) return true;
    loadingRef.current = true;

    try {
      await audio.play();
      setPlaying(true);
      return true;
    } catch {
      setPlaying(false);
      return false;
    } finally {
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    let active = true;
    const events = ['pointerdown', 'touchstart', 'click', 'keydown'] as const;
    const removeFallback = () => {
      events.forEach((event) => document.removeEventListener(event, onInteract));
    };
    const onInteract = () => { void play().then((started) => { if (started) removeFallback(); }); };
    play().then((started) => {
      if (active && !started) {
        events.forEach((event) => document.addEventListener(event, onInteract, { passive: true }));
      }
    });
    return () => {
      active = false;
      removeFallback();
    };
  }, []);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      void play();
    }
  };

  return (
    <>
      <audio ref={audioRef} src={media('/music/SunlitStringWaltz.mp3')} loop preload="auto" autoPlay />
      <button
        onClick={toggle}
        aria-pressed={playing}
        className={`${buttonPosition} flex h-9 w-9 items-center justify-center rounded-full
          border border-[#d8c39a]/70 bg-[#fffaf0]/85 text-[#7a6035]
          shadow-[0_8px_22px_-14px_rgba(78,63,42,0.55)] ring-1 ring-white/70
          backdrop-blur-md transition hover:bg-white/95 hover:text-[#6c5126] active:scale-95`}
        aria-label={playing ? '음악 끄기' : '음악 켜기'}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-[17px] w-[17px]"
          fill="currentColor"
          aria-hidden
        >
          {/* 음표 아이콘 */}
          <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
        </svg>
        <span
          className={`pointer-events-none absolute bottom-1.5 right-1.5 flex h-3 items-end gap-[2px] transition-opacity ${
            playing ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden
        >
          {[6, 10, 8].map((height, i) => (
            <span
              key={height}
              className="w-[2px] animate-pulse rounded-full bg-[#b58a44]"
              style={{ height, animationDelay: `${i * 140}ms` }}
            />
          ))}
        </span>
        {/* 음소거(paused) 상태일 때 대각선 */}
        <span
          className={`pointer-events-none absolute inset-0 flex items-center justify-center
            transition-opacity duration-200 ${playing ? 'opacity-0' : 'opacity-100'}`}
          aria-hidden
        >
          <span
            className="block rounded-full bg-[#9d7a3f] shadow-[0_0_4px_rgba(255,255,255,0.95)]"
            style={{
              width: '62%',
              height: '2px',
              transform: 'rotate(-45deg)',
            }}
          />
        </span>
      </button>
    </>
  );
}
