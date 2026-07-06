'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import WeddingCountdown from '@/components/content/WeddingCountdown';

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

const OCTOBER_2026_HOLIDAYS = new Set([3, 5, 9]);

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
      className="relative px-6 md:px-12 pt-4 md:pt-6 pb-6 md:pb-8 bg-[#FDFAF5]"
      style={{ opacity: sectionOpacity, y: sectionY }}
    >
      {/* 상단 다이아몬드 장식 */}
      <AnimatedBlock index={0}>
        <div className="flex items-center justify-center gap-4 pt-4">
          <div className="h-px w-12 bg-stone-300/50" />
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2L9.5 6.5L14 8L9.5 9.5L8 14L6.5 9.5L2 8L6.5 6.5L8 2Z" fill="#c2a06c" fillOpacity="0.4"/>
          </svg>
          <div className="h-px w-12 bg-stone-300/50" />
        </div>
      </AnimatedBlock>

      {/* 장소 + 날짜 */}
      <AnimatedBlock index={1}>
        <div className="mx-auto max-w-[420px] md:max-w-[560px] py-6 text-center">
          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            <div>
              <p className="text-base md:text-lg font-medium tracking-wide text-stone-700 whitespace-nowrap" style={{ fontFamily: 'serif' }}>
                2026년 10월 17일 토요일
              </p>
              <p className="text-base md:text-lg font-medium tracking-wide text-stone-700">오후 12시 50분</p>
            </div>
            <div>
              <p className="text-base md:text-lg font-medium tracking-wide text-stone-700" style={{ fontFamily: 'serif' }}>
                아르베웨딩
              </p>
              {/* <p className="mt-1 text-[11px] text-stone-600">서울 강남구 봉은사로 302</p> */}
            </div>
          </div>
        </div>
      </AnimatedBlock>

      {/* 인사말 */}
      <AnimatedBlock index={2}>
        <div className="text-center space-y-3 mb-14">
          <div className="flex items-center justify-center gap-4 mb-20">
            <div className="h-px w-12 bg-stone-300/50" />
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L9.5 6.5L14 8L9.5 9.5L8 14L6.5 9.5L2 8L6.5 6.5L8 2Z" fill="#c2a06c" fillOpacity="0.4"/>
            </svg>
            <div className="h-px w-12 bg-stone-300/50" />
          </div>
          <p className="text-[13px] md:text-xs tracking-[0.4em] text-stone-400 mb-5 uppercase">초대합니다</p>
          <p className="text-sm md:text-base leading-8 md:leading-9 text-stone-600 font-light" style={{ fontFamily: 'serif' }}>
            새로운 마음으로 설레는 10월,
            <br />
            오랜 사랑을 더 깊은 약속으로 이어가려 합니다.
          </p>
          <p className="text-sm md:text-base leading-8 md:leading-9 text-stone-600 font-light mt-4" style={{ fontFamily: 'serif' }}>
            저희의 새로운 시작을
            <br />
            따뜻한 축복으로 함께해 주세요.
          </p>
        </div>
      </AnimatedBlock>

      {/* 신랑 & 신부 */}
      <AnimatedBlock index={3}>
        <div className="text-center space-y-3 mb-20">
          <div className="flex items-center justify-center gap-6">
            <div className="text-right">
              <p className="text-xs md:text-sm text-stone-400">
                <span className="text-stone-600">신상영</span> &middot; <span className="text-stone-600">안혜숙</span><span className="text-stone-400">의 아들</span>
              </p>
              <p className="text-lg md:text-2xl text-stone-800 mt-1 font-medium tracking-wide" style={{ fontFamily: 'serif' }}>
                신우진
              </p>
            </div>
            <div className="w-px h-10 md:h-14 bg-stone-200" />
            <div className="text-left">
              <p className="text-xs md:text-sm text-stone-400">
                <span className="text-stone-600">박경선</span> &middot; <span className="text-stone-600">이은영</span><span className="text-stone-400">의 딸</span>
              </p>
              <p className="text-lg md:text-2xl text-stone-800 mt-1 font-medium tracking-wide" style={{ fontFamily: 'serif' }}>
                박선영
              </p>
            </div>
          </div>
        </div>
      </AnimatedBlock>

      {/* 캘린더 */}
      <AnimatedBlock index={4}>
        <div className="mb-14">
          <p className="text-[16px] md:text-xs tracking-[0.3em] text-stone-400 text-center mb-6 uppercase">
            2026 10월
          </p>
          <div className="grid grid-cols-7 gap-x-1 gap-y-1 md:gap-y-1.5 text-center max-w-[360px] md:max-w-[500px] mx-auto">
            {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
              <span
                key={d}
                className={`pb-2 text-xs md:text-sm font-medium ${
                  d === '일' ? 'text-rose-400' : d === '토' ? 'text-blue-400' : 'text-stone-400'
                }`}
              >
                {d}
              </span>
            ))}
            {/* 2026년 10월 1일 = 목요일 → 앞에 빈칸 4개 (일·월·화·수 칸) */}
            <span />
            <span />
            <span />
            <span />
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const col = (day + 3) % 7; // 일=0 ... 토=6 (10/1=목=col4 기준)
              const isWeddingDay = day === 17;
              const isSunday = col === 0;
              const isSaturday = col === 6;
              const isHoliday = OCTOBER_2026_HOLIDAYS.has(day);

              return (
                <div key={day} className="flex flex-col items-center text-sm md:text-lg">
                  {/* 숫자/하트 영역 (정사각형) */}
                  <div className="relative w-full aspect-square flex items-center justify-center">
                    {isWeddingDay ? (
                      <>
                        {/* 결혼일 — 로즈 하트 */}
                        <svg
                          viewBox="0 0 24 24"
                          className="absolute inset-0 m-auto w-[92%] h-[92%] drop-shadow-sm"
                          fill="#F2A0AB"
                          aria-hidden
                        >
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        <span
                          className="relative z-10 font-bold text-white"
                          style={{ transform: 'translateY(-8%)' }}
                        >
                          {day}
                        </span>
                      </>
                    ) : (
                      <span
                        className={
                          isSunday || isHoliday ? 'text-rose-400' : isSaturday ? 'text-blue-300' : 'text-stone-500'
                        }
                      >
                        {day}
                      </span>
                    )}
                  </div>
                  {/* 결혼일 시간 라벨 */}
                  {isWeddingDay && (
                    <span className="mt-0.5 text-[8px] md:text-[10px] font-bold text-rose-600 whitespace-nowrap leading-none">
                      낮 12시 50분
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </AnimatedBlock>

      {/* 카운트다운 + 함께한 지 */}
      <AnimatedBlock index={5}>
        <div className="mb-16">
          <WeddingCountdown />
        </div>
      </AnimatedBlock>
    </motion.section>
  );
}
