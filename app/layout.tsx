import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
