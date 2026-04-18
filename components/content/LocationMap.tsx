'use client';
import { useRef } from 'react';
import Script from 'next/script';

declare global {
  interface Window { kakao: any; }
}

export default function LocationMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  const initMap = () => {
    if (!window.kakao || !mapRef.current) return;
    const coords = new window.kakao.maps.LatLng(37.5043488, 127.0291844);
    const map = new window.kakao.maps.Map(mapRef.current, {
      center: coords,
      level: 3,
    });
    new window.kakao.maps.Marker({ map, position: coords });
  };

  return (
    <>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
        onLoad={() => window.kakao.maps.load(initMap)}
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
