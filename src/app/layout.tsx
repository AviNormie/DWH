// src/app/layout.tsx
import "./globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import QueryProvider from '@/providers/QueryProvider';
import ClientProviders from "./ClientProviders";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from 'sonner';
import type { Metadata } from 'next';

// ✅ SEO metadata (auto injects into <head>)
export const metadata: Metadata = {
  title: {
    default: 'DWH - Delhi Wala Halwai',
    template: '%s | DWH'
  },
  description: 'Delhi Wala Halwai - Traditional Indian sweets and namkeen, made fresh with love.',
  keywords: ['DWH', 'Delhi Wala Halwai', 'Indian sweets', 'mithai', 'halwai', 'namkeen', 'sweet shop in Delhi'],
  metadataBase: new URL('https://www.delhiwalahalwai.com'),
  openGraph: {
    title: 'DWH - Delhi Wala Halwai',
    description: 'Serving happiness with every bite of our traditional sweets and snacks.',
    url: 'https://www.delhiwalahalwai.com',
    siteName: 'DWH',
    images: [
      {
        url: '/favicon.png',
        width: 800,
        height: 800,
        alt: 'DWH Logo'
      }
    ],
    locale: 'en_IN',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Delhi Wala Halwai',
    description: 'Explore our range of delicious sweets, snacks and more!',
    images: ['/favicon.png']
  },
  icons: {
    icon: '/favicon.png'
  },
  alternates: {
    canonical: 'https://www.delhiwalahalwai.com',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  themeColor: '#fff8e1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        {/* Structured Data for Organization */}
        <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Delhi Wala Halwai',
          url: 'https://www.delhiwalahalwai.com',
          logo: 'https://www.delhiwalahalwai.com/favicon.png',
          sameAs: [
            'https://www.facebook.com/delhiwalahalwai',
            'https://www.instagram.com/delhiwalahalwai/'
          ],
          contactPoint: [{
            '@type': 'ContactPoint',
            telephone: '+91-9034033999',
            contactType: 'customer service',
            areaServed: 'IN',
            availableLanguage: ['English', 'Hindi']
          }]
        }) }} />
      </head>
      <body>
        <QueryProvider>
          <ClientProviders>
            {children}
          </ClientProviders>
        </QueryProvider>
        <Toaster 
          position="top-right"
          richColors
          closeButton
          duration={3000}
        />
        <Analytics />
      </body>
    </html>
  );
}
