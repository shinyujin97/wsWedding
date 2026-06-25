'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { media } from '@/lib/media';

// ==========================================================
// DEBUG 모드: true 일 때 박스를 드래그/리사이즈해서 위치 조정 가능
// 화면 우측 하단 "좌표 복사" 버튼 눌러서 FRAMES 배열에 붙여넣기
// 완료되면 DEBUG = false 로 바꾸면 원래 기능(터치 → 줌)으로 복귀
// ==========================================================
const DEBUG = false;

// 메인 일러스트 위 5개 액자 위치 (%) — x/y는 좌상단, w/h는 이미지 폭/높이 대비 %
// src = 액자 안에 배치될 실제 웨딩 사진. 좌표는 새 mainImage 기준 DEBUG로 맞춘 값.
const INITIAL_FRAMES = [
  { id: 3,  x: 4.8,  y: 25.4, w: 10.2, h: 9.5, src: '/weddingImages/1-2.jpg' },
  { id: 4,  x: 27.1, y: 31.8, w: 10.1, h: 9.1, src: '/weddingImages/1-3.jpg' },
  { id: 6,  x: 44.2, y: 25.5, w: 10.1, h: 9.2, src: '/weddingImages/1-5.jpg' },
  { id: 11, x: 61.9, y: 33.4, w: 9.9,  h: 9.2, src: '/weddingImages/1-9.jpg' },
  { id: 9,  x: 78.3, y: 25,   w: 11,   h: 9.9, src: '/weddingImages/1-7.jpg' },
];

type Frame = { id: number; x: number; y: number; w: number; h?: number; src: string };

// 전체 웨딩 사진 갤러리 — 메인 페이지엔 위 5개 액자만 보이지만,
// "전체 사진 보기" 그리드와 라이트박스 캐러셀은 이 전체 목록(9장)을 사용한다.
const GALLERY = [
  '/weddingImages/1-1.jpg',
  '/weddingImages/1-2.jpg',
  '/weddingImages/1-3.jpg',
  '/weddingImages/1-4.jpg',
  '/weddingImages/1-5.jpg',
  '/weddingImages/1-6.jpg',
  '/weddingImages/1-7.jpg',
  '/weddingImages/1-8.jpg',
  '/weddingImages/1-9.jpg',
];

// 라이트박스 상태: null = 닫힘, 그 외 = 현재 보고 있는 사진 인덱스
// view = 'single'(액자 캐러셀) | 'grid'(전체 사진 보기)
type Lightbox = { index: number; view: 'single' | 'grid' };

// 캐러셀 슬라이드 트랜지션 (방향에 따라 좌/우 진입)
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '60%' : '-60%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-60%' : '60%', opacity: 0 }),
};

export default function FrameTouches() {
  const [frames, setFrames] = useState<Frame[]>(INITIAL_FRAMES);
  const [lightbox, setLightbox] = useState<Lightbox | null>(null);
  // 슬라이드 진입 방향 (+1 = 다음, -1 = 이전) — variants custom 으로 사용
  const [direction, setDirection] = useState(0);
  const [hintShown, setHintShown] = useState(true);
  // DEBUG 전용: main의 실제 width를 스케일만큼 키워서 레이아웃 차원에서 확대 (네이티브 렌더링 품질 유지)
  const [debugScale, setDebugScale] = useState(1);

  const HINT_FRAME_ID = 1;

  // DEBUG: Ctrl+휠로 줌 인/아웃, 버튼으로도 가능
  useEffect(() => {
    if (!DEBUG) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      setDebugScale((s) => {
        const next = s + -e.deltaY * 0.003;
        return Math.max(0.5, Math.min(6, +next.toFixed(2)));
      });
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);

  // DEBUG: debugScale 에 맞춰 main 요소의 width 를 직접 확대 (레이아웃 차원 → 가로 스크롤 가능)
  useEffect(() => {
    if (!DEBUG) return;
    const main = document.querySelector('main') as HTMLElement | null;
    if (!main) return;
    const html = document.documentElement;
    const body = document.body;
    const baseW = Math.min(720, window.innerWidth); // 초기 기준 폭
    const newW = baseW * debugScale;
    main.style.width = `${newW}px`;
    main.style.maxWidth = `${newW}px`;
    // globals.css 의 `overflow-x: hidden` 을 임시 오버라이드해서 가로 스크롤 활성화
    html.style.overflowX = 'auto';
    body.style.overflowX = 'auto';
    return () => {
      main.style.width = '';
      main.style.maxWidth = '';
      html.style.overflowX = '';
      body.style.overflowX = '';
    };
  }, [debugScale]);

  // ==========================================================
  // DEBUG — 드래그로 위치 조정 / shift-드래그로 폭 조정
  // ==========================================================
  const handlePointerDown = (
    e: React.PointerEvent<HTMLButtonElement>,
    id: number,
    mode: 'move' | 'resize'
  ) => {
    if (!DEBUG) return;
    e.preventDefault();
    e.stopPropagation();
    const button = e.currentTarget;
    const section = button.closest('section');
    if (!section) return;

    const sectionRect = section.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const frame = frames.find((f) => f.id === id);
    if (!frame) return;
    const { x: startFx, y: startFy, w: startFw } = frame;
    // h가 아직 안 정해졌으면 현재 픽셀 높이를 % 로 환산해서 시작점으로 사용
    const startFh =
      frame.h ??
      +((button.getBoundingClientRect().height / sectionRect.height) * 100).toFixed(1);

    const move = (ev: PointerEvent) => {
      const dxPct = ((ev.clientX - startX) / sectionRect.width) * 100;
      const dyPct = ((ev.clientY - startY) / sectionRect.height) * 100;

      setFrames((prev) =>
        prev.map((f) => {
          if (f.id !== id) return f;
          if (mode === 'resize') {
            return {
              ...f,
              w: Math.max(3, +(startFw + dxPct).toFixed(1)),
              h: Math.max(3, +(startFh + dyPct).toFixed(1)),
            };
          }
          return {
            ...f,
            x: +(startFx + dxPct).toFixed(1),
            y: +(startFy + dyPct).toFixed(1),
          };
        })
      );
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const copyCoords = async () => {
    const text = frames
      .map((f) => {
        const hPart = f.h !== undefined ? `, h: ${f.h}` : '';
        return `  { id: ${f.id}, x: ${f.x}, y: ${f.y}, w: ${f.w}${hPart}, src: '${f.src}' },`;
      })
      .join('\n');
    try {
      await navigator.clipboard.writeText(text);
      alert('좌표 복사 완료!\nFRAMES 배열에 붙여넣으세요.');
    } catch {
      console.log(text);
      alert('클립보드 실패 — 콘솔에 출력했어요.');
    }
  };

  // ==========================================================
  // 라이트박스 열기 — 탭한 액자(index)의 사진을 액자 캐러셀로 표시
  // ==========================================================
  const handleOpen = (index: number) => {
    if (DEBUG) return; // DEBUG 모드에서는 비활성
    setDirection(0);
    setLightbox({ index, view: 'single' });
    setHintShown(false);
  };

  const handleClose = () => setLightbox(null);

  // 캐러셀 이동 (wrap-around) — dir: +1 다음 / -1 이전
  const paginate = (dir: number) => {
    setDirection(dir);
    setLightbox((lb) =>
      lb ? { ...lb, index: (lb.index + dir + GALLERY.length) % GALLERY.length } : lb
    );
  };

  // 스와이프(드래그) 종료 시 거리·속도로 다음/이전 판정
  const handleDragEnd = (_e: unknown, info: PanInfo) => {
    const threshold = 60; // px
    if (info.offset.x < -threshold || info.velocity.x < -400) paginate(1);
    else if (info.offset.x > threshold || info.velocity.x > 400) paginate(-1);
  };

  // 모달 열려 있는 동안 body 스크롤 잠금 → 닫히면 복구
  useEffect(() => {
    if (!lightbox) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lightbox]);

  // 키보드 네비게이션 (PC 아티팩트 허용)
  useEffect(() => {
    if (!lightbox || lightbox.view !== 'single') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      else if (e.key === 'ArrowRight') paginate(1);
      else if (e.key === 'ArrowLeft') paginate(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox]);

  return (
    <>
      {frames.map((f) => (
        <button
          key={f.id}
          onPointerDown={DEBUG ? (e) => handlePointerDown(e, f.id, 'move') : undefined}
          onClick={DEBUG ? undefined : () => handleOpen(GALLERY.indexOf(f.src))}
          aria-label={`사진 ${f.id}`}
          className={`absolute z-20 overflow-hidden ${
            DEBUG
              ? 'ring-2 ring-yellow-300 cursor-move touch-none select-none'
              : ''
          }`}
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            width: `${f.w}%`,
            // h가 정해졌으면 독립 높이 사용, 아니면 기존 0.85 비율 유지
            ...(f.h !== undefined ? { height: `${f.h}%` } : { aspectRatio: '0.85' }),
          }}
        >
          {/* 실제 웨딩 사진 — 액자 영역에 맞춰 채움 (DEBUG 모드에서도 그대로 보임) */}
          <img
            src={media(f.src)}
            alt=""
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          />
          {DEBUG && (
            <>
              {/* 번호 — 좌상단 작게 */}
              <span className="absolute top-0 left-0 text-[11px] font-bold text-white bg-black/75 px-1.5 py-0.5 rounded-br pointer-events-none">
                {f.id}
              </span>
              {/* 현재 좌표 — 박스 밑 */}
              <span className="absolute -bottom-5 left-0 text-[9px] font-mono text-white bg-black/75 px-1 rounded whitespace-nowrap pointer-events-none">
                {f.x},{f.y} w{f.w}{f.h !== undefined ? ` h${f.h}` : ''}
              </span>
              {/* 리사이즈 핸들 (오른쪽 아래) */}
              <span
                onPointerDown={(e) => handlePointerDown(e as never, f.id, 'resize')}
                className="absolute -right-1.5 -bottom-1.5 w-3 h-3 bg-yellow-300 border border-black cursor-nwse-resize z-10"
              />
            </>
          )}
        </button>
      ))}

      {/* 터치 힌트 — 섹션 기준 % 좌표로 완전 반응형 */}
      {hintShown && !DEBUG && (
        <span
          className="absolute z-20 -translate-x-1/2 text-[9px] md:text-[12px] font-jua tracking-[0.15em] px-2 py-0.5 rounded-full bg-white/85 text-stone-700 shadow-sm whitespace-nowrap animate-pulse pointer-events-none"
          /* 중앙 액자(id6: x44.2 y25.5 w10.1) 오른쪽 위 모서리 근처 */
          style={{ left: '56%', top: '22%' }}
        >
          터치
        </span>
      )}

      {DEBUG && (
        <>
          {/* 줌 컨트롤 — 좌하단 */}
          <div className="fixed bottom-4 left-4 z-50 flex gap-1 bg-black/80 text-white rounded-lg shadow-lg p-1">
            <button
              onClick={() => setDebugScale((s) => Math.max(0.5, +(s - 0.25).toFixed(2)))}
              className="w-9 h-9 hover:bg-white/20 rounded font-bold text-lg"
              aria-label="축소"
            >
              −
            </button>
            <button
              onClick={() => setDebugScale(1)}
              className="px-2 h-9 hover:bg-white/20 rounded text-xs font-mono min-w-[54px]"
              aria-label="원래대로"
            >
              {Math.round(debugScale * 100)}%
            </button>
            <button
              onClick={() => setDebugScale((s) => Math.min(6, +(s + 0.25).toFixed(2)))}
              className="w-9 h-9 hover:bg-white/20 rounded font-bold text-lg"
              aria-label="확대"
            >
              +
            </button>
          </div>
          {/* 좌표 복사 — 우하단 */}
          <button
            onClick={copyCoords}
            className="fixed bottom-4 right-4 z-50 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-lg shadow-lg"
          >
            좌표 복사
          </button>
        </>
      )}

      {/* ==========================================================
          라이트박스 모달 — 액자 캐러셀(single) / 전체보기(grid)
          ========================================================== */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col"
            style={{
              // 메인 가든 일러스트에 어울리는 화사한 웜 아이보리 ~ 세이지 그라데이션
              // 순백은 피해 흰 액자가 부드러운 그림자로 분리되게 함
              background:
                'radial-gradient(120% 90% at 50% 18%, #F7F3EA 0%, #F1EEE3 42%, #E7ECDF 100%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {/* 상단 바 — 돌아가기 + (single일 때) 전체 사진 보기 토글 */}
            <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
              {/* single: 모달 닫기 / grid: 단일 캐러셀로 복귀 */}
              <button
                onClick={() =>
                  lightbox.view === 'single'
                    ? handleClose()
                    : setLightbox((lb) => (lb ? { ...lb, view: 'single' } : lb))
                }
                className="font-jua text-sm md:text-base px-3.5 py-1.5 rounded-full bg-white/70 hover:bg-white/90 text-stone-700 shadow-sm ring-1 ring-stone-300/70 backdrop-blur-sm transition-colors"
              >
                « 돌아가기
              </button>

              {lightbox.view === 'single' ? (
                <button
                  onClick={() => setLightbox((lb) => (lb ? { ...lb, view: 'grid' } : lb))}
                  className="font-jua text-xs md:text-sm px-3.5 py-1.5 rounded-full bg-white/70 hover:bg-white/90 text-stone-700 shadow-sm ring-1 ring-stone-300/70 backdrop-blur-sm transition-colors"
                >
                  전체 사진 보기
                </button>
              ) : (
                <button
                  onClick={handleClose}
                  aria-label="닫기"
                  className="font-jua text-stone-700 text-lg w-9 h-9 flex items-center justify-center rounded-full bg-white/70 hover:bg-white/90 shadow-sm ring-1 ring-stone-300/70 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {/* ----- 단일 액자 캐러셀 ----- */}
            {lightbox.view === 'single' && (
              <div className="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden">
                {/* 슬라이드 영역 */}
                <div className="relative w-full h-full flex items-center justify-center px-6">
                  <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                      key={lightbox.index}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.18}
                      onDragEnd={handleDragEnd}
                      whileDrag={{ cursor: 'grabbing' }}
                      className="absolute flex items-center justify-center cursor-grab touch-pan-y"
                      style={{ width: 'min(88vw, 430px)' }}
                    >
                      {/* 깔끔한 매트 액자 — 흰 여백(패스파르투) + 얇은 키라인 + 부드러운 그림자.
                          사진은 잘리지 않게 object-contain (세로/가로 사진 모두 자연스럽게 담김) */}
                      <div
                        className="relative w-full select-none"
                        style={{
                          backgroundColor: '#FFFFFF',
                          padding: 'clamp(12px, 4vw, 26px)',
                          borderRadius: '2px',
                          boxShadow:
                            '0 22px 50px -16px rgba(60,48,32,0.28), 0 6px 16px rgba(120,104,78,0.16)',
                        }}
                      >
                        <div
                          className="relative overflow-hidden"
                          style={{ boxShadow: 'inset 0 0 0 1px rgba(170,156,134,0.4)' }}
                        >
                          <img
                            src={media(GALLERY[lightbox.index])}
                            alt={`웨딩 사진 ${lightbox.index + 1}`}
                            draggable={false}
                            className="block w-full max-h-[64vh] object-contain select-none bg-white"
                          />
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* 이전 / 다음 어포던스 */}
                  <button
                    onClick={() => paginate(-1)}
                    aria-label="이전 사진"
                    className="absolute left-2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/70 hover:bg-white/90 text-stone-600 text-xl shadow-sm ring-1 ring-stone-300/70 backdrop-blur-sm transition-colors"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => paginate(1)}
                    aria-label="다음 사진"
                    className="absolute right-2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/70 hover:bg-white/90 text-stone-600 text-xl shadow-sm ring-1 ring-stone-300/70 backdrop-blur-sm transition-colors"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}

            {/* single 위치 표시: 카운터 + 점 인디케이터 */}
            {lightbox.view === 'single' && (
              <div className="shrink-0 flex flex-col items-center gap-2 pb-6 pt-2">
                <span className="font-jua text-xs tracking-[0.2em]" style={{ color: '#7A6F5E' }}>
                  {lightbox.index + 1} / {GALLERY.length}
                </span>
                <div className="flex gap-1.5">
                  {GALLERY.map((src, i) => (
                    <span
                      key={src}
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: i === lightbox.index ? '16px' : '6px',
                        height: '6px',
                        backgroundColor: i === lightbox.index ? '#8C7B63' : 'rgba(140,123,99,0.3)',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ----- 전체 사진 보기 그리드 ----- */}
            {lightbox.view === 'grid' && (
              <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-8">
                <div className="grid grid-cols-3 gap-2 md:gap-3 mx-auto max-w-[680px]">
                  {GALLERY.map((src, i) => (
                    <button
                      key={src}
                      onClick={() => {
                        setDirection(0);
                        setLightbox({ index: i, view: 'single' });
                      }}
                      className="relative aspect-square overflow-hidden rounded-sm group"
                      style={{ outline: '1px solid rgba(140,123,99,0.4)' }}
                      aria-label={`사진 ${i + 1} 보기`}
                    >
                      <img
                        src={media(src)}
                        alt={`웨딩 사진 ${i + 1}`}
                        draggable={false}
                        className="absolute inset-0 w-full h-full object-cover select-none transition-transform duration-300 group-hover:scale-105"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
