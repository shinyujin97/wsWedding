'use client';
import { motion, type Variants } from 'framer-motion';
import { media } from '@/lib/media';
import type { JourneyMilestone } from '@/lib/journey';
import MilestoneDoodle from './MilestoneDoodle';

/**
 * MilestoneCard — 여정 정거장 카드
 *
 * 부모(JourneySection)가 앵커 좌표를 % 로 환산해 style(left/top)로 절대배치한다.
 * align 에 따라 카드가 점의 왼쪽/오른쪽에 자연스럽게 붙는다.
 * 한 번 active 가 되면 부모가 유지를 보장하므로 퇴장 처리는 없다.
 */

interface MilestoneCardProps {
  milestone: JourneyMilestone;
  /** 앵커 기준 카드가 붙는 방향 */
  align: 'left' | 'right';
  active: boolean;
  /** 부모가 계산한 절대배치 left/top % */
  style: React.CSSProperties;
}

const cardVariants: Variants = {
  inactive: { opacity: 0, y: 14, filter: 'blur(6px)' },
  active: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: 'easeOut' },
  },
};

export default function MilestoneCard({ milestone, align, active, style }: MilestoneCardProps) {
  return (
    <div className="absolute pointer-events-none" style={style}>
      {/* align 에 따라 점 옆으로 배치 (left = 점의 왼쪽, right = 점의 오른쪽) */}
      <div
        className={`-translate-y-1/2 ${
          align === 'left' ? '-translate-x-full pr-6 text-right' : 'pl-6 text-left'
        }`}
      >
        <motion.div
          initial="inactive"
          animate={active ? 'active' : 'inactive'}
          variants={cardVariants}
          className="w-[150px]"
        >
          {/* 마일스톤 두들 아이콘 — 연도 위, 카드 바깥쪽 정렬 + 살짝 기울임 (icon 이 있을 때만) */}
          {milestone.icon && (
            <div className="mb-1">
              <span
                className={`inline-block ${align === 'left' ? 'rotate-[8deg]' : '-rotate-[8deg]'}`}
              >
                <MilestoneDoodle icon={milestone.icon} />
              </span>
            </div>
          )}
          {/* 폴라로이드 썸네일 (이미지가 있을 때만) */}
          {milestone.image && (
            <div
              className={`inline-block bg-white p-1 pb-3 shadow-md mb-2 ${
                align === 'left' ? 'rotate-2' : '-rotate-2'
              }`}
            >
              <img
                src={media(milestone.image)}
                alt={milestone.text}
                width={64}
                height={64}
                loading="lazy"
                className="w-16 h-16 object-cover"
              />
            </div>
          )}
          <p className="font-caption text-3xl text-[#C8552E] leading-none">{milestone.year}</p>
          {/* 손그림 이중 밑줄 — 살짝 휜 스트로크 2개가 겹치는 찍찍 밑줄 */}
          <svg
            width={70}
            height={8}
            viewBox="0 0 70 8"
            aria-hidden
            className="inline-block mt-0.5"
            opacity={0.5}
          >
            <path
              d="M2 3 Q22 1 42 2.5 Q56 3.6 68 2.2"
              fill="none"
              stroke="#C8552E"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            <path
              d="M7 6.2 Q28 4.4 47 5.6 Q56 6.2 62 5"
              fill="none"
              stroke="#C8552E"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          </svg>
          <p className="font-caption text-base text-[#5C4D3C] mt-1.5 leading-relaxed">
            {milestone.text}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
