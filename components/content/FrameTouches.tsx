'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================================
// DEBUG 모드: true 일 때 박스를 드래그/리사이즈해서 위치 조정 가능
// 화면 우측 하단 "좌표 복사" 버튼 눌러서 FRAMES 배열에 붙여넣기
// 완료되면 DEBUG = false 로 바꾸면 원래 기능(터치 → 줌)으로 복귀
// ==========================================================
const DEBUG = false;

// mainImage.png 위 9개 액자 위치 (%) — x/y는 좌상단, w는 이미지 폭 대비 %
const INITIAL_FRAMES = [
  { id: 1,  x: 14.5, y: 35.9, w: 9.4 },
  { id: 3,  x: 6.4,  y: 49.1, w: 12.8 },
  { id: 4,  x: 19.8, y: 42.9, w: 12.2 },
  { id: 5,  x: 38.8, y: 42.2, w: 13.6 },
  { id: 6,  x: 28.4, y: 52.9, w: 12.1 },
  { id: 8,  x: 58.5, y: 40.9, w: 13.1 },
  { id: 9,  x: 66,   y: 50.9, w: 14.1 },
  { id: 10, x: 72.9, y: 41.1, w: 11.2 },
  { id: 11, x: 82.1, y: 45.2, w: 13.7 },
];

type Frame = { id: number; x: number; y: number; w: number };

type Zoom = {
  id: number;
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

  const HINT_FRAME_ID = 1;

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

    let moved = false;

    const move = (ev: PointerEvent) => {
      const dxPct = ((ev.clientX - startX) / sectionRect.width) * 100;
      const dyPct = ((ev.clientY - startY) / sectionRect.height) * 100;
      if (Math.abs(dxPct) > 0.1 || Math.abs(dyPct) > 0.1) moved = true;

      setFrames((prev) =>
        prev.map((f) => {
          if (f.id !== id) return f;
          if (mode === 'resize') {
            return { ...f, w: Math.max(3, +(startFw + dxPct).toFixed(1)) };
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
      // 드래그 없이 단순 클릭이었으면 zoom 오픈 시도
      if (!moved && !DEBUG) {
        // (DEBUG일 때는 zoom 자체를 막는다)
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const copyCoords = async () => {
    const text = frames
      .map((f) => `  { id: ${f.id}, x: ${f.x}, y: ${f.y}, w: ${f.w} },`)
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
  // 줌인 (프로덕션 동작)
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
      id,
      origin: {
        left: sectionRect.left,
        top: sectionRect.top,
        width: sectionRect.width,
        height: sectionRect.height,
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
          className={`absolute z-20 ${
            DEBUG
              ? 'bg-red-500/60 border-2 border-yellow-300 cursor-move touch-none select-none'
              : ''
          }`}
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            width: `${f.w}%`,
            aspectRatio: '0.85',
          }}
        >
          {DEBUG && (
            <>
              {/* 번호 */}
              <span className="absolute inset-0 flex items-center justify-center text-2xl md:text-3xl font-bold text-white drop-shadow-[0_0_3px_rgba(0,0,0,0.9)] pointer-events-none">
                {f.id}
              </span>
              {/* 현재 좌표 */}
              <span className="absolute -bottom-5 left-0 text-[9px] font-mono text-white bg-black/70 px-1 rounded whitespace-nowrap pointer-events-none">
                {f.x},{f.y} w{f.w}
              </span>
              {/* 리사이즈 핸들 (오른쪽 아래) */}
              <span
                onPointerDown={(e) => handlePointerDown(e as never, f.id, 'resize')}
                className="absolute -right-1.5 -bottom-1.5 w-3 h-3 bg-yellow-300 border border-black cursor-nwse-resize"
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
        <button
          onClick={copyCoords}
          className="fixed bottom-4 right-4 z-50 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-lg shadow-lg"
        >
          좌표 복사
        </button>
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
            <motion.img
              src="/images/frames/mainImage.png"
              alt=""
              draggable={false}
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
              transition={{ type: 'spring', damping: 28, stiffness: 160 }}
              drag
              dragConstraints={zoom.constraints}
              dragElastic={0.15}
              dragTransition={{ power: 0.18, timeConstant: 200 }}
              whileDrag={{ cursor: 'grabbing' }}
              className="cursor-grab"
              onClick={(e) => e.stopPropagation()}
            />

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
