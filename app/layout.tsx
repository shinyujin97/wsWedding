import type { Metadata } from 'next';
import { Gowun_Dodum, Jua, Cormorant_Garamond, Playfair_Display, Fjalla_One } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { media } from '@/lib/media';

const gowunDodum = Gowun_Dodum({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-gowun',
});

const jua = Jua({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-jua',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-cormorant',
});
// 인트로 연도(2016~2026)용 — 고급 에디토리얼 세리프
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-playfair',
});
// 연도용 콘덴스드 디스플레이
const fjalla = Fjalla_One({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-fjalla',
});
// 인트로 연도 자막용 — 온글잎 밑미체 (손글씨, 무료 배포, 셀프호스팅)
// 폰트 바꿀 땐 src만 교체 (후보: KorailRoundGothicBold.woff2)
const captionFont = localFont({
  src: './fonts/Ownglyph_meetme-Rg.woff2',
  variable: '--font-caption',
});

export const metadata: Metadata = {
  // 배포 URL — 배포 후 실제 도메인으로 교체 (Vercel 기본은 *.vercel.app)
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: '신우진 ♥ 박선영 결혼합니다',
  description: '2025년 봄, 두 사람의 이야기에 함께해 주세요',
  // 개인정보(실명·장소)가 평문 노출되므로 검색엔진 인덱싱 차단
  robots: { index: false, follow: false },
  openGraph: {
    title: '신우진 ♥ 박선영 결혼합니다',
    description: '2025년 봄, 두 사람의 이야기에 함께해 주세요',
    images: [{
      url: media('/Thumbnail.jpg'),
      width: 1080,
      height: 1935,
    }],
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${gowunDodum.variable} ${jua.variable} ${cormorant.variable} ${playfair.variable} ${fjalla.variable} ${captionFont.variable}`}>
      <body className="font-gowun">{children}</body>
    </html>
  );
}
