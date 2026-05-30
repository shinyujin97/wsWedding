import type { Metadata } from 'next';
import { Gowun_Dodum, Jua, Cormorant_Garamond } from 'next/font/google';
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
    <html lang="ko" className={`${gowunDodum.variable} ${jua.variable} ${cormorant.variable}`}>
      <body className="font-gowun">{children}</body>
    </html>
  );
}
