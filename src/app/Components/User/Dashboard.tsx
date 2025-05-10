'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function ImagePage() {
    const [windowWidth, setWindowWidth] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Set initial width and check if mobile
        setWindowWidth(window.innerWidth);
        setIsMobile(window.innerWidth < 768); // 768px is standard md breakpoint

        // Update width on resize
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="relative w-full">
            {/* Full width image container with no padding */}
            <div className="w-full">
                {/* Responsive image container with no rounded corners or extra padding */}
                <div className="relative w-full h-auto overflow-hidden">
                    {/* For larger screens, use the Image component with priority and sizes */}
                    {windowWidth > 0 && (
                        <Image
                            src="/image/dash1.jpg"
                            alt="Camping scene with tent and mountain view at sunset"
                            width={1950}
                            height={1000}
                            priority={true}
                            className="w-full h-auto object-cover"
                            sizes="100vw"
                        />
                    )}

                    {/* Fallback for initial render or if Image component fails */}
                    {windowWidth === 0 && (
                        <div className="w-full pt-[56.25%] bg-gray-200"></div>
                    )}
                </div>

                {/* Mobile-only logo image instead of text */}
                {isMobile && (
                    <div className="md:hidden w-full bg-white py-4 text-center border-t border-gray-200">
                        <div className="relative h-16 w-55 mx-auto">
                            <Image 
                                src="/image/navbar.jpg" 
                                alt="சித்தை துளிகள் - Sithai Thuligal" 
                                fill
                                style={{ objectFit: 'contain' }}
                                priority
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}