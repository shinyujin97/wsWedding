'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

/**
 * InfoSection — 결혼 정보
 *
 * 스크롤 시 각 블록이 순차적으로 부드럽게 등장
 * stagger 효과는 useInView + variants로 구현
 */

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

export default function InfoSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start 0.6'],
  });

  const sectionOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const sectionY = useTransform(scrollYProgress, [0, 0.5], [60, 0]);

  return (
    <motion.section
      ref={ref}
      className="relative px-6 md:px-12 pt-4 md:pt-6 pb-24 md:pb-32 bg-[#FDFAF5]"
      style={{ opacity: sectionOpacity, y: sectionY }}
    >
      {/* 상단 다이아몬드 장식 */}
      <AnimatedBlock index={0}>
        <div className="flex items-center justify-center gap-4 mb-12 pt-4">
          <div className="h-px w-12 bg-stone-300/50" />
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2L9.5 6.5L14 8L9.5 9.5L8 14L6.5 9.5L2 8L6.5 6.5L8 2Z" fill="#c2a06c" fillOpacity="0.4"/>
          </svg>
          <div className="h-px w-12 bg-stone-300/50" />
        </div>
      </AnimatedBlock>

      {/* 인사말 */}
      <AnimatedBlock index={1}>
        <div className="text-center space-y-3 mb-14">
          <p className="text-[10px] md:text-xs tracking-[0.4em] text-stone-400 mb-5 uppercase">Invitation</p>
          <p className="text-sm md:text-base leading-8 md:leading-9 text-stone-600 font-light" style={{ fontFamily: 'serif' }}>
            서로 다른 길을 걸어온 두 사람이
            <br />
            이제 같은 길을 함께 걸어가려 합니다.
          </p>
          <p className="text-sm md:text-base leading-8 md:leading-9 text-stone-600 font-light mt-4" style={{ fontFamily: 'serif' }}>
            저희의 새로운 시작을
            <br />
            축복해 주시면 감사하겠습니다.
          </p>
        </div>
      </AnimatedBlock>

      {/* 신랑 & 신부 */}
      <AnimatedBlock index={2}>
        <div className="text-center space-y-3 mb-14">
          <div className="flex items-center justify-center gap-6">
            <div className="text-right">
              <p className="text-xs md:text-sm text-stone-400">
                <span className="text-stone-600">OOO</span> &middot; <span className="text-stone-400">OOO</span>의 장남
              </p>
              <p className="text-lg md:text-2xl text-stone-800 mt-1 font-medium tracking-wide" style={{ fontFamily: 'serif' }}>
                신우진
              </p>
            </div>
            <div className="w-px h-10 md:h-14 bg-stone-200" />
            <div className="text-left">
              <p className="text-xs md:text-sm text-stone-400">
                <span className="text-stone-600">OOO</span> &middot; <span className="text-stone-400">OOO</span>의 차녀
              </p>
              <p className="text-lg md:text-2xl text-stone-800 mt-1 font-medium tracking-wide" style={{ fontFamily: 'serif' }}>
                박선영
              </p>
            </div>
          </div>
        </div>
      </AnimatedBlock>

      {/* 날짜 */}
      <AnimatedBlock index={3}>
        <div className="text-center mb-10">
          <p className="text-[10px] md:text-xs tracking-[0.4em] text-stone-400 mb-3 uppercase">Date</p>
          <p className="text-lg md:text-2xl font-medium text-stone-700 tracking-wide" style={{ fontFamily: 'serif' }}>
            2025년 9월 20일 토요일
          </p>
          <p className="text-sm md:text-base text-stone-400 mt-1">오후 2시 00분</p>
        </div>
      </AnimatedBlock>

      {/* 캘린더 */}
      <AnimatedBlock index={4}>
        <div className="mb-14">
          <p className="text-[10px] tracking-[0.3em] text-stone-400 text-center mb-5 uppercase">
            September 2026
          </p>
          <div className="grid grid-cols-7 gap-y-2 md:gap-y-3 gap-x-1 md:gap-x-2 text-center text-xs md:text-sm max-w-[300px] md:max-w-[420px] mx-auto">
            {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
              <span
                key={d}
                className={`py-1 text-[11px] font-medium ${
                  d === '일' ? 'text-rose-400' : d === '토' ? 'text-blue-400' : 'text-stone-400'
                }`}
              >
                {d}
              </span>
            ))}
            {/* 9월 1일 = 월요일 → 앞에 빈칸 1개 */}
            <span />
            {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
              const dayOfWeek = (day) % 7; // 1=Mon offset: day 1 -> col 1(Mon)
              const isWeddingDay = day === 20;
              const isSunday = dayOfWeek === 6; // day 7=Sun(col0), day 14=Sun...
              const isSaturday = dayOfWeek === 5;

              return (
                <span
                  key={day}
                  className={`py-1.5 rounded-full text-xs transition-colors ${
                    isWeddingDay
                      ? 'bg-stone-700 text-white font-bold relative'
                      : isSunday
                        ? 'text-rose-300'
                        : isSaturday
                          ? 'text-blue-300'
                          : 'text-stone-500'
                  }`}
                >
                  {day}
                  {isWeddingDay && (
                    <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[8px] text-stone-400">
                      D-Day
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      </AnimatedBlock>

      {/* 장소 */}
      <AnimatedBlock index={5}>
        <div className="text-center mb-10">
          <p className="text-[10px] md:text-xs tracking-[0.4em] text-stone-400 mb-3 uppercase">Venue</p>
          <p className="text-lg md:text-2xl font-medium text-stone-700 tracking-wide" style={{ fontFamily: 'serif' }}>
            더 그레이스 웨딩홀
          </p>
          <p className="text-sm md:text-base text-stone-400 mt-1.5">서울특별시 강남구 테헤란로 123</p>
          <p className="text-xs md:text-sm text-stone-300 mt-1">3층 그랜드볼룸</p>
        </div>
      </AnimatedBlock>

      {/* 하단 장식 */}
      <AnimatedBlock index={6}>
        <div className="flex items-center justify-center gap-4 mt-8">
          <div className="h-px w-16 bg-stone-200/60" />
          <p className="text-[9px] tracking-[0.3em] text-stone-300 uppercase">Thank you</p>
          <div className="h-px w-16 bg-stone-200/60" />
        </div>
      </AnimatedBlock>
    </motion.section>
  );
}
