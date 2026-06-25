'use client';
import { useEffect, useRef } from 'react';
import Script from 'next/script';

declare global {
  interface Window { kakao: any; }
}

export default function LocationMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  // SDK 준비 여부를 직접 폴링해 "마운트될 때마다" 확실히 초기화한다.
  // (next/script의 onLoad는 스크립트가 새로 로드될 때만 불려서, 캐시/재마운트 시
  //  맵이 안 뜨는 간헐 버그가 있었음 — 영상 다시보기 후 등)
  useEffect(() => {
    let cancelled = false;
    let tries = 0;

    const init = () => {
      if (cancelled || !mapRef.current || !window.kakao?.maps) return;
      const coords = new window.kakao.maps.LatLng(37.5043488, 127.0291844);
      const map = new window.kakao.maps.Map(mapRef.current, { center: coords, level: 3 });
      new window.kakao.maps.Marker({ map, position: coords });
    };

    const id = setInterval(() => {
      tries += 1;
      if (window.kakao?.maps) {
        clearInterval(id);
        window.kakao.maps.load(init); // autoload=false 이므로 maps 모듈 로드 후 init
      } else if (tries > 100) {
        clearInterval(id); // ~10초 후 포기 (SDK 로드 실패 방지용 안전장치)
      }
    }, 100);

    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return (
    <>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
        strategy="afterInteractive"
      />
      <section className="px-6 md:px-12 py-12 md:py-16">
        <p className="text-xs md:text-sm tracking-widest text-stone-400 text-center mb-6 md:mb-8">LOCATION</p>
        <div
          ref={mapRef}
          className="w-full h-64 md:h-96 rounded-2xl overflow-hidden mx-auto"
        />
      </section>
    </>
  );
}
