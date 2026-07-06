'use client';
import { useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

/**
 * AccountsSection — 마음 전하실 곳
 *
 * 데이터 배열 기반 아코디언. 한 번에 하나의 그룹만 펼쳐진다.
 * 계좌번호 복사 버튼은 클립보드에 number만 복사한다.
 * 신랑 아버님 계좌 등은 ACCOUNT_GROUPS 배열에 한 줄 추가만으로 확장된다.
 */

// ── 디자인 토큰 / 등장 애니메이션 (InfoSection 패턴 로컬 복제) ──
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

// ── 데이터 ──
type Account = { role: string; name: string; bank: string; number: string };
type AccountGroup = { side: string; accounts: Account[] };

const ACCOUNT_GROUPS: AccountGroup[] = [
  {
    side: '신랑측',
    accounts: [
      { role: '신랑', name: '신우진', bank: '신한은행', number: '110-386-342220' },
      { role: '신랑 아버지', name: '신상영', bank: '기업은행', number: '11231321321' },
    ],
  },
  {
    side: '신부측',
    accounts: [
      { role: '신부', name: '박선영', bank: '우리은행', number: '1002-236-542563' },
      { role: '신부 아버지', name: '박경선', bank: '우리은행', number: '500-017125-12-001' },
    ],
  },
];

export default function AccountsSection() {
  // 신랑측·신부측 각각 독립적으로 열림/닫힘 (둘 다 동시에 열릴 수 있음)
  // 초기엔 모두 닫힘 — 사용자가 눌러야 펼쳐진다.
  const [openSet, setOpenSet] = useState<Set<number>>(() => new Set());

  const toggle = (i: number) =>
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const handleCopy = async (number: string) => {
    try {
      await navigator.clipboard.writeText(number);
      alert('계좌번호가 복사되었습니다!');
    } catch {
      alert('복사에 실패했습니다. 직접 입력해주세요.');
    }
  };

  return (
    <section className="px-6 md:px-12 py-12 md:py-16 bg-[#FDFAF5]">
      {/* 상단: 다이아몬드 디바이더 + 라벨 + 제목 */}
      <AnimatedBlock index={0}>
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-12 bg-stone-300/50" />
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2L9.5 6.5L14 8L9.5 9.5L8 14L6.5 9.5L2 8L6.5 6.5L8 2Z" fill="#c2a06c" fillOpacity="0.4" />
          </svg>
          <div className="h-px w-12 bg-stone-300/50" />
        </div>

        <div className="text-center space-y-2 mb-10">
          <p className="text-[10px] md:text-xs tracking-[0.4em] text-stone-400 uppercase">Account</p>
          <h2 className="text-base md:text-lg text-stone-700 font-medium" style={{ fontFamily: 'serif' }}>
            마음 전하실 곳
          </h2>
          <p className="text-xs text-stone-400">참석이 어려우신 분들을 위해 기재하였습니다.</p>
        </div>
      </AnimatedBlock>

      {/* 아코디언 */}
      <AnimatedBlock index={1}>
        <div className="max-w-md mx-auto">
          {ACCOUNT_GROUPS.map((group, i) => {
            const isOpen = openSet.has(i);
            return (
              <div
                key={group.side}
                className="rounded-2xl border border-stone-200 bg-white/50 overflow-hidden mb-3"
              >
                {/* 헤더 */}
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between px-5 py-4 text-sm md:text-base text-stone-700"
                >
                  <span>{group.side}</span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform text-stone-400 ${isOpen ? 'rotate-180' : ''}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {/* 펼침 */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                      className="overflow-hidden"
                    >
                      {group.accounts.map((acc) => (
                        <div
                          key={acc.number}
                          className="flex items-center justify-between px-5 py-3 border-t border-stone-100"
                        >
                          <div className="min-w-0">
                            <p className="text-xs text-stone-400">{acc.role}</p>
                            <p className="text-sm text-stone-700 mt-0.5">
                              {acc.bank} {acc.number}
                            </p>
                            <p className="text-xs text-stone-400 mt-0.5">{acc.name}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(acc.number)}
                            aria-label={`${acc.role} 계좌번호 복사`}
                            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-[#d6c09a]/70 bg-[#fbf7ef] px-3.5 text-[11px] font-medium tracking-[0.12em] text-[#8a6a37] shadow-[0_8px_18px_rgba(194,160,108,0.14)] active:scale-[0.98] transition-transform"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                              <rect x="9" y="9" width="13" height="13" rx="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                            복사
                          </button>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </AnimatedBlock>
    </section>
  );
}
