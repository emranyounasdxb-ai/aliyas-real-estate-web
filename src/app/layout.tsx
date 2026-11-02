import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import 'lenis/dist/lenis.css';
import './globals.css';
import './brand.css';
import './future-home.css';
import './brand-pages.css';
import '@/components/header.css';
import '@/components/footer.css';
import './themes.css';
import './design-system.css';
import './rich-experience.css';
import './composition.css';
import './mobile-refinements.css';
import './home-refinements.css';
import './luxury-home.css';
import './editorial-system.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MotionProvider } from '@/components/motion-provider';

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const isPublic = !new URL(siteUrl).hostname.match(/^(localhost|127\.0\.0\.1)$/);
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Aliyas Real Estate | Exceptional Off-Plan Homes in the UAE',
    template: '%s | Aliyas Real Estate',
  },
  description:
    'Discover a considered collection of UAE off-plan homes. Explore projects, developers and inspiring places to live across Dubai, Abu Dhabi and Ras Al Khaimah.',
  openGraph: {
    type: 'website',
    locale: 'en_AE',
    siteName: 'Aliyas Real Estate',
    title: 'Aliyas Real Estate — A place for your next chapter',
    description: 'A considered collection of UAE off-plan homes.',
    images: [
      {
        url: '/images/aliyas-future-architecture.png',
        width: 1122,
        height: 1402,
        alt: 'Illustrative sculptural residential tower with pearlescent white terraces',
      },
    ],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: isPublic, follow: isPublic },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#202522' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={manrope.variable} data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{document.documentElement.dataset.theme=localStorage.getItem('aliyas-theme')==='dark'?'dark':'light'}catch(e){}",
          }}
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <div className="site-frame" id="site-top" tabIndex={-1}>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </div>
        <MotionProvider />
      </body>
    </html>
  );
}
