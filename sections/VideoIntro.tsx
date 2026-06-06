'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import { media } from '@/lib/media';

// 영상 3개 순서 재생 (seed → waterv1 → treev2)
// 전환: 다음 클립을 미리 재생하고 길게(DISSOLVE초) 겹쳐 디졸브 → 양쪽이 모두
//        움직이는 중에 녹아들어 마지막 프레임 프리즈/하드컷 없이 이어진다.
const DISSOLVE = 0.5; // 크로스페이드 길이(초)

// 클립별 전환 타이밍 (길이: seed 3.0s / water 10.0s / tree 7.0s)
//  - lead: 끝나기 N초 전에 다음 클립으로 겹침 시작 (모션 겹침 → 프리즈 없음)
//  - hold: 클립이 끝난 뒤 마지막 프레임을 N초 더 머문 뒤 전환 (의도적 호흡)
// 전 클립 멈춤 없이 모션 중에 겹쳐 디졸브 — 완전 연속 전환.
const TRANSITION = [
  { lead: 0.5, hold: 0   }, // seed
  { lead: 0.5, hold: 0   }, // water
  { lead: 0.5, hold: 0   }, // tree (마지막 — onComplete)
];

const VIDEOS = [
  media('/video/seed.mp4'),
  media('/video/waterv1.mp4'),
  media('/video/treev2.mp4'),
];

// waterv1 재생은 VIDEOS 내 인덱스 1
const WATER_IDX = 1;

// waterv1 재생 중 한 해씩 표시 (2016 → 2025) — 마지막 2026은 나무(tree) 클립에서 표시
const WATER_CAPTIONS = ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'];
const FINAL_YEAR = '2026';

// 연도 자막 위치 — 중앙 배치, 해가 갈수록 위로 올라간다.
// 식물이 중앙에서 자라므로 상승 폭을 크게(6%/년) 잡아 항상 식물 끝보다 위에 머문다.
//  (식물 끝 높이 실측: 5.4s≈52% / 7.2s≈30% / 8.1s≈18% → 연도 위치가 늘 그 위)
const CAPTION_TOP_START = 62; // 2016 위치 (%, 위에서부터)
const CAPTION_TOP_STEP = 6;   // 한 해당 올라가는 양 (%) → 2025는 8%
const CAPTION_TOP_FINAL = 6;  // 2026 (tree 클립) 위치 (%) — 크라운 위 최상단

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

  // 영상 전환 시 자막 리셋 — 표시는 water 영상이 실제 재생돼 currentTime > 0 일 때부터 (onTimeUpdate)
  useEffect(() => {
    setCaptionIdx(-1);
  }, [activeIdx]);

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
  const CAPTION_INTERVAL = 0.9; // 초
  const handleTimeUpdate = (i: number) => (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    const t = v.currentTime;

    // ① 연도 자막 (water 클립 한정) — 버퍼링/지연 시에도 currentTime 기준으로 동기
    if (i === WATER_IDX && t > 0) {
      const idx = Math.min(Math.floor(t / CAPTION_INTERVAL), WATER_CAPTIONS.length - 1);
      setCaptionIdx((prev) => (prev === idx ? prev : idx));
    }

    // ①-2 마지막 연도(2026) — 나무 클립이 디졸브를 마치고 자리잡은 뒤 표시
    if (i === VIDEOS.length - 1 && t >= DISSOLVE && !showFinalYear) {
      setShowFinalYear(true);
    }

    // ② 끝나기 lead초 전에 다음 클립 겹침 시작 (lead>0 클립만, 마지막 제외)
    //    lead=0 클립(seed)은 여기서 안 걸리고 onEnded→hold 경로로 전환된다.
    const lead = TRANSITION[i]?.lead ?? 0;
    const d = v.duration;
    if (i < VIDEOS.length - 1 && lead > 0 && d > 0 && t >= d - lead) {
      fadeToNext(i);
    }
  };

  return (
    <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] md:max-w-[720px] z-50 bg-[#FDFAF5]">
      {VIDEOS.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0"
          style={{
            opacity: opacities[i],
            transition: `opacity ${DISSOLVE}s ease-in-out`,
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
            onEnded={handleEnded(i)}
            onTimeUpdate={handleTimeUpdate(i)}
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
      ))}

      {/* waterv1 재생 중 연도 자막 — 중앙, 식물보다 빠르게 위로 상승.
          수채 번짐 모프: 이전 연도가 물감 풀리듯 블러로 녹아 사라지는 동안
          다음 연도가 번짐(blur) 속에서 선명하게 맺힌다. */}
      {activeIdx === WATER_IDX && WATER_CAPTIONS.map((year, idx) => {
        const state = idx === captionIdx ? 'active' : idx < captionIdx ? 'past' : 'upcoming';
        return (
          <div
            key={year}
            className="absolute inset-x-0 z-20 flex justify-center pointer-events-none"
            style={{ top: `${CAPTION_TOP_START - idx * CAPTION_TOP_STEP}%` }}
          >
            <p
              className="text-center text-3xl md:text-5xl tracking-[0.12em]"
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                color: '#6B5D4D',
                textShadow: '0 1px 12px rgba(253,250,245,0.85), 0 0 24px rgba(217,186,140,0.35)',
                opacity: state === 'active' ? 1 : 0,
                filter: state === 'active' ? 'blur(0px)' : 'blur(10px)',
                transform:
                  state === 'active' ? 'translateY(0)'
                  : state === 'past' ? 'translateY(-10px) scale(1.04)'
                  : 'translateY(10px) scale(0.96)',
                transition: 'opacity 0.75s ease, filter 0.75s ease, transform 0.75s ease',
                willChange: 'opacity, filter, transform',
              }}
            >
              {year}
            </p>
          </div>
        );
      })}

      {/* 나무(tree) 클립 — 최종 연도 2026, 중앙 최상단 (크라운 위), 사라지지 않고 유지 */}
      {showFinalYear && (
        <div
          className="absolute inset-x-0 z-20 flex justify-center pointer-events-none"
          style={{ top: `${CAPTION_TOP_FINAL}%` }}
        >
          <p
            className="text-center text-5xl md:text-7xl tracking-[0.12em] animate-caption-hold"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              // 주황 단풍 크라운 위에서도 또렷하게 — 아이보리 화이트 + 진한 웜브라운 글로우
              color: '#FFFDF7',
              textShadow: '0 2px 14px rgba(110,70,35,0.6), 0 0 32px rgba(90,55,25,0.45)',
            }}
          >
            {FINAL_YEAR}
          </p>
        </div>
      )}

    </div>
  );
}
