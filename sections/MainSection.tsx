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
        src={media('/images/frames/mainImage.jpg?v=2')}
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

      {/* 상단 이미지 문구 */}
      <motion.div
        className="absolute top-[2%] left-0 right-0 z-10 flex justify-center px-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <img
          src="/text_watercolor_gray_wash.png?v=3"
          alt=""
          aria-hidden
          className="absolute top-1/2 left-1/2 w-[70%] max-w-[340px] md:max-w-[410px] h-auto -translate-x-1/2 -translate-y-[48%] opacity-90"
        />
        <img
          src="/were_getting_married_white_cutout_black_outline.png"
          alt="We're getting married"
          className="relative w-[74%] max-w-[360px] md:max-w-[430px] h-auto drop-shadow-[0_2px_8px_rgba(92,64,42,0.18)]"
        />
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
            color: '#3A2A22',
            fontFamily: 'serif',
            fontSize: 'clamp(0.95rem, 4.2vw, 1.5rem)',
            letterSpacing: '0.12em',
            textShadow: '0 1px 6px rgba(255,255,255,0.85), 0 0 12px rgba(255,255,255,0.5)',
          }}
        >
          우진 &amp; 선영
        </p>
      </motion.div>
    </section>
  );
}
