import type { Metadata } from 'next';
import { Gowun_Dodum, Jua, Cormorant_Garamond } from 'next/font/google';
import './globals.css';

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
  title: '신우진 ♥ 박선영 결혼합니다',
  description: '2025년 봄, 두 사람의 이야기에 함께해 주세요',
  openGraph: {
    title: '신우진 ♥ 박선영 결혼합니다',
    description: '2025년 봄, 두 사람의 이야기에 함께해 주세요',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
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
