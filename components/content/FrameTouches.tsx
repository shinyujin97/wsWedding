'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================================
// DEBUG 모드: true 일 때 박스를 드래그/리사이즈해서 위치 조정 가능
// 화면 우측 하단 "좌표 복사" 버튼 눌러서 FRAMES 배열에 붙여넣기
// 완료되면 DEBUG = false 로 바꾸면 원래 기능(터치 → 줌)으로 복귀
// ==========================================================
const DEBUG = false;

// mainImage.png 위 9개 액자 위치 (%) — x/y는 좌상단, w는 이미지 폭 대비 %
// src = 액자 안에 배치될 실제 웨딩 사진
const INITIAL_FRAMES = [
  { id: 1,  x: 15.8, y: 36.4, w: 6.8, h: 5.2, src: '/weddingImages/1-1.jpg' },
  { id: 3,  x: 8.7,  y: 49.8, w: 8.4, h: 7.1, src: '/weddingImages/1-2.jpg' },
  { id: 4,  x: 21.9, y: 43.9, w: 8,   h: 6.2, src: '/weddingImages/1-3.jpg' },
  { id: 5,  x: 41.1, y: 42.8, w: 8.7, h: 7.8, src: '/weddingImages/1-4.jpg' },
  { id: 6,  x: 30.6, y: 53.6, w: 8.1, h: 6.6, src: '/weddingImages/1-5.jpg' },
  { id: 8,  x: 60.6, y: 41.7, w: 9.2, h: 6.9, src: '/weddingImages/1-6.jpg' },
  { id: 9,  x: 68.6, y: 52.2, w: 8.6, h: 6.6, src: '/weddingImages/1-7.jpg' },
  { id: 10, x: 74.7, y: 41.7, w: 7.3, h: 6,   src: '/weddingImages/1-8.jpg' },
  { id: 11, x: 84.7, y: 46.3, w: 8.3, h: 7.1, src: '/weddingImages/1-9.jpg' },
];

type Frame = { id: number; x: number; y: number; w: number; h?: number; src: string };

type Zoom = {
  origin: { left: number; top: number; width: number; height: number };
  scale: number;
  tx: number;
  ty: number;
  constraints: { left: number; right: number; top: number; bottom: number };
};

export default function FrameTouches() {
  const [frames, setFrames] = useState<Frame[]>(INITIAL_FRAMES);
  const [zoom, setZoom] = useState<Zoom | null>(null);
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
  // 줌인 — mainImage 고정된 채로 해당 액자로 "다가가는" 효과
  // 섹션 전체(메인이미지 + 웨딩사진 오버레이)가 함께 스케일됨
  // ==========================================================
  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>, id: number) => {
    if (DEBUG) return; // DEBUG 모드에서는 비활성
    const button = e.currentTarget;
    const section = button.closest('section');
    if (!section) return;

    const sectionRect = section.getBoundingClientRect();
    const frameRect = button.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const target = Math.min(vw, vh) * 0.75;
    const scale = target / frameRect.width;

    const sectionCx = sectionRect.left + sectionRect.width / 2;
    const sectionCy = sectionRect.top + sectionRect.height / 2;
    const frameCx = frameRect.left + frameRect.width / 2;
    const frameCy = frameRect.top + frameRect.height / 2;

    const newFrameCx = sectionCx + (frameCx - sectionCx) * scale;
    const newFrameCy = sectionCy + (frameCy - sectionCy) * scale;

    const scaledW = sectionRect.width * scale;
    const scaledH = sectionRect.height * scale;
    const constraints = {
      left: vw - sectionCx - scaledW / 2,
      right: scaledW / 2 - sectionCx,
      top: vh - sectionCy - scaledH / 2,
      bottom: scaledH / 2 - sectionCy,
    };

    setZoom({
      // 정수 픽셀로 반올림 — 서브픽셀 위치로 인한 1px 씸/줄무늬 방지
      origin: {
        left: Math.round(sectionRect.left),
        top: Math.round(sectionRect.top),
        width: Math.round(sectionRect.width),
        height: Math.round(sectionRect.height),
      },
      scale,
      tx: vw / 2 - newFrameCx,
      ty: vh / 2 - newFrameCy,
      constraints,
    });
    setHintShown(false);
  };

  const handleClose = () => setZoom(null);

  return (
    <>
      {frames.map((f) => (
        <button
          key={f.id}
          onPointerDown={DEBUG ? (e) => handlePointerDown(e, f.id, 'move') : undefined}
          onClick={DEBUG ? undefined : (e) => handleOpen(e, f.id)}
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
            src={f.src}
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
          style={{ left: '50%', top: '40%' }}
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

      <AnimatePresence>
        {zoom && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/75 overflow-hidden cursor-zoom-out"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
          >
            <motion.div
              style={{
                position: 'absolute',
                left: zoom.origin.left,
                top: zoom.origin.top,
                width: zoom.origin.width,
                height: zoom.origin.height,
                touchAction: 'none',
              }}
              initial={{ scale: 1, x: 0, y: 0 }}
              animate={{ scale: zoom.scale, x: zoom.tx, y: zoom.ty }}
              exit={{ scale: 1, x: 0, y: 0 }}
              // 부드럽고 여유 있는 이징 (약 0.7s) — 감속형 커브로 끝에서 자연스럽게 안착
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              drag
              dragConstraints={zoom.constraints}
              dragElastic={0.15}
              dragTransition={{ power: 0.18, timeConstant: 200 }}
              whileDrag={{ cursor: 'grabbing' }}
              className="cursor-grab"
              onClick={(e) => e.stopPropagation()}
            >
              {/* mainImage — <img> 대신 background-image 사용: 큰 텍스처 타일 경계 씸 방지 */}
              <div
                aria-hidden
                className="absolute inset-0 select-none"
                style={{
                  backgroundImage: "url('/images/frames/mainImage.jpg')",
                  backgroundSize: '100% 100%',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                }}
              />
              {frames.map((f) => (
                <img
                  key={f.id}
                  src={f.src}
                  alt=""
                  draggable={false}
                  className="absolute object-cover select-none"
                  style={{
                    left: `${f.x}%`,
                    top: `${f.y}%`,
                    width: `${f.w}%`,
                    // 실제 섹션과 동일한 사이즈 규칙 (h 있으면 사용, 없으면 0.85 비율)
                    ...(f.h !== undefined ? { height: `${f.h}%` } : { aspectRatio: '0.85' }),
                  }}
                />
              ))}
            </motion.div>

            <button
              onClick={handleClose}
              className="absolute top-4 left-4 z-10 font-jua text-white text-sm md:text-base px-3.5 py-1.5 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-colors"
            >
              « 돌아가기
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
