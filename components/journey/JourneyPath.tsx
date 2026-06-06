'use client';
import PaperPlaneIcon from './PaperPlaneIcon';
import JourneyDecor from './JourneyDecor';
import type { JourneyGeometry } from '@/lib/journey';

/**
 * JourneyPath — 여정 경로 SVG (표현 전용)
 *
 * 계산·애니메이션 로직은 부모(JourneySection)가 담당한다:
 * - basePathRef     : 경로 길이 측정용 베이스 path
 * - progressPathRef : 부모가 strokeDashoffset 을 직접 기록해 경로를 색칠
 * - planeGroupRef   : 부모가 transform 을 직접 기록해 비행기를 이동·회전
 *
 * 이 컴포넌트는 받은 ref 를 그대로 꽂아주기만 하며 훅·계산이 없다.
 */

interface JourneyPathProps {
  geometry: JourneyGeometry;
  /** -1 = 아직 없음, i 이하의 정거장 도트 활성 */
  activeIndex: number;
  /** 측정용 베이스 path */
  basePathRef: React.Ref<SVGPathElement>;
  /** 색칠 오버레이 path (부모가 dashoffset 직접 기록) */
  progressPathRef: React.Ref<SVGPathElement>;
  /** 모션 트레일 path — 비행기 바로 뒤 잔상 (부모가 dashoffset·opacity 직접 기록) */
  trailPathRef: React.Ref<SVGPathElement>;
  /** 스피드라인 그룹 — 비행기 꽁무니 "슝" 짝대기 (부모가 opacity 직접 기록) */
  speedLinesRef: React.Ref<SVGGElement>;
  /** 비행기 그룹 (부모가 transform 직접 기록) */
  planeGroupRef: React.Ref<SVGGElement>;
  /** 도착 시 부유 애니메이션 클래스 토글 */
  landed: boolean;
}

/** 둥실 구름 — 라인아트 낙서 구름. 불균등한 혹 4개가 이어지는 닫힌 외곽선 + 평평한 밑면.
 *  fill 은 배경색(#FDFAF5)으로 뒤 요소를 가린다. 안쪽 g가 CSS 드리프트로 좌우 부유 */
function Cloud({ x, y, scale = 1, delay = 0 }: { x: number; y: number; scale?: number; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className="animate-cloud-drift" style={{ animationDelay: `${delay}s` }}>
        <path
          d="M -19 6 C -27 6 -29 -3 -20 -5 C -18 -13 -7 -15 -3 -9 C 1 -16 12 -14 14 -7 C 23 -8 26 2 18 6 Z"
          fill="#FDFAF5"
          stroke="#C8552E"
          strokeWidth={1.6}
          strokeLinejoin="round"
          opacity={0.4}
        />
      </g>
    </g>
  );
}

export default function JourneyPath({
  geometry,
  activeIndex,
  basePathRef,
  progressPathRef,
  trailPathRef,
  speedLinesRef,
  planeGroupRef,
  landed,
}: JourneyPathProps) {
  const { d, height, anchors, endPoint } = geometry;

  // 구름 배치 — 앵커 사이 중간 높이, 경로/카드를 피해 좌우 가장자리에 번갈아.
  // 시작점 옆에 하나 + 구간마다 하나씩, 크기·드리프트 타이밍을 조금씩 다르게.
  const clouds = [
    { x: 80, y: 70, scale: 0.7, delay: 0.8 },
    ...anchors.slice(1).map((a, i) => ({
      x: i % 2 === 0 ? 365 : 65,
      y: (anchors[i].y + a.y) / 2,
      scale: i % 2 === 0 ? 1 : 0.8,
      delay: i * 1.7,
    })),
  ];

  return (
    <svg viewBox={`0 0 430 ${height}`} className="w-full h-auto" aria-hidden>
      {/* 구름 — 가장 뒤 레이어, 비행기가 옆을 지나친다 */}
      {clouds.map((c, i) => (
        <Cloud key={i} {...c} />
      ))}

      {/* 여정 장식 레이어 — 구름 위, 경로 아래 (별도 에이전트 작성 컴포넌트) */}
      <JourneyDecor anchors={anchors} height={height} endPoint={endPoint} landed={landed} />

      {/* 베이스 경로 — 은은한 점선 (길이 측정용) */}
      <path
        ref={basePathRef}
        d={d}
        fill="none"
        stroke="#5C4D3C"
        strokeOpacity={0.4}
        strokeWidth={2.5}
        strokeDasharray="2 9"
        strokeLinecap="round"
      />

      {/* 진행 오버레이 — 부모가 strokeDashoffset(100→0)을 기록해 색칠 */}
      <path
        ref={progressPathRef}
        d={d}
        fill="none"
        stroke="#D97742"
        strokeWidth={2.5}
        pathLength={100}
        strokeDasharray="100"
        strokeDashoffset={100}
        strokeLinecap="round"
      />

      {/* 모션 트레일 — 비행기 뒤를 따라오는 "슝" 잔상.
          dasharray 창(8/100)을 부모가 dashoffset으로 비행기 위치에 붙이고,
          스크롤 속도에 비례해 opacity를 올렸다가 멈추면 사라지게 한다 */}
      <path
        ref={trailPathRef}
        d={d}
        fill="none"
        stroke="#F0A968"
        strokeWidth={9}
        strokeOpacity={0}
        pathLength={100}
        strokeDasharray="8 92"
        strokeDashoffset={8}
        strokeLinecap="round"
        style={{ transition: 'stroke-opacity 0.25s ease' }}
      />

      {/* 정거장 도트 — activeIndex 이하 활성 */}
      {anchors.map((a, i) => {
        const isActive = i <= activeIndex;
        return (
          <circle
            key={i}
            cx={a.x}
            cy={a.y}
            r={5}
            fill={isActive ? '#D97742' : 'none'}
            stroke={isActive ? '#D97742' : '#5C4D3C'}
            strokeOpacity={isActive ? 1 : 0.3}
            strokeWidth={1.5}
            className={`transition-colors duration-300 ${isActive ? 'animate-dot-pop' : ''}`}
          />
        );
      })}

      {/* 도착 마커 — 작은 하트 */}
      <g transform={`translate(${endPoint.x} ${endPoint.y})`}>
        <path
          d="M0 3 C0 0 -2 -3 -5 -3 C-8 -3 -9 -0.5 -9 1.5 C-9 5 -4.5 8.5 0 12 C4.5 8.5 9 5 9 1.5 C9 -0.5 8 -3 5 -3 C2 -3 0 0 0 3 Z"
          fill="#C8552E"
        />
      </g>

      {/* 종이비행기 — 바깥 g: 부모의 JS transform, 안쪽 g: 도착 후 CSS 부유.
          초기 transform = 경로 시작점(215, 30)에서 아래(90°)를 향함 — 콜백 실행 전 구석에 뜨는 것 방지 */}
      <g ref={planeGroupRef} transform="translate(215 30) rotate(90)">
        {/* 스피드라인 — 기수 반대(-x) 방향 "슝" 짝대기. 빠를 때만 부모가 opacity를 올림 */}
        <g
          ref={speedLinesRef}
          stroke="#D97742"
          strokeWidth={2.5}
          strokeLinecap="round"
          style={{ opacity: 0, transition: 'opacity 0.2s ease' }}
        >
          <line x1={-22} y1={-7} x2={-32} y2={-7} />
          <line x1={-26} y1={0} x2={-42} y2={0} />
          <line x1={-22} y1={7} x2={-32} y2={7} />
        </g>
        <g className={landed ? 'animate-plane-float' : ''}>
          <PaperPlaneIcon />
        </g>
      </g>
    </svg>
  );
}
