'use client';

/**
 * JourneyDecor — 여정 섹션 장식 레이어 (<g> 콘텐츠 전용, 표현 전용)
 *
 * 러시아 손그림 청첩장 레퍼런스 스타일: 크림 배경 위에 잉크 한 가지 색(#C8552E)으로
 * 그린 손그림 낙서(doodle) 분위기. 완벽한 원/직선을 피하고 살짝 일그러진 Q/C 커브로
 * 손맛을 낸다. 훅·계산 로직 없음, 난수 없음 — 전부 사이클 배열 기반 deterministic.
 *
 * 두들 인벤토리:
 * - 하트 7~9개 (절반 외곽선/절반 채움, 이중 스케치선 1~2개, 살랑임 2~3개)
 * - 결혼반지 한 쌍 1 / 샴페인 잔 부딪침 1 / 꽃가지 2 / 반짝 스파크 4~5
 * - 도착지 맵핀 1 + 착륙 동심 점선 링 2 (landed 시 펄스)
 *
 * 배치 원칙: 경로 중앙(x 130~300)·카드 박스(앵커 y±65)를 피해,
 * 밴드마다 구름(JourneyPath: i%2===0 → x365, 아니면 x65) 반대편
 * 가장자리 기둥(x 26~110 / 340~410)의 밴드 중간 y±100에만 놓는다.
 * 시작 구역(y 30~100)은 하트 1~2개, 도착 구역(endPoint 주변)이 제일 풍성하게.
 */

interface JourneyDecorProps {
  /** 정거장 좌표 (JourneyGeometry.anchors) */
  anchors: { x: number; y: number }[];
  /** viewBox 높이 */
  height: number;
  /** 도착 마커 좌표 */
  endPoint: { x: number; y: number };
  /** 도착 시 착륙 링 펄스 토글 */
  landed: boolean;
}

/** 잉크 색 단일 — 단풍 레드. 모든 두들이 이 색, opacity 0.45~0.75 변주 */
const INK = '#C8552E';

/* ── 하트 — 주력 두들, index 기반 변주 (난수 없음) ── */

/**
 * 손그림 하트 외곽 — 좌우 비대칭으로 살짝 일그러뜨린 곡선 (폭 약 13 기준)
 * 왼쪽 봉우리가 조금 낮고 오른쪽 골이 살짝 깊어 손으로 그린 느낌을 낸다.
 */
const HEART_D =
  'M 0 2.4 C -0.5 -0.6 -2.2 -2.7 -4.5 -2.4 C -6.7 -2.1 -7.3 0.3 -6.4 2.3 ' +
  'C -5.2 4.9 -2.5 6.7 0.2 8.8 C 2.8 6.6 5.4 4.7 6.3 2.1 C 7 0 6.2 -2.2 4.2 -2.5 ' +
  'C 2.2 -2.8 0.4 -0.7 0 2.4 Z';

const HEART_NOMINAL = 13; // HEART_D 기준 폭
const HEART_SIZES = [9, 14, 7, 12, 16, 8, 11, 6, 13]; // 6~16px 변주
const HEART_ROTS = [-18, 14, 28, -8, 9, -24, 18, 5, -12];
const HEART_OPACITIES = [0.7, 0.5, 0.62, 0.46, 0.74, 0.55];
const HEART_DELAYS = [0, 1.6, 3.2];

/**
 * 하트 1개 — idx 사이클로 크기/회전/채움/이중선/살랑임을 결정.
 * - idx 짝수 = 잉크 채움, 홀수 = 외곽선만
 * - 외곽선 하트 중 idx%4===1 인 것만 살짝 어긋난 이중 스케치선 추가 (1~2개)
 * - idx%3===1 인 하트만 살랑임 (2~3개) — 바깥 g 배치 + 안쪽 g 애니메이션 2중 구조
 */
function Heart({ x, y, idx }: { x: number; y: number; idx: number }) {
  const size = HEART_SIZES[idx % HEART_SIZES.length];
  const rot = HEART_ROTS[idx % HEART_ROTS.length];
  const op = HEART_OPACITIES[idx % HEART_OPACITIES.length];
  const filled = idx % 2 === 0;
  const isDouble = !filled && idx % 4 === 1; // 이중 스케치선은 외곽선 하트에만
  const sway = idx % 3 === 1;
  const delay = HEART_DELAYS[Math.floor(idx / 3) % HEART_DELAYS.length];
  const scale = size / HEART_NOMINAL;
  const sw = 1.6 / scale; // scale 보정 — 화면 기준 stroke 약 1.6 유지

  const shape = filled ? (
    <path d={HEART_D} fill={INK} stroke="none" />
  ) : (
    <>
      <path
        d={HEART_D}
        fill="none"
        stroke={INK}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 살짝 어긋난 두 번째 스케치선 — 손이 두 번 지나간 듯한 이중선 */}
      {isDouble && (
        <path
          d={HEART_D}
          fill="none"
          stroke={INK}
          strokeWidth={sw * 0.7}
          strokeOpacity={0.55}
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="rotate(6) translate(0.7 -0.5) scale(1.12)"
        />
      )}
    </>
  );

  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`} opacity={op}>
      {sway ? (
        <g className="animate-leaf-sway" style={{ animationDelay: `${delay}s` }}>
          {shape}
        </g>
      ) : (
        shape
      )}
    </g>
  );
}

/* ── 반짝 스파크 — 작은 + / ✦(45° 회전) 틱, 팔 길이를 살짝 어긋나게 ── */

const SPARK_SIZES = [3.4, 2.6, 4];
const SPARK_OPACITIES = [0.6, 0.45, 0.7];

function Sparkle({ x, y, idx }: { x: number; y: number; idx: number }) {
  const s = SPARK_SIZES[idx % SPARK_SIZES.length];
  const rot = idx % 2 === 0 ? 0 : 45; // 절반은 + 모양, 절반은 ✦ 느낌
  const op = SPARK_OPACITIES[idx % SPARK_OPACITIES.length];
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${rot})`}
      stroke={INK}
      strokeWidth={1.5}
      strokeLinecap="round"
      opacity={op}
    >
      {/* 위아래/좌우 팔 길이를 어긋나게 — 자로 안 댄 손그림 십자 */}
      <path d={`M 0 ${-s} L 0 ${s * 0.85}`} />
      <path d={`M ${-s * 0.85} 0 L ${s} 0`} />
    </g>
  );
}

/* ── 결혼반지 한 쌍 — 일그러진 원 2 겹침 + 다이아 + 반짝 틱 3 ── */

function Rings({ x, y }: { x: number; y: number }) {
  return (
    <g
      transform={`translate(${x} ${y}) rotate(-8)`}
      stroke={INK}
      strokeWidth={1.7}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.7}
    >
      {/* 왼쪽 링 — 시작/끝이 살짝 안 맞는 손그림 원 */}
      <path d="M -5.5 -7.8 C -1 -8.4 2.6 -4.8 2.4 -0.2 C 2.2 4.4 -1.4 7.9 -5.9 7.7 C -10.3 7.5 -13.7 3.9 -13.5 -0.5 C -13.3 -4.8 -9.9 -7.4 -5.5 -7.8 Z" />
      {/* 오른쪽 링 — 왼쪽 링과 겹치게 */}
      <path d="M 6.2 -7.6 C 10.6 -8 13.9 -4.4 13.7 0 C 13.5 4.5 10 7.8 5.6 7.6 C 1.3 7.4 -2 3.9 -1.8 -0.4 C -1.6 -4.6 1.8 -7.2 6.2 -7.6 Z" />
      {/* 오른쪽 링 위 다이아 */}
      <path d="M 6 -13.2 L 9 -10.5 L 6.1 -7.6 L 3.2 -10.4 Z" />
      {/* 반짝 틱 3 — 다이아 주변 */}
      <path d="M 10.8 -14.2 L 12.6 -16.2" />
      <path d="M 13.6 -10.8 L 16.2 -11.4" />
      <path d="M 2.2 -15.8 L 1.5 -18.2" />
    </g>
  );
}

/* ── 샴페인 잔 부딪침 — 플루트 잔 외곽 2 + 기포 점 3 + 스파크 틱 3 ── */

/** 플루트 잔 1개 — 보울(위가 열린 U) + 림 + 스템 + 받침, 림 중심이 로컬 원점 */
function Flute() {
  return (
    <>
      <path d="M -3.2 0 C -3.6 5.6 -2.3 9.6 0 10.2 C 2.3 9.7 3.5 5.7 3.1 0" />
      <path d="M -3.2 0 C -2 0.9 2.1 0.9 3.1 0" />
      <path d="M 0 10.2 L 0.2 15.4" />
      <path d="M -3 16.2 C -1.2 17.1 1.5 17 3.2 16" />
    </>
  );
}

function Champagne({ x, y }: { x: number; y: number }) {
  return (
    <g
      transform={`translate(${x} ${y})`}
      stroke={INK}
      strokeWidth={1.6}
      fill="none"
      strokeLinecap="round"
      opacity={0.65}
    >
      {/* 두 잔이 림 끝을 원점 근처에서 부딪침 — 좌우로 기울임 */}
      <g transform="translate(-7.5 3.5) rotate(16)">
        <Flute />
      </g>
      <g transform="translate(7.5 3.5) rotate(-16)">
        <Flute />
      </g>
      {/* 부딪침 스파크 틱 3 — 림이 만나는 지점 위 */}
      <path d="M 0 -2.5 L 0 -5.5" />
      <path d="M -3.5 -1.5 L -5.8 -3.4" />
      <path d="M 3.5 -1.5 L 5.8 -3.4" />
      {/* 기포 점 3 — 왼쪽 잔 위로 떠오르는 거품 */}
      <g fill={INK} stroke="none">
        <circle cx={-9} cy={-1.5} r={0.8} />
        <circle cx={-11.5} cy={-5} r={0.7} />
        <circle cx={-7.5} cy={-7.5} r={0.9} />
      </g>
    </g>
  );
}

/* ── 꽃가지/잔가지 — 줄기 곡선 + 잎 / 봉오리 2종 변주 ── */

function Sprig({ x, y, rot, variant }: { x: number; y: number; rot: number; variant: 0 | 1 }) {
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${rot})`}
      stroke={INK}
      strokeWidth={1.5}
      fill="none"
      strokeLinecap="round"
      opacity={0.6}
    >
      {/* 줄기 — 좌우로 살짝 흔들리는 S 곡선 */}
      <path d="M 0 14 C -1.8 8 1.2 2 -0.8 -6 C -1.4 -8.8 -1 -11 -0.2 -13" />
      {variant === 0 ? (
        /* 잎가지 — 줄기 양옆 작은 잎 3장 (두 획으로 그린 잎몸) */
        <>
          <path d="M -0.6 7 C -4.2 6.4 -6.4 4 -6.8 1.2 C -3.8 1.6 -1.6 3.6 -0.8 6.2" />
          <path d="M -0.2 1.5 C 3.4 1.1 5.7 -1.2 6.1 -4 C 3.1 -3.7 0.9 -1.7 0 0.8" />
          <path d="M -0.8 -5 C -4 -5.8 -5.8 -8 -6 -10.6 C -3.2 -10 -1.3 -8.2 -0.7 -5.8" />
        </>
      ) : (
        /* 봉오리가지 — 곁가지 2 + 끝마다 작은 봉오리 원 + 점 2 */
        <>
          <path d="M -0.5 2 C -3 1 -4.6 -0.8 -5.2 -3" />
          <path d="M -0.7 -4 C 1.8 -5 3.3 -6.8 3.8 -9" />
          <circle cx={-5.5} cy={-3.8} r={1.7} />
          <circle cx={4.1} cy={-9.8} r={1.6} />
          <circle cx={-0.2} cy={-14.6} r={1.9} />
          <g fill={INK} stroke="none">
            <circle cx={2.6} cy={-13} r={0.7} />
            <circle cx={-3.4} cy={-7.6} r={0.7} />
          </g>
        </>
      )}
    </g>
  );
}

/* ── 도착지 맵핀 — 물방울 외곽 + 안에 점, 살짝 기울임 ── */

function MapPin({ x, y }: { x: number; y: number }) {
  return (
    <g
      transform={`translate(${x} ${y}) rotate(9)`}
      stroke={INK}
      strokeWidth={1.7}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.75}
    >
      {/* 물방울 외곽 — 좌우가 살짝 다른 손그림 곡선 */}
      <path d="M 0 9.6 C -2.4 5.8 -6.6 1.7 -6.4 -2.8 C -6.2 -7 -3.3 -9.7 0.3 -9.6 C 3.8 -9.5 6.6 -6.6 6.4 -2.5 C 6.2 1.8 2.3 5.9 0 9.6 Z" />
      <circle cx={0.1} cy={-2.8} r={1.7} fill={INK} stroke="none" />
    </g>
  );
}

/* ── 배치 사이클 (구름 반대편 가장자리 기둥: x 26~110 / 340~410) ── */

// 밴드 주역 두들 사이클 — 4밴드(n=5) 기준: 반지 1 / 샴페인 1 / 꽃가지 2 가 딱 맞는다.
// 밴드가 5개(n=6)면 마지막은 하트로 채운다.
const FEATURES = ['rings', 'champagne', 'sprig', 'sprig2', 'heart'] as const;

// 기둥 안 x 변주 — 하트/스파크가 일렬로 서지 않게
const HEART_X_LEFT = [44, 92, 58];
const HEART_X_RIGHT = [394, 350, 382];
const SPARK_X_LEFT = [38, 84, 70];
const SPARK_X_RIGHT = [400, 356, 368];
const FEATURE_X_LEFT = 66;
const FEATURE_X_RIGHT = 372;
const SPRIG_ROTS = [-10, 14];

/* ── 메인 ── */

export default function JourneyDecor({ anchors, height, endPoint, landed }: JourneyDecorProps) {
  // 밴드 파생 — 밴드 i = 앵커 i → i+1, 구름 편 규칙은 JourneyPath 와 동일 (i%2===0 → 오른쪽 365)
  const bands = anchors.slice(1).map((next, i) => ({
    midY: (anchors[i].y + next.y) / 2,
    cloudOnRight: i % 2 === 0, // 구름이 오른쪽이면 두들은 왼쪽 기둥에
  }));

  // 하트 — 시작 2 + 밴드당 1(구름 반대편, 밴드중간 -95) + 도착 3 = n=5 기준 9개
  const hearts = [
    { x: 150, y: 54 }, // 시작 구역 (y 30~100)
    { x: 284, y: 86 },
    ...bands.map((b, i) => ({
      x: b.cloudOnRight ? HEART_X_LEFT[i % 3] : HEART_X_RIGHT[i % 3],
      y: b.midY - 95,
    })),
    // 도착 구역 — 착륙 링·핀·라벨을 피해 주변에 점점이
    { x: endPoint.x - 46, y: endPoint.y - 14 },
    { x: endPoint.x + 52, y: endPoint.y + 10 },
    { x: endPoint.x - 28, y: endPoint.y - 40 },
  ];

  // 반짝 스파크 — 밴드당 1(밴드중간 +90) + 핀 옆 1 = n=5 기준 5개
  const sparkles = [
    ...bands.map((b, i) => ({
      x: b.cloudOnRight ? SPARK_X_LEFT[i % 3] : SPARK_X_RIGHT[i % 3],
      y: b.midY + 90,
    })),
    { x: endPoint.x + 48, y: Math.min(endPoint.y - 44, height - 30) }, // 핀 위쪽 반짝
  ];

  // 밴드 주역 두들 — 밴드 중간 y, 구름 반대편 기둥 중앙
  const features = bands.map((b, i) => ({
    kind: FEATURES[Math.min(i, FEATURES.length - 1)],
    x: b.cloudOnRight ? FEATURE_X_LEFT : FEATURE_X_RIGHT,
    y: b.midY,
    band: i,
  }));

  return (
    <g aria-hidden>
      {/* 하트 — 주력 두들 */}
      {hearts.map((h, i) => (
        <Heart key={i} x={h.x} y={h.y} idx={i} />
      ))}

      {/* 밴드 주역 두들 — 반지 / 샴페인 / 꽃가지 사이클 */}
      {features.map((f) => {
        switch (f.kind) {
          case 'rings':
            return <Rings key={f.band} x={f.x} y={f.y} />;
          case 'champagne':
            return <Champagne key={f.band} x={f.x} y={f.y} />;
          case 'sprig':
            return <Sprig key={f.band} x={f.x} y={f.y} rot={SPRIG_ROTS[0]} variant={0} />;
          case 'sprig2':
            return <Sprig key={f.band} x={f.x} y={f.y} rot={SPRIG_ROTS[1]} variant={1} />;
          case 'heart':
            // 밴드 5개 이상(n=6)일 때만 — 이중 스케치 외곽선 하트로 채움
            return <Heart key={f.band} x={f.x} y={f.y} idx={1} />;
        }
      })}

      {/* 반짝 스파크 */}
      {sparkles.map((s, i) => (
        <Sparkle key={i} x={s.x} y={s.y} idx={i} />
      ))}

      {/* 도착지 맵핀 — endPoint 우상단, 살짝 기울임 */}
      <MapPin x={endPoint.x + 30} y={endPoint.y - 25} />

      {/* 착륙 링 — endPoint 동심 점선원 2, landed 시 펄스 (애니메이션이 opacity 를 덮어씀) */}
      <circle
        cx={endPoint.x}
        cy={endPoint.y}
        r={14}
        fill="none"
        stroke={INK}
        opacity={0.35}
        strokeWidth={1.2}
        strokeDasharray="2 3"
        className={landed ? 'animate-ring-pulse' : ''}
      />
      <circle
        cx={endPoint.x}
        cy={endPoint.y}
        r={20}
        fill="none"
        stroke={INK}
        opacity={0.22}
        strokeWidth={1}
        strokeDasharray="1.5 4"
        className={landed ? 'animate-ring-pulse' : ''}
      />
    </g>
  );
}
