import type { Metadata, Viewport } from 'next';
import { Archivo, IBM_Plex_Sans_Arabic, Instrument_Serif, Public_Sans } from 'next/font/google';
import { StoreProvider } from '@/context/StoreProvider';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BagSheet } from '@/components/BagSheet';
import { Toast } from '@/components/Toast';
import { Intro } from '@/components/Intro';
import { ScrollFx } from '@/components/ScrollFx';
import './globals.css';

const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo', display: 'swap' });
const plexAr = IBM_Plex_Sans_Arabic({ subsets: ['arabic'], weight: ['400', '500', '600'], variable: '--font-plex-ar', display: 'swap' });
const instrument = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-instrument', display: 'swap' });
const publicSans = Public_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-public', display: 'swap' });

// Non-empty only for the GitHub Pages preview (served under /<repo-name>).
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata: Metadata = {
  title: 'Fairuz Siam',
  description: 'Jewelry inspired by cultures, heritage and the beauty of forms repeated through time. Made by hand in Cairo.',
  icons: { icon: `${BASE}/brand/icon.png` },
};

// Brand marks are CSS masks; set their URLs here so they respect the base path.
const brandVars = {
  '--icon': `url(${BASE}/brand/icon.png)`,
  '--logo': `url(${BASE}/brand/logo.png)`,
} as React.CSSProperties;

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

// Apply the saved theme / language before first paint to avoid a flash,
// and decide whether the brand intro plays (once per session, never with reduced motion).
const bootScript = `try{var t=JSON.parse(localStorage.getItem('fs-theme')||'"system"');if(t!=='system')document.documentElement.setAttribute('data-theme',t);var l=JSON.parse(localStorage.getItem('fs-lang')||'"en"');document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr'}catch(e){}
try{var h=document.documentElement,seen=sessionStorage.getItem('fs-intro'),rm=matchMedia('(prefers-reduced-motion: reduce)').matches;if(!rm)h.classList.add('fx');if(seen||rm)h.classList.add('intro-skip');else{h.classList.add('intro-play');setTimeout(function(){h.classList.remove('intro-play','intro-fast')},7000)}}catch(e){document.documentElement.classList.add('intro-skip')}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning style={brandVars} className={`${archivo.variable} ${plexAr.variable} ${instrument.variable} ${publicSans.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <Intro />
        <StoreProvider>
          <Header />
          <main id="app">{children}</main>
          <Footer />
          <BagSheet />
          <Toast />
          <ScrollFx />
        </StoreProvider>
      </body>
    </html>
  );
}
