// 여정(Journey) 섹션 경로 지오메트리 헬퍼.
// 마일스톤 개수(n)에 따라 지그재그 베지어 경로와 정거장 좌표를 계산한다.
// 좌표계: viewBox="0 0 430 H" (모바일 기준 고정 너비, 세로는 개수에 비례)

/** SVG viewBox 가로 폭 (고정) */
export const VIEW_W = 430;

/** 마일스톤 두들 아이콘 종류 — MilestoneDoodle 이 그리는 손그림 낙서 키 */
export type MilestoneIconKey =
  | 'heart'
  | 'rings'
  | 'champagne'
  | 'plane'
  | 'camera'
  | 'house'
  | 'flower'
  | 'letter'
  | 'cake'
  | 'star';

/** 경로 위 정거장(마일스톤) 하나 */
export interface JourneyMilestone {
  id: string;
  year: string;
  text: string;
  image?: string;
  /** 카드 옆에 붙는 손그림 두들 아이콘 (없으면 생략) */
  icon?: MilestoneIconKey;
}

/** buildJourneyPath 가 돌려주는 SVG 지오메트리 */
export interface JourneyGeometry {
  /** SVG path d 속성 */
  d: string;
  /** viewBox 높이 */
  height: number;
  /** 정거장 좌표 (milestones 와 같은 길이) */
  anchors: { x: number; y: number }[];
  /** 도착 마커 좌표 */
  endPoint: { x: number; y: number };
}

// ── 레이아웃 상수 ──
const START = { x: 215, y: 30 }; // 출발점 (상단 중앙)
const FIRST_Y = 140; // 첫 앵커 y
const STEP_Y = 340; // 앵커 간 세로 간격
const LEFT_X = 110; // 짝수 번째 앵커 x
const RIGHT_X = 320; // 홀수 번째 앵커 x
const TAIL_H = 260; // 마지막 앵커 아래 여백 — 마지막 활공 구간 (라벨은 InfoSection 도입부)
const CURVE = 0.55; // 베지어 제어점 비율 (구간 세로 길이 대비)

/**
 * 마일스톤 개수에 맞는 지그재그 여정 경로를 생성한다.
 *
 * - 시작점(215, 30)에서 출발해 각 앵커를 3차 베지어로 연결
 * - 제어점은 구간 세로 길이의 0.55 비율만큼 진행 방향으로 오프셋
 *   (기본 구간은 0.55*340, 첫/마지막 구간은 길이에 비례해 자동 조정)
 * - 마지막 앵커 뒤 한 구간 더 이어 도착점(215, H-50)으로 마무리
 *
 * @param n 마일스톤 개수 (3~6 으로 clamp)
 */
export function buildJourneyPath(n: number): JourneyGeometry {
  // 지원 범위(3~6)를 벗어나면 clamp + 개발 환경에서 경고
  const count = Math.min(6, Math.max(3, n));
  if (count !== n && process.env.NODE_ENV !== 'production') {
    console.warn(`buildJourneyPath: n=${n} 은 지원 범위(3~6)를 벗어나 ${count} 로 clamp 합니다.`);
  }

  const height = FIRST_Y + (count - 1) * STEP_Y + TAIL_H;

  // 지그재그 앵커 좌표 (짝수 = 왼쪽, 홀수 = 오른쪽)
  const anchors = Array.from({ length: count }, (_, i) => ({
    x: i % 2 === 0 ? LEFT_X : RIGHT_X,
    y: FIRST_Y + i * STEP_Y,
  }));

  const endPoint = { x: 215, y: height - 40 };

  // 시작점 → 앵커들 → 도착점을 3차 베지어로 연결
  let d = `M ${START.x} ${START.y}`;
  let prev = START;
  for (const pt of [...anchors, endPoint]) {
    const c = CURVE * (pt.y - prev.y); // 구간 길이에 비례한 제어점 오프셋
    d += ` C ${prev.x} ${prev.y + c}, ${pt.x} ${pt.y - c}, ${pt.x} ${pt.y}`;
    prev = pt;
  }

  return { d, height, anchors, endPoint };
}

/** 데모용 샘플 마일스톤 — 실제 데이터로 교체 전까지 사용 */
export const SAMPLE_MILESTONES: JourneyMilestone[] = [
  { id: 'first-meet', year: '2016', text: '우리가 처음 만난 날', icon: 'letter' },
  { id: 'first-trip', year: '2019', text: '첫 여행을 떠나다', icon: 'plane' },
  { id: 'meet-family', year: '2022', text: '서로의 가족을 만나다', icon: 'house' },
  { id: 'propose', year: '2025', text: '프러포즈, 그리고 약속', icon: 'rings' },
  { id: 'wedding', year: '2026', text: '결혼식장으로 출발', icon: 'champagne' },
];
