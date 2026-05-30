'use client';
import { motion } from 'framer-motion';
import FrameTouches from '@/components/content/FrameTouches';
import { media } from '@/lib/media';

interface Props {
  onReplay?: () => void;
}

export default function MainSection({ onReplay }: Props) {
  return (
    <section className="relative w-full overflow-hidden">
      {/* 메인 이미지 */}
      <img
        src={media('/images/frames/mainImage.jpg')}
        alt="우리, 결혼합니다"
        className="w-full h-auto"
      />

      {/* 액자 터치 오버레이 */}
      <FrameTouches />

      {/* 영상 다시보기 버튼 — "우리, 결혼합니다" 텍스트 라인과 수직 정렬 */}
      {onReplay && (
        <button
          onClick={onReplay}
          aria-label="영상 다시보기"
          className="absolute z-30 flex items-center rounded-full bg-black/35 hover:bg-black/55 text-white font-jua tracking-wide backdrop-blur-sm transition-colors shadow-md"
          style={{
            top: '5%',
            left: '1.5%',
            fontSize: 'clamp(8px, 2vw, 13px)',
            padding: '0.3em 0.7em',
            gap: '0.35em',
          }}
        >
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          영상 다시보기
        </button>
      )}

      {/* 상단 텍스트 */}
      <motion.div
        className="absolute top-[4%] left-0 right-0 text-center z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <p
          className="font-light px-3"
          style={{
            color: '#FBF5E6',
            fontFamily: 'serif',
            fontSize: 'clamp(1.05rem, 5.2vw, 2.25rem)',
            letterSpacing: '0.1em',
            textShadow: '0 2px 10px rgba(74,30,15,0.85), 0 0 20px rgba(74,30,15,0.4)',
          }}
        >
          우리, 결혼합니다
        </p>
        <p
          className="mt-3 font-medium px-3"
          style={{
            color: '#FBF5E6',
            fontSize: 'clamp(0.6rem, 2.6vw, 0.875rem)',
            letterSpacing: '0.15em',
            textShadow: '0 1px 8px rgba(74,30,15,0.95), 0 0 14px rgba(74,30,15,0.6)',
          }}
        >
          2026. 09. 20. SAT | 2:00 PM
        </p>
      </motion.div>

      {/* 하단 텍스트 */}
      <motion.div
        className="absolute bottom-[2%] left-0 right-0 text-center z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
      >
        <p
          className="font-light px-3"
          style={{
            color: '#FBF5E6',
            fontFamily: 'serif',
            fontSize: 'clamp(0.95rem, 4.2vw, 1.5rem)',
            letterSpacing: '0.12em',
            textShadow: '0 2px 8px rgba(74,30,15,0.85), 0 0 16px rgba(74,30,15,0.4)',
          }}
        >
          우진 &amp; 선영
        </p>
        <p
          className="mt-2 px-3"
          style={{
            color: '#F3E5C5',
            fontSize: 'clamp(0.6rem, 2.5vw, 0.875rem)',
            letterSpacing: '0.12em',
            textShadow: '0 1px 5px rgba(74,30,15,0.8)',
          }}
        >
          VENUE: 더 그레이스 웨딩홀
        </p>
      </motion.div>
    </section>
  );
}
