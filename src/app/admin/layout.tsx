export const metadata = {
  title: 'Admin - Delhiwala Halwai',
  description: 'Admin dashboard for managing sweets, namkeen, bhaji boxes, and orders at Delhiwala Halwai.',
  openGraph: {
    title: 'Admin Dashboard - DWH',
    description: 'Access the admin panel to manage products, orders, and more at Delhiwala Halwai.',
    images: [
      {
        url: '/delwh.png', // Using an image from the public folder
        width: 1200,
        height: 630,
        alt: 'Delhiwala Halwai Admin',
      },
    ],
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
