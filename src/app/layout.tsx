import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import SmoothScroll from '@/providers/SmoothScroll';
import { beaumonte, brand } from '@/content';
import './globals.css';

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
});

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000'),
  title: `${beaumonte.name} ${beaumonte.tower} · ${brand.name}`,
  description: `${beaumonte.tagline} ${beaumonte.philosophy}`,
  openGraph: {
    title: `${beaumonte.name} ${beaumonte.tower} · ${brand.name}`,
    description: beaumonte.tagline,
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0b0b0c',
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable} antialiased`}>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
