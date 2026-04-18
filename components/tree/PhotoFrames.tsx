'use client';
import { useState } from 'react';
import { motion, useTransform, AnimatePresence } from 'framer-motion';
import type { MotionValue } from 'framer-motion';

// 나무 위 액자 좌표 — tree.png(8.png) 기준 퍼센트
const FRAMES = [
  { id: 1, x: 10, y: 15, w: 22 },
  { id: 2, x: 55, y: 10, w: 20 },
  { id: 3, x: 72, y: 28, w: 18 },
  { id: 4, x: 30, y: 22, w: 20 },
  { id: 5, x: 48, y: 38, w: 19 },
];

interface Props {
  scrollProgress: MotionValue<number>;
}

export default function PhotoFrames({ scrollProgress }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <>
      {FRAMES.map((f, i) => {
        const start = 0.3 + i * 0.08;
        const end = start + 0.12;

        return (
          <FrameItem
            key={f.id}
            frame={f}
            scrollProgress={scrollProgress}
            start={start}
            end={end}
            onSelect={() => setSelected(f.id)}
          />
        );
      })}

      {/* 확대 모달 */}
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="bg-white rounded-2xl p-3 shadow-2xl"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-64 h-80 bg-[#F5EDE3] rounded-lg flex items-center justify-center">
                <p className="text-xs text-stone-300">사진 {selected}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// 개별 액자 — 스크롤에 따라 등장
function FrameItem({
  frame,
  scrollProgress,
  start,
  end,
  onSelect,
}: {
  frame: typeof FRAMES[number];
  scrollProgress: MotionValue<number>;
  start: number;
  end: number;
  onSelect: () => void;
}) {
  const opacity = useTransform(scrollProgress, [start, end], [0, 1]);
  const scale = useTransform(scrollProgress, [start, end], [0, 1]);

  return (
    <motion.div
      className="absolute rounded-lg overflow-hidden shadow-md cursor-pointer bg-white/80 border border-stone-200"
      style={{
        left: `${frame.x}%`,
        top: `${frame.y}%`,
        width: `${frame.w}%`,
        aspectRatio: '0.85',
        opacity,
        scale,
      }}
      whileHover={{ scale: 1.08, zIndex: 10 }}
      whileTap={{ scale: 0.95 }}
      onClick={onSelect}
    >
      <div className="w-full h-full bg-[#F5EDE3] flex items-center justify-center">
        <p className="text-[8px] text-stone-300">사진 {frame.id}</p>
      </div>
    </motion.div>
  );
}
