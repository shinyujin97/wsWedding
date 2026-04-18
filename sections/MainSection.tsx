'use client';
import { motion } from 'framer-motion';

export default function MainSection() {
  return (
    <section className="relative w-full">
      {/* 메인 이미지 */}
      <img
        src="/images/frames/mainImage.png"
        alt="우리, 결혼합니다"
        className="w-full h-auto"
      />

      {/* 상단 텍스트 */}
      <motion.div
        className="absolute top-[4vh] left-0 right-0 text-center z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <p
          className="text-2xl tracking-[0.12em] font-light"
          style={{
            color: '#FBF5E6',
            fontFamily: 'serif',
            textShadow: '0 2px 10px rgba(74,30,15,0.85), 0 0 20px rgba(74,30,15,0.4)',
          }}
        >
          우리, 결혼합니다
        </p>
        <p
          className="text-xs tracking-[0.2em] mt-3 font-medium"
          style={{
            color: '#FBF5E6',
            textShadow: '0 1px 8px rgba(74,30,15,0.95), 0 0 14px rgba(74,30,15,0.6)',
          }}
        >
          2026. 09. 20. SAT | 2:00 PM
        </p>
      </motion.div>

      {/* 하단 텍스트 */}
      <motion.div
        className="absolute bottom-[1.5vh] left-0 right-0 text-center z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
      >
        <p
          className="text-lg tracking-[0.15em] font-light"
          style={{
            color: '#FBF5E6',
            fontFamily: 'serif',
            textShadow: '0 2px 8px rgba(74,30,15,0.85), 0 0 16px rgba(74,30,15,0.4)',
          }}
        >
          우진 &amp; 선영
        </p>
        <p
          className="text-[11px] tracking-[0.15em] mt-2"
          style={{
            color: '#F3E5C5',
            textShadow: '0 1px 5px rgba(74,30,15,0.8)',
          }}
        >
          VENUE: 더 그레이스 웨딩홀
        </p>
      </motion.div>
    </section>
  );
}
