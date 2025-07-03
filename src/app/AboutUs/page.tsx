import React from 'react'
import AboutUs from '@/components/AboutUs'

export const metadata = {
  title: 'About Us - Delhiwala Halwai',
  description: 'Learn more about Delhiwala Halwai, our tradition, values, and the story behind our delicious sweets and snacks.',
  openGraph: {
    title: 'About Us - Delhiwala Halwai',
    description: 'Discover the legacy and passion behind Delhiwala Halwai, serving authentic Indian sweets and namkeen.',
    images: [
      {
        url: '/delwh.png', // Using an image from the public folder
        width: 1200,
        height: 630,
        alt: 'Delhiwala Halwai Storefront',
      },
    ],
  },
};

const page = () => {
  return (
    <div>
      <AboutUs />
    </div>
  )
}

export default page