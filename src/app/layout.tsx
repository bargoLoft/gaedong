import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ConSentient — AI-Powered Privacy Compliance OS for Non-Profits',
  description:
    'Transform complex welfare PDFs into legally verified personal data consent forms in seconds. ConSentient uses a multi-agent AI pipeline to ensure full compliance with the Korean Personal Information Protection Act.',
  keywords: [
    'personal data consent',
    'privacy compliance',
    'non-profit',
    'social welfare',
    'PIPA',
    '개인정보보호법',
    '동의서',
    '복지급여',
  ],
  authors: [{ name: 'ConSentient Team' }],
  openGraph: {
    title: 'ConSentient — AI-Powered Privacy Compliance OS',
    description: 'Multi-agent AI compliance OS for social welfare non-profits.',
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
