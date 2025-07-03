// src/app/collections/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Collections - Delhiwala Halwai',
  description: 'Browse all collections of sweets, namkeen, bhaji boxes, and more at Delhiwala Halwai.',
  openGraph: {
    title: 'Collections - DWH',
    description: 'Explore our curated collections of Indian sweets, namkeen, and bhaji boxes. Freshly made, delivered to your doorstep.',
    images: [
      {
        url: '/main.png', // Must be in /public folder
        width: 1200,
        height: 630,
        alt: 'Delhiwala Halwai Collections',
      },
    ],
  },
};

// ✅ REQUIRED: Default layout component
export default function CollectionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
