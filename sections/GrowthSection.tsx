'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * GrowthSection — 성장 구간
 *
 * 400vh sticky 구조
 * 스크롤에 따라 3장의 이미지가 부드럽게 크로스페이드:
 *   물주기(5.png) → 새싹(sprout.png) → 어린나무(10.png)
 *
 * 각 이미지는 약간의 scale shift + opacity로 생동감 있게 전환
 * 텍스트는 각 장면에 맞춰 등장/퇴장
 */
export default function GrowthSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // ── 물주기 장면 (0% ~ 35%) ──
  const waterOpacity = useTransform(
    scrollYProgress,
    [0, 0.04, 0.28, 0.38],
    [0, 1, 1, 0]
  );
  const waterScale = useTransform(
    scrollYProgress,
    [0, 0.28],
    [1.06, 1]
  );
  const waterTextOpacity = useTransform(
    scrollYProgress,
    [0.06, 0.12, 0.24, 0.32],
    [0, 1, 1, 0]
  );

  // ── 새싹 장면 (30% ~ 68%) ──
  const sproutOpacity = useTransform(
    scrollYProgress,
    [0.28, 0.38, 0.58, 0.68],
    [0, 1, 1, 0]
  );
  const sproutScale = useTransform(
    scrollYProgress,
    [0.28, 0.58],
    [1.08, 1]
  );
  const sproutTextOpacity = useTransform(
    scrollYProgress,
    [0.38, 0.44, 0.54, 0.62],
    [0, 1, 1, 0]
  );

  // ── 어린 나무 장면 (60% ~ 100%) ──
  const youngTreeOpacity = useTransform(
    scrollYProgress,
    [0.58, 0.68, 0.88, 1],
    [0, 1, 1, 0]
  );
  const youngTreeScale = useTransform(
    scrollYProgress,
    [0.58, 0.88],
    [1.06, 1]
  );
  const youngTreeTextOpacity = useTransform(
    scrollYProgress,
    [0.7, 0.76, 0.84, 0.92],
    [0, 1, 1, 0]
  );

  // ── 배경 틴트 (장면별 미세 변화) ──
  const bgOpacity = useTransform(
    scrollYProgress,
    [0, 0.33, 0.66, 1],
    [0.15, 0.1, 0.05, 0.15]
  );

  return (
    <section ref={ref} className="relative h-[400vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#FDFAF5]">

        {/* 물주기 (5.png) */}
        <motion.img
          src="/images/frames/5.png"
          alt="물주기"
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
          style={{
            opacity: waterOpacity,
            scale: waterScale,
          }}
        />

        {/* 새싹 (sprout.png = 9.png) */}
        <motion.img
          src="/images/sprout.png"
          alt="새싹"
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
          style={{
            opacity: sproutOpacity,
            scale: sproutScale,
          }}
        />

        {/* 어린 나무 (10.png) */}
        <motion.img
          src="/images/frames/10.png"
          alt="어린 나무"
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
          style={{
            opacity: youngTreeOpacity,
            scale: youngTreeScale,
          }}
        />

        {/* 따뜻한 오버레이 */}
        <motion.div
          className="absolute inset-0 bg-[#FDFAF5] pointer-events-none"
          style={{ opacity: bgOpacity }}
        />

        {/* ── 장면별 텍스트 ── */}

        {/* 물주기 텍스트 */}
        <motion.div
          className="absolute bottom-[10vh] left-0 right-0 text-center px-8 z-10"
          style={{ opacity: waterTextOpacity }}
        >
          <p
            className="text-stone-600 text-base font-light tracking-wider leading-8"
            style={{ fontFamily: 'serif', textShadow: '0 1px 10px rgba(253,250,245,0.9)' }}
          >
            작은 정성을 담아
          </p>
        </motion.div>

        {/* 새싹 텍스트 */}
        <motion.div
          className="absolute bottom-[10vh] left-0 right-0 text-center px-8 z-10"
          style={{ opacity: sproutTextOpacity }}
        >
          <p
            className="text-stone-600 text-base font-light tracking-wider leading-8"
            style={{ fontFamily: 'serif', textShadow: '0 1px 10px rgba(253,250,245,0.9)' }}
          >
            작은 싹이 피어납니다
          </p>
        </motion.div>

        {/* 어린 나무 텍스트 */}
        <motion.div
          className="absolute bottom-[10vh] left-0 right-0 text-center px-8 z-10"
          style={{ opacity: youngTreeTextOpacity }}
        >
          <p
            className="text-stone-600 text-base font-light tracking-wider leading-8"
            style={{ fontFamily: 'serif', textShadow: '0 1px 10px rgba(253,250,245,0.9)' }}
          >
            함께 자라나는 우리
          </p>
        </motion.div>

        {/* 파티클 효과 (빛 입자) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="growth-particle absolute rounded-full bg-amber-200/40"
              style={{
                width: `${3 + i * 1.5}px`,
                height: `${3 + i * 1.5}px`,
                left: `${15 + i * 13}%`,
                bottom: `${20 + (i % 3) * 10}%`,
                animationDelay: `${i * 0.8}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .growth-particle {
          animation: floatUp 4s ease-in-out infinite;
        }

        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(0);
            opacity: 0;
          }
          30% {
            opacity: 0.7;
            transform: translateY(-20px) scale(1);
          }
          70% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-80px) scale(0.3);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
