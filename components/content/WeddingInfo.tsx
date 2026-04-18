'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function WeddingInfo() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.info-card', {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 80%',
        },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="px-6 py-16 space-y-10">
      {/* 인사말 */}
      <div className="info-card text-center space-y-3">
        <p className="text-xs tracking-widest text-stone-400 mb-4">INVITATION</p>
        <p className="text-sm leading-7 text-stone-600">
          서로 다른 길을 걸어온 두 사람이<br />
          이제 같은 길을 함께 걸어가려 합니다.<br />
          <br />
          저희의 새로운 시작을<br />
          축복해 주시면 감사하겠습니다.
        </p>
      </div>

      {/* 신랑 · 신부 */}
      <div className="info-card text-center space-y-2">
        <p className="text-sm text-stone-500">
          <span className="text-stone-700 font-medium">OOO</span> · <span className="text-stone-400">OOO</span>의 장남 <span className="text-stone-800 font-semibold">우진</span>
        </p>
        <p className="text-sm text-stone-500">
          <span className="text-stone-700 font-medium">OOO</span> · <span className="text-stone-400">OOO</span>의 차녀 <span className="text-stone-800 font-semibold">선영</span>
        </p>
      </div>

      {/* 날짜 */}
      <div className="info-card text-center">
        <p className="text-xs tracking-widest text-stone-400 mb-2">DATE</p>
        <p className="text-lg font-medium text-stone-700">2025년 9월 20일 토요일</p>
        <p className="text-sm text-stone-400">오후 2시 00분</p>
      </div>

      {/* 장소 */}
      <div className="info-card text-center">
        <p className="text-xs tracking-widest text-stone-400 mb-2">VENUE</p>
        <p className="text-lg font-medium text-stone-700">더 그레이스 웨딩홀</p>
        <p className="text-sm text-stone-400">서울특별시 강남구 테헤란로 123</p>
        <p className="text-xs text-stone-300 mt-1">3층 그랜드볼룸</p>
      </div>

      {/* D-day 캘린더 */}
      <div className="info-card">
        <p className="text-xs tracking-widest text-stone-400 text-center mb-4">SEPTEMBER 2025</p>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {['일','월','화','수','목','금','토'].map(d => (
            <span key={d} className={`py-1 font-medium ${d === '일' ? 'text-rose-400' : d === '토' ? 'text-blue-400' : 'text-stone-400'}`}>
              {d}
            </span>
          ))}
          {/* 9월 1일 = 월요일, 빈칸 1개 */}
          <span />
          {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
            <span
              key={day}
              className={`py-1 rounded-full text-xs ${
                day === 20
                  ? 'bg-stone-700 text-white font-bold'
                  : (day + 1) % 7 === 0
                    ? 'text-rose-300'
                    : day % 7 === 0
                      ? 'text-blue-300'
                      : 'text-stone-500'
              }`}
            >
              {day}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
