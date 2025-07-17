// app/ClientProviders.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "./context/CartContext";
import LenisScroller from "@/components/LenisScroller";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <LenisScroller />
        {children}
      </CartProvider>
    </SessionProvider>
  );
}
