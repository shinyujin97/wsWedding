'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * TreeSection — 완성된 나무 + 액자
 *
 * tree.png (8.png) 자체에 이미 액자가 그려져 있으므로,
 * 별도 PhotoFrames 오버레이 대신 이미지 자체를 활용한다.
 *
 * 구조:
 * 1. 나무가 아래에서 위로 reveal (clip-path)
 * 2. 나무가 완전히 보이면 "우리, 결혼합니다" 텍스트 등장
 * 3. 빛 파티클 + 미세한 흔들림으로 생동감
 */
export default function TreeSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // 나무 이미지 등장 (scale + opacity)
  const treeOpacity = useTransform(scrollYProgress, [0, 0.15], [0, 1]);
  const treeScale = useTransform(scrollYProgress, [0, 0.3], [1.1, 1]);
  const treeY = useTransform(scrollYProgress, [0, 0.3], [40, 0]);

  // 헤더 텍스트
  const headerOpacity = useTransform(scrollYProgress, [0.2, 0.35], [0, 1]);
  const headerY = useTransform(scrollYProgress, [0.2, 0.35], [24, 0]);

  // 하단 커플 이름
  const coupleOpacity = useTransform(scrollYProgress, [0.35, 0.5], [0, 1]);
  const coupleY = useTransform(scrollYProgress, [0.35, 0.5], [20, 0]);

  // 골든 오버레이 (따뜻한 빛)
  const glowOpacity = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0, 0.15, 0.05]);

  // 섹션 끝 페이드아웃
  const sectionOpacity = useTransform(scrollYProgress, [0.85, 1], [1, 0]);

  return (
    <section ref={ref} className="relative h-[250vh]">
      <motion.div
        className="sticky top-0 h-screen w-full overflow-hidden bg-[#FDFAF5]"
        style={{ opacity: sectionOpacity }}
      >
        {/* 나무 이미지 (tree.png = 8.png) — 이미 액자 포함 */}
        <motion.img
          src="/images/tree.png"
          alt="완성된 나무"
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
          style={{
            opacity: treeOpacity,
            scale: treeScale,
            y: treeY,
          }}
        />

        {/* 따뜻한 골든 글로우 */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: glowOpacity,
            background: 'radial-gradient(ellipse at 50% 40%, rgba(217,186,140,0.4) 0%, transparent 70%)',
          }}
        />

        {/* 상단 텍스트 */}
        <motion.div
          className="absolute top-[4vh] left-0 right-0 text-center z-10"
          style={{ opacity: headerOpacity, y: headerY }}
        >
          <p
            className="text-stone-600 text-xl tracking-[0.15em] font-light"
            style={{
              fontFamily: 'serif',
              textShadow: '0 2px 12px rgba(253,250,245,0.9)',
            }}
          >
            우리, 결혼합니다
          </p>
        </motion.div>

        {/* 하단 커플 이름 */}
        <motion.div
          className="absolute bottom-[8vh] left-0 right-0 text-center z-10"
          style={{ opacity: coupleOpacity, y: coupleY }}
        >
          <p
            className="text-stone-500 text-sm tracking-[0.2em] font-light"
            style={{
              fontFamily: 'serif',
              textShadow: '0 1px 8px rgba(253,250,245,0.8)',
            }}
          >
            우진 &hearts; 선영
          </p>
        </motion.div>

        {/* 떨어지는 나뭇잎 파티클 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="tree-leaf absolute"
              style={{
                left: `${10 + i * 18}%`,
                top: `-5%`,
                animationDelay: `${i * 1.5}s`,
                animationDuration: `${6 + i * 0.5}s`,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 0C6 0 10 4 10 7C10 10 6 12 6 12C6 12 2 10 2 7C2 4 6 0 6 0Z"
                  fill="rgba(194,154,108,0.3)"
                />
              </svg>
            </div>
          ))}
        </div>
      </motion.div>

      <style jsx>{`
        .tree-leaf {
          animation: leafFall linear infinite;
        }

        @keyframes leafFall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          50% {
            transform: translateY(50vh) translateX(20px) rotate(180deg);
            opacity: 0.4;
          }
          100% {
            transform: translateY(105vh) translateX(-10px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
