'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

export default function LenisScroller() {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        // Initialize Lenis smooth scrolling
        lenisRef.current = new Lenis({
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        });

        // Create a RAF loop to update Lenis
        function raf(time: number) {
            lenisRef.current?.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            // Cleanup
            lenisRef.current?.destroy();
        };
    }, []);

    return null; // This component doesn't render anything
}