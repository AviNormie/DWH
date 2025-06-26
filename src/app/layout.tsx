// app/layout.js
import "./globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import QueryProvider from '@/providers/QueryProvider';
import ClientProviders from "./ClientProviders";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from 'sonner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <title>DWH</title>
        <meta name="description" content="Halwai shop" />
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
