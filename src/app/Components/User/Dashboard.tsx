
'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function ImagePage() {
    const [windowWidth, setWindowWidth] = useState(0);

    useEffect(() => {
        // Set initial width
        setWindowWidth(window.innerWidth);

        // Update width on resize
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="relative w-full">
            {/* Using a container with padding to ensure the image doesn't touch the edges on mobile */}
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-3">
                {/* Responsive image container with aspect ratio */}
                <div className="relative w-full h-auto overflow-hidden rounded-lg shadow-lg">
                    {/* For larger screens, use the Image component with priority and sizes */}
                    {windowWidth > 0 && (
                        <Image
                            src="/image/dash.jpg"
                            alt="Camping scene with tent and mountain view at sunset"
                            width={1920}
                            height={1080}
                            priority={true}
                            className="w-full h-auto object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
                        />
                    )}

                    {/* Fallback for initial render or if Image component fails */}
                    {windowWidth === 0 && (
                        <div className="w-full pt-[56.25%] bg-gray-200"></div>
                    )}
                </div>

            </div>
        </div>
    );
}