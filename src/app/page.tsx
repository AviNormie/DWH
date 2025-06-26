"use client";

import { useSession } from "next-auth/react";
import React from "react";
import Navbar from "@/components/Navbar";
import Carousel from "../components/Carousel";
import LatestProduct from "@/components/LatestSweet";
import PopularProduct from "@/components/PopularProduct";
import InteractiveMap from '@/components/InteractiveMap';
import LatestNamkeen from "@/components/LatestNamkeen";
import FloatingEnquiryButton from "@/components/FloatingEnquiryButton";
import About from "@/components/About";
import BhajiCarousel from "@/components/BhajiCarousel";


export default function Home() {
  const { status } = useSession();

  if (status === "loading")
        return (
          <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white mt-16 py-12">
          <Navbar />
          <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-orange-600 font-medium">Loading...</p>
            </div>
          </div>
        </div>
        
        );

  return (
    <>
      <div className="bg-gradient-to-br from-pink-50 via-orange-50 to-red-50">
        <Navbar />
        <div className="mt-35">
          <Carousel />
        </div>

        <section className="max-w-7xl mx-auto px-4 py-8">
          <LatestProduct />
          <LatestNamkeen />
        </section>

        <section className="max-w-7xl mx-auto px-4 py-8">
          <PopularProduct />
        </section>
        <section className="max-w-7xl mx-auto px-4 py-8">
          <BhajiCarousel/>
        </section>
        
        
        <section className="max-w-7xl mx-auto px-4 py-8"> 
          <InteractiveMap /> 
          <About />
        </section>
        
       
      </div>

      {/* Floating Enquiry Button */}
      <FloatingEnquiryButton />
    </>
  );
}