'use client';
import { useEffect, useRef, useState } from 'react';
import { media } from '@/lib/media';

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const play = (): Promise<boolean> => {
      const p = audioRef.current?.play();
      if (!p) return Promise.resolve(false);
      return p.then(() => { setPlaying(true); return true; }).catch(() => false);
    };

    // 먼저 autoplay 시도 (데스크탑 대부분 OK, 모바일은 막힘)
    play().then((ok) => {
      if (ok) return;
      // 실패 시 첫 사용자 인터랙션 때 재생
      const onInteract = () => {
        play().then((started) => {
          if (started) {
            document.removeEventListener('touchstart', onInteract);
            document.removeEventListener('click', onInteract);
            document.removeEventListener('pointerdown', onInteract);
          }
        });
      };
      document.addEventListener('touchstart', onInteract);
      document.addEventListener('click', onInteract);
      document.addEventListener('pointerdown', onInteract);
    });
  }, []);

  const toggle = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play();
    setPlaying(p => !p);
  };

  return (
    <>
      <audio ref={audioRef} src={media('/music/SunlitStringWaltz.mp3')} loop />
      <button
        onClick={toggle}
        className="fixed top-4 right-4 z-50 w-9 h-9 rounded-full
          bg-white/70 backdrop-blur-sm border border-stone-200 shadow-sm
          flex items-center justify-center
          transition-colors hover:bg-white/90"
        aria-label={playing ? '음악 끄기' : '음악 켜기'}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-[18px] h-[18px] text-stone-700"
          fill="currentColor"
          aria-hidden
        >
          {/* 음표 아이콘 */}
          <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
        </svg>
        {/* 음소거(paused) 상태일 때 빨간 대각선 */}
        <span
          className={`pointer-events-none absolute inset-0 flex items-center justify-center
            transition-opacity duration-200 ${playing ? 'opacity-0' : 'opacity-100'}`}
          aria-hidden
        >
          <span
            className="block bg-red-500 rounded-full shadow-[0_0_3px_rgba(255,255,255,0.9)]"
            style={{
              width: '75%',
              height: '2.5px',
              transform: 'rotate(-45deg)',
            }}
          />
        </span>
      </button>
    </>
  );
}
