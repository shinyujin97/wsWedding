'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  useScroll,
  useSpring,
  useMotionValueEvent,
} from 'framer-motion';
import {
  buildJourneyPath,
  SAMPLE_MILESTONES,
  VIEW_W,
  type JourneyMilestone,
} from '@/lib/journey';
import JourneyPath from '@/components/journey/JourneyPath';
import MilestoneCard from '@/components/journey/MilestoneCard';

/**
 * JourneySection — 비행기 여정 스토리 (오케스트레이터)
 *
 * 스크롤 진행도(useScroll → useSpring)에 따라:
 *   1. 비행기가 곡선 경로(getPointAtLength)를 따라 이동 + 진행 방향으로 회전
 *   2. 지나온 경로가 점선 → 실선으로 색칠 (strokeDashoffset)
 *   3. 정거장(앵커)을 지날 때마다 마일스톤 카드가 순차 활성화 (되감으면 비활성화)
 *   4. 끝에 도달하면 착륙(landed) 연출
 *
 * 성능: 프레임 단위 갱신은 React 리렌더 없이 ref로 DOM에 직접 기록.
 * 리렌더는 activeIndex / landed 상태 변화 시에만 발생.
 */

interface JourneySectionProps {
  milestones?: JourneyMilestone[];
}

export default function JourneySection({
  milestones = SAMPLE_MILESTONES,
}: JourneySectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  // ── SVG 직접 제어용 ref (JourneyPath 내부 요소에 연결) ──
  const basePathRef = useRef<SVGPathElement>(null);
  const progressPathRef = useRef<SVGPathElement>(null);
  const trailPathRef = useRef<SVGPathElement>(null);
  const speedLinesRef = useRef<SVGGElement>(null);
  const planeGroupRef = useRef<SVGGElement>(null);

  // ── 마운트 시 1회 측정값 (리렌더와 무관) ──
  const totalLengthRef = useRef(0); // 경로 전체 길이
  const thresholdsRef = useRef<number[]>([]); // 앵커별 진행도 임계값 t_i
  const activeIndexRef = useRef(-1); // setState 중복 방지용 미러
  const landedRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState(-1);
  const [landed, setLanded] = useState(false);

  // 경로 지오메트리 — 마일스톤 개수에 따라 1회 생성
  const geometry = useMemo(
    () => buildJourneyPath(milestones.length),
    [milestones.length]
  );

  // ── 스크롤 진행도 → 스프링으로 부드럽게 ──
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.75', 'end 0.45'],
  });
  const spring = useSpring(scrollYProgress, {
    stiffness: 55,
    damping: 16,
    restDelta: 0.001,
  });

  // 마운트 시 현재 스크롤 위치로 즉시 점프 — 새로고침 시 비행기가 날아오는 튐 방지
  useEffect(() => {
    spring.jump(scrollYProgress.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 마운트 1회 측정: 경로 길이 + 앵커별 임계값 샘플링 ──
  useEffect(() => {
    const base = basePathRef.current;
    if (!base) return;

    const total = base.getTotalLength();
    totalLengthRef.current = total;

    // 경로를 400등분해 훑으면서 각 앵커에 가장 가까운 지점의 길이를 찾는다
    const SAMPLES = 400;
    const bestLen = new Array<number>(geometry.anchors.length).fill(0);
    const bestDist = new Array<number>(geometry.anchors.length).fill(Infinity);

    for (let s = 0; s <= SAMPLES; s++) {
      const len = (s / SAMPLES) * total;
      const pt = base.getPointAtLength(len);
      for (let i = 0; i < geometry.anchors.length; i++) {
        const a = geometry.anchors[i];
        const dx = pt.x - a.x;
        const dy = pt.y - a.y;
        const dist = dx * dx + dy * dy;
        if (dist < bestDist[i]) {
          bestDist[i] = dist;
          bestLen[i] = len;
        }
      }
    }
    thresholdsRef.current = bestLen.map((len) => (total > 0 ? len / total : 0));
  }, [geometry]);

  // ── 프레임 콜백: React 리렌더 없이 ref 직접 기록 ──
  // 스크롤에 묶인(사용자가 직접 구동하는) 모션이라 OS 모션 최소화 설정과 무관하게 동작한다
  useMotionValueEvent(spring, 'change', (value) => {
    const base = basePathRef.current;
    const progress = progressPathRef.current;
    const plane = planeGroupRef.current;
    const total = totalLengthRef.current;
    if (!base || !progress || !plane || total <= 0) return;

    const p = Math.min(1, Math.max(0, value));
    const len = p * total;

    // 비행기 위치 + 진행 방향 회전 (끝점에서는 뒤쪽 점으로 방향 계산해 튐 방지)
    const pt = base.getPointAtLength(len);
    let deg: number;
    if (len >= total - 1) {
      const behind = base.getPointAtLength(Math.max(len - 1, 0));
      deg = (Math.atan2(pt.y - behind.y, pt.x - behind.x) * 180) / Math.PI;
    } else {
      const ahead = base.getPointAtLength(Math.min(len + 1, total));
      deg = (Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180) / Math.PI;
    }
    plane.setAttribute('transform', `translate(${pt.x} ${pt.y}) rotate(${deg})`);

    // 지나온 경로 색칠 (progressPath는 pathLength=100 기준)
    progress.style.strokeDashoffset = String(100 * (1 - p));

    // 모션 트레일 "슝" — 비행기 뒤 8유닛 창을 따라 붙이고, 속도에 비례해 진해졌다 멈추면 사라짐
    const v = Math.abs(spring.getVelocity()); // 진행도(0~1)/초
    const trail = trailPathRef.current;
    if (trail) {
      const TRAIL_LEN = 8; // strokeDasharray "8 92" 와 동일해야 함
      trail.style.strokeDashoffset = String(TRAIL_LEN - 100 * p);
      trail.style.strokeOpacity = String(Math.min(v * 4, 0.45));
    }

    // 스피드라인 — 꽁무니 짝대기, 빠를수록 또렷하게
    const lines = speedLinesRef.current;
    if (lines) {
      lines.style.opacity = String(Math.min(v * 3, 0.85));
    }

    // 정거장 통과 판정 — 양방향: 위로 되감으면 연도도 같이 꺼진다
    const thresholds = thresholdsRef.current;
    let next = -1;
    for (let i = 0; i < thresholds.length; i++) {
      if (p >= thresholds[i] - 0.015) next = i;
    }
    if (next !== activeIndexRef.current) {
      activeIndexRef.current = next;
      setActiveIndex(next);
    }

    // 착륙 — 양방향 (히스테리시스로 경계에서 깜빡임 방지)
    if (p > 0.985 && !landedRef.current) {
      landedRef.current = true;
      setLanded(true);
    } else if (p < 0.96 && landedRef.current) {
      landedRef.current = false;
      setLanded(false);
    }
  });

  return (
    <section ref={sectionRef} className="relative px-0 pt-12 md:pt-16 pb-0 bg-[#FDFAF5]">
      {/* ── 헤더 ── */}
      <div className="text-center mb-10 md:mb-14 px-6">
        <p className="text-[10px] md:text-xs tracking-[0.4em] text-stone-400 mb-4 uppercase">
          Our Journey
        </p>
        <h2 className="text-2xl md:text-3xl font-caption text-stone-700 tracking-wide">
          우리의 비행 일지
        </h2>
        <p className="text-xs md:text-sm font-gowun text-stone-400 mt-3 font-light">
          두 사람이 함께 날아온 시간들
        </p>
      </div>

      {/* ── 경로 + 마일스톤 카드 ── */}
      <div className="relative w-full">
        <JourneyPath
          geometry={geometry}
          activeIndex={activeIndex}
          basePathRef={basePathRef}
          progressPathRef={progressPathRef}
          trailPathRef={trailPathRef}
          speedLinesRef={speedLinesRef}
          planeGroupRef={planeGroupRef}
          landed={landed}
        />

        {milestones.map((milestone, i) => {
          const anchor = geometry.anchors[i];
          if (!anchor) return null;
          // 앵커가 왼쪽(x=110)에 있으면 카드는 반대편(오른쪽)으로
          const align: 'left' | 'right' = anchor.x < VIEW_W / 2 ? 'right' : 'left';
          return (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              align={align}
              active={i <= activeIndex}
              style={{
                position: 'absolute',
                left: `${(anchor.x / VIEW_W) * 100}%`,
                top: `${(anchor.y / geometry.height) * 100}%`,
              }}
            />
          );
        })}
      </div>
    </section>
  );
}
