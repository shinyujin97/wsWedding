'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// endstart.png 위 액자 클릭 영역 좌표 (이미지 기준 % 위치)
// 나중에 실제 사진으로 교체 가능
const FRAMES = [
  { id: 1,  x: 18, y: 17, w: 14, h: 8,  src: '/samples/17569275c1db7253fea6a7bc7ce1bed9.jpg' },
  { id: 2,  x: 34, y: 14, w: 12, h: 7,  src: '/samples/23cfca7f556b3d3bfe64f4610ba05239.jpg' },
  { id: 3,  x: 44, y: 11, w: 14, h: 8,  src: '/samples/30ab90ffe71db4ff225f78de6fedd7c3.jpg' },
  { id: 4,  x: 66, y: 11, w: 15, h: 9,  src: '/samples/370e1fbdb9be7063095cff5ac0876f3e.jpg' },
  { id: 5,  x: 10, y: 33, w: 15, h: 10, src: '/samples/3e3de292a0e3a036d73e71c74e1d04df.jpg' },
  { id: 6,  x: 30, y: 28, w: 14, h: 9,  src: '/samples/a82089727bcf239995b5d00c969607b9.jpg' },
  { id: 7,  x: 68, y: 23, w: 15, h: 10, src: '/samples/deda36c124fd2fbd90d4ebbf819e053c.jpg' },
  { id: 8,  x: 8,  y: 45, w: 14, h: 9,  src: '/samples/e6f80262838f708923ffb7825ca947f2.jpg' },
  { id: 9,  x: 50, y: 36, w: 14, h: 9,  src: '/samples/ea70db04c6ebe4fe0a8758a6b118d062.jpg' },
  { id: 10, x: 64, y: 41, w: 15, h: 10, src: '/samples/f4d9f6ea6ad0a305ce5bb827d6689ddd.jpg' },
];

export default function MainSection() {
  const [selectedSrc, setSelectedSrc] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const handleFrameClick = (src: string) => {
    setSelectedSrc(src);
    setTouched(true);
  };

  return (
    <section className="relative w-full">
      {/* 메인 이미지 */}
      <img
        src="/images/frames/endstart.png"
        alt="우리, 결혼합니다"
        className="w-full h-auto"
      />

      {/* 액자 미리보기 + 클릭 */}
      {FRAMES.map((f) => (
        <button
          key={f.id}
          onClick={() => handleFrameClick(f.src)}
          className="absolute cursor-pointer overflow-hidden rounded-sm"
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            width: `${f.w}%`,
            height: `${f.h}%`,
          }}
          aria-label={`사진 ${f.id}`}
        />
      ))}

      {/* 상단 텍스트 */}
      <motion.div
        className="absolute top-[4vh] left-0 right-0 text-center z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <p
          className="text-stone-700 text-2xl tracking-[0.12em] font-light"
          style={{ fontFamily: 'serif', textShadow: '0 1px 12px rgba(253,250,245,0.9)' }}
        >
          우리, 결혼합니다
        </p>
        <p
          className="text-stone-400 text-xs tracking-[0.2em] mt-3"
          style={{ textShadow: '0 1px 8px rgba(253,250,245,0.8)' }}
        >
          2026. 09. 20. SAT | 2:00 PM
        </p>
      </motion.div>

      {/* 하단 텍스트 */}
      <motion.div
        className="absolute bottom-[5vh] left-0 right-0 text-center z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
      >
        <p
          className="text-stone-600 text-lg tracking-[0.15em] font-light"
          style={{ fontFamily: 'serif', textShadow: '0 1px 10px rgba(253,250,245,0.9)' }}
        >
          우진 &amp; 선영
        </p>
        <p
          className="text-stone-400 text-[11px] tracking-[0.15em] mt-2"
          style={{ textShadow: '0 1px 6px rgba(253,250,245,0.7)' }}
        >
          VENUE: 더 그레이스 웨딩홀
        </p>
      </motion.div>

      {/* 액자 클릭 안내 — 한 번 터치하면 사라짐 */}
      {!touched && <motion.div
        className="absolute z-20 flex items-center gap-1 pointer-events-none"
        style={{ left: '70%', top: '30%' }}
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: [0, 1, 1, 0], x: [-6, 0, 0, -6] }}
        transition={{ duration: 2.5, delay: 1.5, repeat: Infinity, repeatDelay: 3 }}
      >
        <span
          className="text-xs font-bold px-2 py-1 rounded-full"
          style={{
            color: '#fff',
            background: 'rgba(255, 100, 50, 0.85)',
            textShadow: '0 0 8px rgba(255,100,50,0.8)',
            boxShadow: '0 0 12px rgba(255,100,50,0.5)',
          }}
        >
          ◀ 액자를 터치!
        </span>
      </motion.div>}

      {/* 확대 모달 */}
      <AnimatePresence>
        {selectedSrc && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedSrc(null)}
          >
            <motion.img
              src={selectedSrc}
              alt="사진"
              className="max-w-[85vw] max-h-[80vh] rounded-2xl shadow-2xl object-contain"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
