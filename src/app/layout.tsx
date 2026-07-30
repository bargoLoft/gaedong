import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '개동췤 — 비영리 개인정보 동의서 자동 생성',
  description:
    '복지급여 신청 PDF를 업로드하면 AI 에이전트가 개인정보보호법 준수 동의서를 자동 생성하고 법적 위험을 감사합니다.',
  keywords: [
    '개인정보보호법',
    '동의서',
    '복지급여',
    '개인정보 동의서',
    '비영리',
    '사회복지',
  ],
  authors: [{ name: '개동췤 팀' }],
  openGraph: {
    title: '개동췤 — 비영리 개인정보 컴플라이언스',
    description: 'AI 멀티에이전트 기반 비영리 사회복지 개인정보 컴플라이언스 도구.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <head>
        {/* Pretendard Variable — optimized for Korean text */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className={`${inter.variable} antialiased hero-gradient min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
