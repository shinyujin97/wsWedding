'use client';
import { useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

/**
 * NoticeSection — 안내사항 (탭형)
 *
 * 포토부스 / 식사 안내 / 숙박 안내 탭. 활성 탭은 로즈 밑줄.
 * 크림 배경 + stone 팔레트, 로즈는 포인트로만 사용 (기존 톤 유지).
 */

type Tab = { key: string; label: string; lines: string[] };

const TABS: Tab[] = [
  {
    key: 'photo',
    label: '포토부스',
    lines: [
      '포토부스는 1층에서 지하로 내려가는',
      '계단 뒤편에 마련되어 있습니다.',
      '많은 이용 부탁드립니다!!',
    ],
  },
  {
    key: 'meal',
    label: '식사 안내',
    lines: [
      '식사는 오후 12시 20분부터',
      '지하 1층 연회장에서 이용하실 수 있습니다.',
    ],
  },
  {
    key: 'flower',
    label: '화환 안내',
    lines: [
      '예식장 사정상 화환 반입이 어려워,',
      '축하의 마음만 감사히 받겠습니다.',
      '너른 양해 부탁드립니다.',
    ],
  },
];

const fadeUpVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.7,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  }),
};

function AnimatedBlock({ children, index }: { children: React.ReactNode; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <motion.div
      ref={ref}
      custom={index}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={fadeUpVariants}
    >
      {children}
    </motion.div>
  );
}

export default function NoticeSection() {
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const tab = TABS[active];
  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;

    const delta = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(delta) < 40) return;
    setActive((current) => (delta < 0 ? Math.min(current + 1, TABS.length - 1) : Math.max(current - 1, 0)));
  };

  return (
    <section className="px-6 md:px-12 py-12 md:py-16 bg-[#FDFAF5]">
      {/* 상단: 다이아몬드 디바이더 + 라벨 + 제목 */}
      <AnimatedBlock index={0}>
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px w-12 bg-stone-300/50" />
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2L9.5 6.5L14 8L9.5 9.5L8 14L6.5 9.5L2 8L6.5 6.5L8 2Z" fill="#c2a06c" fillOpacity="0.4" />
          </svg>
          <div className="h-px w-12 bg-stone-300/50" />
        </div>
        <div className="text-center mb-8 space-y-2">
          <p className="text-[10px] md:text-xs tracking-[0.4em] text-stone-400 uppercase">Notice</p>
          <p className="text-base md:text-lg text-stone-700 font-medium" style={{ fontFamily: 'serif' }}>
            안내사항
          </p>
        </div>
      </AnimatedBlock>

      {/* 탭 */}
      <AnimatedBlock index={1}>
        <div
          className="max-w-md mx-auto"
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0].clientX;
          }}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={() => {
            touchStartX.current = null;
          }}
        >
          <div className="flex border-b border-stone-200">
            {TABS.map((t, i) => {
              const isActive = i === active;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-selected={isActive}
                  className={`relative flex-1 pb-3 pt-1 text-sm md:text-base transition-colors ${
                    isActive ? 'text-stone-800 font-medium' : 'text-stone-400'
                  }`}
                  style={{ fontFamily: 'serif' }}
                >
                  {t.label}
                  {isActive && (
                    <motion.span
                      layoutId="notice-tab-underline"
                      className="absolute -bottom-px left-0 right-0 h-0.5 bg-rose-300"
                      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* 탭 내용 */}
          <div className="min-h-[180px] flex items-center justify-center px-2 py-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-center"
              >
                <div className="space-y-1.5">
                  {tab.lines.map((line) => (
                    <p key={line} className="text-sm text-stone-800 leading-7 font-normal">
                      {line}
                    </p>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </AnimatedBlock>
    </section>
  );
}
