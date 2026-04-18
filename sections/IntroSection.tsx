'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * IntroSection — 씨앗 낙하
 *
 * 구조: 200vh 섹션 + sticky 뷰포트
 * - 배경: seed-falling.mp4 영상 (루프)
 * - seed.png: 자체 CSS keyframe으로 바람에 날리듯 떨어짐 (스크롤 무관)
 * - 착지 후 텍스트가 서서히 등장 (스크롤 기반)
 * - 섹션 끝에서 전체 fade-out (스크롤 기반)
 */
export default function IntroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // 섹션 전체 페이드아웃 (스크롤 80~100%)
  const sectionOpacity = useTransform(scrollYProgress, [0.75, 1], [1, 0]);

  // 텍스트 등장 (스크롤 30~50%)
  const textOpacity = useTransform(scrollYProgress, [0.25, 0.45], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.25, 0.45], [30, 0]);

  // 1.png (착지 후 배경) 서서히 등장 (스크롤 40~60%)
  const landingOpacity = useTransform(scrollYProgress, [0.4, 0.6], [0, 0.6]);

  return (
    <section ref={ref} className="relative h-[200vh]">
      <motion.div
        className="sticky top-0 h-screen w-full overflow-hidden bg-[#FDFAF5]"
        style={{ opacity: sectionOpacity }}
      >
        {/* 배경 영상 */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.85 }}
        >
          <source src="/video/seed-falling.mp4" type="video/mp4" />
        </video>

        {/* 따뜻한 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FDFAF5]/10 via-transparent to-[#FDFAF5]/30 pointer-events-none" />

        {/* seed.png — CSS keyframe: 바람에 흩날리며 떨어지는 모션 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="seed-float-container relative w-full max-w-[430px] h-full">
            <img
              src="/images/seed.png"
              alt="민들레 홀씨"
              className="seed-drift absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>

        {/* 착지 배경 (1.png) — 스크롤 시 서서히 블렌딩 */}
        <motion.img
          src="/images/frames/1.png"
          alt="착지 장면"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ opacity: landingOpacity }}
        />

        {/* 텍스트 — 스크롤 기반 등장 */}
        <motion.div
          className="absolute bottom-[12vh] left-0 right-0 text-center px-8 z-10"
          style={{ opacity: textOpacity, y: textY }}
        >
          <p
            className="text-stone-700 text-xl font-light leading-10 tracking-wide"
            style={{ fontFamily: 'serif', textShadow: '0 1px 8px rgba(253,250,245,0.8)' }}
          >
            우리의 소중한 날
          </p>
          <p
            className="text-stone-500 text-sm font-light leading-7 mt-3 tracking-wider"
            style={{ textShadow: '0 1px 6px rgba(253,250,245,0.6)' }}
          >
            함께 채워갈 작은 꿈의 시작
          </p>
        </motion.div>

        {/* 하단 스크롤 힌트 */}
        <motion.div
          className="absolute bottom-[4vh] left-0 right-0 flex justify-center z-10"
          style={{
            opacity: useTransform(scrollYProgress, [0, 0.15], [1, 0]),
          }}
        >
          <div className="scroll-hint-arrow flex flex-col items-center gap-1">
            <span className="text-stone-400 text-[10px] tracking-[0.3em]">SCROLL</span>
            <svg width="16" height="24" viewBox="0 0 16 24" fill="none" className="scroll-bounce">
              <path d="M8 4V20M8 20L2 14M8 20L14 14" stroke="#a8a29e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </motion.div>
      </motion.div>

      {/* CSS keyframes for seed drift animation */}
      <style jsx>{`
        .seed-drift {
          animation: seedDrift 8s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
          transform-origin: center center;
        }

        @keyframes seedDrift {
          0% {
            opacity: 0;
            transform: translateY(-8vh) scale(1.05);
            filter: blur(1px);
          }
          12% {
            opacity: 1;
            filter: blur(0);
          }
          25% {
            transform: translateY(-2vh) translateX(3vw) rotate(2deg) scale(1.02);
          }
          40% {
            transform: translateY(2vh) translateX(-2vw) rotate(-1.5deg) scale(1.0);
          }
          55% {
            transform: translateY(4vh) translateX(1.5vw) rotate(1deg) scale(0.99);
          }
          70% {
            transform: translateY(5vh) translateX(-1vw) rotate(-0.5deg) scale(0.98);
          }
          85% {
            transform: translateY(5.5vh) translateX(0.5vw) rotate(0.3deg) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(5vh) translateX(0) rotate(0deg) scale(0.98);
          }
        }

        .scroll-bounce svg {
          animation: scrollBounce 2s ease-in-out infinite;
        }

        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(6px); opacity: 1; }
        }
      `}</style>
    </section>
  );
}
