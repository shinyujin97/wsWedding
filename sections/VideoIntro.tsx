'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import { media } from '@/lib/media';

// 영상 3개 순서 재생 (seed → waterv1 → treev2)
// 전환: 다음 클립을 미리 재생하고 길게(DISSOLVE초) 겹쳐 디졸브 → 양쪽이 모두
//        움직이는 중에 녹아들어 마지막 프레임 프리즈/하드컷 없이 이어진다.
const DISSOLVE = 0.5; // 2026 등장 타이밍 기준값 (전환 효과는 사용 안 함)

// 클립별 전환 타이밍 — 효과 없이, 각 클립이 끝나면 다음 클립으로 바로 전환(하드컷)
//  - lead 0: 미리 겹치지 않고 onEnded 시점에 전환
const TRANSITION = [
  { lead: 0, hold: 0 }, // seed
  { lead: 0, hold: 0 }, // water
  { lead: 0, hold: 0 }, // tree (마지막 — onComplete)
];

const VIDEOS = [
  media('/video/1.mp4'),
  media('/video/2.mp4'),
  media('/video/3.mp4'),
];

// 연도: 2016~2025는 1·2번 클립에서 오도미터로 롤링, 2026은 3번 클립에서 천천히 확대 등장.
const YEAR_START = 2016;
const ROLL_END = 2025;
const FINAL_YEAR = '2026';
const ROLL_YEARS = Array.from({ length: ROLL_END - YEAR_START + 1 }, (_, k) => String(YEAR_START + k));
// 자리별(천/백/십/일) 문자 시퀀스 — 값이 안 바뀌면 같은 글자 반복이라 롤링 안 함
const ROLL_DIGITS = [0, 1, 2, 3].map((pos) => ROLL_YEARS.map((y) => y[pos]));
const ROLL_LAST_IDX = ROLL_YEARS.length - 1; // 9 (=2025)
const ODO_TOP = 9;     // 상단 고정 위치(%)
const ODO_DH = 1.16;   // 디짓 슬롯 높이(em)

const YEAR_TEXT_STYLE: React.CSSProperties = {
  letterSpacing: '0.1em',
  lineHeight: 1,
  fontWeight: 600,
};

// 흰색 글자 + 옅은 골드 테두리(바깥쪽에만).
// paintOrder:'stroke' → 테두리 먼저 그리고 흰 글자를 덮어, 골드가 글자 안쪽으로 안 파고들고
// 바깥 가장자리에만 얇게 남는다. (그림자는 YEAR_SHADOW 로 옅게)
const YEAR_FILL: React.CSSProperties = {
  color: '#FFFFFF',
  WebkitTextStroke: '3px #CCA13C',
  paintOrder: 'stroke',
};

// 글자 대비용 필터 — 어두운 타이트 그림자(외곽선 효과) + 약간의 번짐 그림자 + 아이보리 글로우.
// (롤링 숫자는 overflow:hidden 으로 text-shadow가 잘려서, 잘리지 않는 부모 drop-shadow로 처리)
// 골드 글로우(빛나는 느낌) + 은은한 다크 오프셋 그림자(깊이/가독성)
const YEAR_SHADOW =
  'drop-shadow(0 0 5px rgba(236,206,126,0.9)) drop-shadow(0 0 14px rgba(226,190,108,0.6)) drop-shadow(0 2px 5px rgba(40,25,10,0.4))';

// 상단 연도 오도미터 (2016~2025) — 끝자리만 세로 롤링, 우아한 세리프 + 골드 장식
function YearOdometer({ index, show }: { index: number; show: boolean }) {
  const i = Math.max(0, Math.min(index, ROLL_LAST_IDX));
  return (
    <div
      className="absolute inset-x-0 flex flex-col items-center pointer-events-none"
      style={{
        top: `${ODO_TOP}%`,
        zIndex: 20,
        opacity: show ? 1 : 0,
        filter: show ? YEAR_SHADOW : 'blur(8px)',
        transition: 'opacity 0.7s ease, filter 0.7s ease',
        willChange: 'opacity, filter',
      }}
    >
      <div className="flex font-fjalla text-7xl md:text-8xl" style={YEAR_TEXT_STYLE}>
        {ROLL_DIGITS.map((seq, pos) => {
          // 맨 끝자리(일의 자리)만 굴러가고, 앞자리들은 즉시 전환(롤링 안 함)
          const isUnits = pos === ROLL_DIGITS.length - 1;
          return (
            <span key={pos} style={{ height: `${ODO_DH}em`, overflow: 'hidden', display: 'inline-block' }}>
              <span
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  transform: `translateY(-${(i * ODO_DH).toFixed(3)}em)`,
                  transition: isUnits ? 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
                  willChange: 'transform',
                }}
              >
                {seq.map((ch, k) => (
                  <span
                    key={k}
                    style={{ height: `${ODO_DH}em`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...YEAR_FILL }}
                  >
                    {ch}
                  </span>
                ))}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

// 최종 연도 2026 (3번 클립) — 롤링 없이, 마지막 클립 진행도(progress)에 맞춰 천천히 확대.
function FinalYear({ show, progress }: { show: boolean; progress: number }) {
  // 0.5 → 1.05 배로 영상 내내 서서히 확대 (progress 가 클립 길이에 동기화됨)
  const scale = show ? (0.5 + 0.55 * progress).toFixed(3) : '0.5';
  return (
    <div
      className="absolute inset-x-0 flex flex-col items-center pointer-events-none"
      style={{
        top: `${ODO_TOP - 1}%`,
        zIndex: 20,
        opacity: show ? 1 : 0,
        transform: `scale(${scale})`,
        filter: show ? YEAR_SHADOW : 'blur(12px)',
        // opacity/filter는 부드러운 페이드, transform은 짧게(0.4s)만 줘서 ~4Hz progress 갱신 사이를 메운다 → 영상 길이만큼 연속 확대
        transition: 'opacity 1.8s ease, transform 0.45s linear, filter 1.8s ease',
        transformOrigin: 'center top',
        willChange: 'opacity, transform, filter',
      }}
    >
      <div className="font-fjalla text-8xl md:text-9xl" style={{ ...YEAR_TEXT_STYLE, ...YEAR_FILL }}>
        {FINAL_YEAR}
      </div>
    </div>
  );
}

interface Props {
  onComplete: () => void;
}

export default function VideoIntro({ onComplete }: Props) {
  const video1 = useRef<HTMLVideoElement>(null);
  const video2 = useRef<HTMLVideoElement>(null);
  const video3 = useRef<HTMLVideoElement>(null);
  const refs = [video1, video2, video3];

  // 블러 백드롭용 ref (메인 영상과 같이 재생)
  const bg1 = useRef<HTMLVideoElement>(null);
  const bg2 = useRef<HTMLVideoElement>(null);
  const bg3 = useRef<HTMLVideoElement>(null);
  const bgRefs = [bg1, bg2, bg3];

  // 각 영상의 opacity
  const [opacities, setOpacities] = useState([1, 0, 0]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [captionIdx, setCaptionIdx] = useState(-1);
  const [showFinalYear, setShowFinalYear] = useState(false);
  // 2026 확대 진행도 0~1 — 마지막 클립 재생 진행에 맞춰 천천히 커진다.
  const [finalProgress, setFinalProgress] = useState(0);

  // 각 클립의 실제 길이(초) — 연도 롤링을 1번+2번 길이 합산 기준으로 분배하는 데 사용
  const durationsRef = useRef<number[]>([0, 0, 0]);

  // 이미 다음 클립으로 전환을 시작한 인덱스 (겹침 전환 + onEnded 안전망의 중복 호출 방지)
  const transitionedRef = useRef<Set<number>>(new Set());
  // hold(마지막 프레임 머무름) 타이머 — 언마운트 시 정리
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (holdTimerRef.current) clearTimeout(holdTimerRef.current); }, []);

  // 다음 클립으로 겹침 디졸브 시작 (마지막 클립은 호출되지 않음 — onComplete는 handleEnded가 처리)
  const fadeToNext = useCallback((currentIdx: number) => {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= VIDEOS.length) return;
    if (transitionedRef.current.has(currentIdx)) return; // 이미 전환 시작함
    transitionedRef.current.add(currentIdx);

    // 다음 영상 재생 시작 (메인 + 백드롭 동시) — 현재 클립은 계속 재생 중이라 둘 다 모션 상태
    refs[nextIdx].current?.play();
    bgRefs[nextIdx].current?.play();

    // 현재 영상 fade out → 다음 영상 fade in (겹쳐서 디졸브)
    setOpacities(prev => {
      const next = [...prev];
      next[currentIdx] = 0;
      next[nextIdx] = 1;
      return next;
    });
    setActiveIdx(nextIdx);
  }, []);

  // 클립 종료 처리: 마지막 클립이면 본문 진입, 그 외엔 hold 후 전환(안전망 포함)
  const handleEnded = useCallback((i: number) => () => {
    if (i >= VIDEOS.length - 1) {
      onComplete();
      return;
    }
    // 이미 lead 시점에 겹침 전환됐다면 그대로 (transitionedRef 가드가 처리)
    if (transitionedRef.current.has(i)) return;
    const hold = TRANSITION[i]?.hold ?? 0;
    if (hold > 0) {
      holdTimerRef.current = setTimeout(() => fadeToNext(i), hold * 1000);
    } else {
      fadeToNext(i);
    }
  }, [onComplete, fadeToNext]);

  // 인트로 재생 중에 뒤이어 나올 MainSection 리소스(웨딩 사진 9장 + 메인 프레임 PNG) 프리페치
  useEffect(() => {
    const assets = [
      media('/images/frames/mainImage.jpg'),
      ...Array.from({ length: 9 }, (_, i) => media(`/weddingImages/1-${i + 1}.jpg`)),
    ];
    assets.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  // 영상의 currentTime 으로부터 ①연도 자막 ②끝나기 직전 겹침 전환 처리
  const handleTimeUpdate = (i: number) => (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    const t = v.currentTime;
    const d = v.duration;

    // 길이 기록(메타데이터 로드 전 대비 onTimeUpdate에서도 갱신)
    if (d > 0) durationsRef.current[i] = d;

    // ① 연도 오도미터 — 2016~2025를 1번+2번 영상 길이 합산 기준으로 고르게 분배.
    //    (1번 영상에서 시작해 2번 영상 끝까지 천천히 굴러간다)
    if ((i === 0 || i === 1) && t > 0) {
      const d0 = durationsRef.current[0];
      const d1 = durationsRef.current[1];
      if (d0 > 0 && d1 > 0) {
        const elapsed = i === 0 ? t : d0 + t;
        const total = d0 + d1;
        const idx = Math.min(Math.floor((elapsed / total) * (ROLL_LAST_IDX + 1)), ROLL_LAST_IDX);
        // 단조 증가만 (겹침 전환 중 두 클립이 동시에 갱신해도 뒤로 안 감)
        setCaptionIdx((prev) => (idx > prev ? idx : prev));
      }
    }

    // ①-2 마지막 연도(2026) — 디졸브 후 표시되며, 마지막 클립 재생 진행에 맞춰 천천히 확대.
    //      (고정 시간이 아니라 클립 길이에 동기화 → 영상 내내 서서히 커진다)
    if (i === VIDEOS.length - 1 && d > 0) {
      const show = t >= DISSOLVE && t < d * 0.96;
      if (show !== showFinalYear) setShowFinalYear(show);
      // DISSOLVE~90% 구간 동안 0→1로 진행 (그 뒤엔 최대 크기 유지)
      const p = Math.min(Math.max((t - DISSOLVE) / (d * 0.9 - DISSOLVE), 0), 1);
      setFinalProgress((prev) => (Math.abs(prev - p) > 0.005 ? p : prev));
    }

    // ② 끝나기 lead초 전에 다음 클립 겹침 시작 (lead>0 클립만, 마지막 제외)
    //    lead=0 클립(seed)은 여기서 안 걸리고 onEnded→hold 경로로 전환된다.
    const lead = TRANSITION[i]?.lead ?? 0;
    if (i < VIDEOS.length - 1 && lead > 0 && d > 0 && t >= d - lead) {
      fadeToNext(i);
    }
  };

  // 롤링(2016~2025)은 1·2번 클립에서만 / 2026은 3번 클립에서 천천히 확대 등장
  const onTree = activeIdx === VIDEOS.length - 1;
  const inRoll = activeIdx === 0 || activeIdx === 1;
  const odoIndex = Math.max(0, Math.min(captionIdx, ROLL_LAST_IDX));
  const odoShow = inRoll && captionIdx >= 0;
  const finalShow = onTree && showFinalYear;

  return (
    <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] md:max-w-[720px] z-50 bg-[#FDFAF5]">
      {VIDEOS.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0"
          style={{
            opacity: opacities[i],
            // 전환 효과 없음 — 즉시 전환(하드컷)
            zIndex: i,
          }}
        >
          {/* 블러 백드롭 (전 기기 공통 — 여백을 자연스럽게 채움) */}
          <video
            ref={bgRefs[i]}
            src={src}
            autoPlay={i === 0}
            muted
            playsInline
            preload="auto"
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: 'blur(28px) brightness(0.9)',
              transform: 'scale(1.1)',
            }}
          />
          {/* 메인 영상 — 원본 비율 유지 (contain) */}
          <video
            ref={refs[i]}
            src={src}
            autoPlay={i === 0}
            muted
            playsInline
            preload="auto"
            onLoadedMetadata={(e) => { durationsRef.current[i] = e.currentTarget.duration || 0; }}
            onEnded={handleEnded(i)}
            onTimeUpdate={handleTimeUpdate(i)}
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
      ))}

      {/* 상단 연도 오도미터 — 2016~2025 끝자리 롤링 (1·2번 클립) */}
      <YearOdometer index={odoIndex} show={odoShow} />
      {/* 최종 2026 — 3번 클립 길이에 맞춰 천천히 확대 등장 */}
      <FinalYear show={finalShow} progress={finalProgress} />

    </div>
  );
}
