'use client';
import { useEffect, useRef } from 'react';
import Script from 'next/script';

declare global {
  interface Window { kakao: any; }
}

const VENUE_ADDRESS = '서울 강남구 봉은사로 302';
const PARKING_QUERY = encodeURIComponent('서울시 강남구 논현동 237-12');

// 서울 교통 노선 색상
const SUBWAY = [
  {
    lines: [
      { name: '9호선', color: '#AA8C3F', text: '#FFFFFF' },
      { name: '수인분당선', color: '#F2A900', text: '#FFFFFF' },
    ],
    desc: '선정릉역 4번 출구 도보 5분',
  },
  {
    lines: [{ name: '9호선', color: '#AA8C3F', text: '#FFFFFF' }],
    desc: '언주역 5번 출구 도보 5분',
  },
];

const BUS = [
  {
    name: '아크로힐스논현 (구 경복아파트)',
    routes: [
      { type: '마을', color: '#5BAE3A', nums: ['23-138', '23-273'] },
      { type: '지선', color: '#3CB44A', nums: ['3412', '6411'] },
    ],
  },
  {
    name: '스포월드 · 라움아트센터 (구 경복아파트)',
    routes: [
      { type: '마을', color: '#5BAE3A', nums: ['23-271', '23-272'] },
      { type: '간선', color: '#3E5BA9', nums: ['141', '242'] },
    ],
  },
];

// 노선/버스 종류 컬러 배지 (알약형)
function LineBadge({ label, bg, fg }: { label: string; bg: string; fg: string }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-[13px] md:text-[15px] font-bold leading-none whitespace-nowrap"
      style={{ backgroundColor: bg, color: fg }}
    >
      {label}
    </span>
  );
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

      // 지오코딩 실패/지연에도 지도가 항상 보이도록 폴백 좌표(선정릉역 인근)로 먼저 생성한다.
      const fallback = new window.kakao.maps.LatLng(37.5086, 127.0430);
      const map = new window.kakao.maps.Map(mapRef.current, { center: fallback, level: 3 });
      const marker = new window.kakao.maps.Marker({ map, position: fallback });

      // 실제 좌표는 주소 지오코딩으로 산출해 보정한다.
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(VENUE_ADDRESS, (result: any, status: any) => {
        if (cancelled) return;
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
          map.setCenter(coords);
          marker.setPosition(coords);
        }
      });
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

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(VENUE_ADDRESS);
      alert('주소가 복사되었습니다!');
    } catch {
      alert('주소 복사에 실패했습니다.');
    }
  };

  return (
    <>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false&libraries=services`}
        strategy="afterInteractive"
      />
      <section className="px-6 md:px-12 py-12 md:py-16 bg-[#FDFAF5]">
        <p className="text-xs md:text-sm tracking-widest text-stone-500 text-center mb-6 md:mb-8 uppercase">Location</p>
        <div
          ref={mapRef}
          className="w-full h-64 md:h-96 rounded-2xl overflow-hidden mx-auto"
        />

        {/* 오시는 길 */}
        <div className="mt-8 md:mt-10 divide-y divide-dashed divide-stone-200/70 text-stone-700">

          {/* 그룹1 — 예식장 */}
          <div className="space-y-2 py-6 first:pt-0">
            <div className="flex items-center gap-2 mb-1">
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#44403c" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10Z" />
                <circle cx="12" cy="11" r="2.2" />
              </svg>
              <span className="text-lg md:text-xl font-bold text-stone-800">예식장</span>
            </div>
            <p className="text-base md:text-lg text-stone-800 font-medium" style={{ fontFamily: 'serif' }}>
              아르베웨딩
            </p>
            <p className="text-sm text-stone-700">서울 강남구 봉은사로 302</p>
            <a href="tel:025647031" className="text-sm text-stone-700 inline-block underline-offset-2">02-564-7031</a>
            <div>
              <button
                onClick={handleCopyAddress}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-xs text-stone-600 active:scale-[0.98] transition-transform"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                주소 복사
              </button>
            </div>
          </div>

          {/* 그룹2 — 주차 */}
          <div className="space-y-2 py-6">
            <div className="flex items-center gap-2 mb-1">
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#44403c" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <path d="M10 16.5V7.5h3.2a2.7 2.7 0 0 1 0 5.4H10" />
              </svg>
              <span className="text-lg md:text-xl font-bold text-stone-800">주차</span>
            </div>
            <p className="text-sm text-stone-700 font-medium">네비게이션 주차장 주소</p>
            <p className="text-sm text-stone-700">서울시 강남구 논현동 237-12</p>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <a
                href={`https://map.naver.com/p/search/${PARKING_QUERY}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center py-3 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-600 active:scale-[0.98] transition-transform"
              >
                네이버지도
              </a>
              <a
                href={`https://map.kakao.com/?q=${PARKING_QUERY}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center py-3 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-600 active:scale-[0.98] transition-transform"
              >
                카카오내비
              </a>
              <a
                href={`tmap://search?name=${PARKING_QUERY}`}
                className="flex flex-col items-center py-3 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-600 active:scale-[0.98] transition-transform"
              >
                T맵
              </a>
            </div>
            <p className="text-sm text-stone-800 font-medium mt-2 text-center">주차는 2시간 무료입니다.</p>
          </div>

          {/* 그룹3 — 지하철 (호선 컬러 배지) */}
          <div className="space-y-4 py-6">
            <div className="flex items-center gap-2 mb-1">
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#44403c" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="6" y="3" width="12" height="13" rx="3" />
                <path d="M6 11h12" />
                <path d="M9 19l-1.5 2M15 19l1.5 2" />
                <circle cx="9.2" cy="13.4" r="0.7" fill="#44403c" stroke="none" />
                <circle cx="14.8" cy="13.4" r="0.7" fill="#44403c" stroke="none" />
              </svg>
              <span className="text-lg md:text-xl font-bold text-stone-800">지하철</span>
            </div>
            {SUBWAY.map((item) => (
              <div key={item.desc} className="flex items-center gap-2">
                <span className="flex shrink-0 gap-1.5">
                  {item.lines.map((ln) => (
                    <LineBadge key={ln.name} label={ln.name} bg={ln.color} fg={ln.text} />
                  ))}
                </span>
                <span className="text-[13px] md:text-base text-stone-700 leading-6 whitespace-nowrap">{item.desc}</span>
              </div>
            ))}
          </div>

          {/* 그룹4 — 버스 (간선/지선/마을 컬러 배지) */}
          <div className="space-y-4 py-6">
            <div className="flex items-center gap-2 mb-1">
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#44403c" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="4" y="4" width="16" height="12" rx="2.5" />
                <path d="M4 11h16" />
                <path d="M7 16v2.5M17 16v2.5" />
                <circle cx="8" cy="13.5" r="0.7" fill="#44403c" stroke="none" />
                <circle cx="16" cy="13.5" r="0.7" fill="#44403c" stroke="none" />
              </svg>
              <span className="text-lg md:text-xl font-bold text-stone-800">버스</span>
            </div>
            {BUS.map((stop) => (
              <div key={stop.name} className="space-y-2.5">
                <p className="text-[15px] md:text-base text-stone-800 font-semibold">{stop.name}</p>
                <div className="space-y-2.5">
                  {stop.routes.map((r) => (
                    <div key={r.type} className="flex items-center gap-2.5">
                      <LineBadge label={r.type} bg={r.color} fg="#FFFFFF" />
                      <span className="text-[15px] md:text-base text-stone-700">{r.nums.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-xs md:text-sm text-rose-500 text-center mt-4 leading-6">
              ※ 주차 혼잡이 예상되오니 가급적 대중교통 이용 부탁 드립니다.
            </p>
          </div>

        </div>
      </section>
    </>
  );
}
