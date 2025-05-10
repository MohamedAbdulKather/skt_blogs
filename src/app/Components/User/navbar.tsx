'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={`w-full ${scrolled ? 'bg-white shadow-md' : 'bg-white'} transition-all duration-300 ease-in-out top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop header with blog logo */}
        <div className="hidden md:flex justify-center py-4">
          <Link href="/">
            <div className="relative h-20 w-96">
              <Image 
                src="/image/navbar.jpg" 
                alt="சித்தை துளிகள் - Sithai Thuligal" 
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
          </Link>
        </div>
        
        <div className="border-t border-gray-200">
          {/* Desktop menu with Add Blog button in right corner */}
          <div className="hidden md:flex items-center py-4 text-gray-700">
            <div className="flex-1 flex justify-center space-x-12">
              <Link href="/">
                <span className="text-gray-700 hover:text-gray-900 px-3 py-2 font-medium">Home</span>
              </Link>
              <Link href="/dashboard">
                <span className="text-gray-700 hover:text-gray-900 px-3 py-2 font-medium">Categories</span>
              </Link>
              <Link href="/contactus">
                <span className="text-gray-700 hover:text-gray-900 px-3 py-2 font-medium">Contact Us</span>
              </Link>
            </div>
            
            {/* Add Blog button positioned at right */}
            <div className="flex-none">
              <Link href="/add-blog">
                <span className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Blog
                </span>
              </Link>
            </div>
          </div>
          
          {/* Mobile view with logo and menu button */}
          <div className="md:hidden flex items-center justify-between py-4">
            {/* Menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="h-8 w-8" 
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Empty div to balance the layout */}
            <div className="w-8"></div>
          </div>
          
          {/* Mobile menu dropdown with Add Blog entry */}
          {isMenuOpen && (
            <div className="md:hidden bg-white pt-2 pb-4">
              <div className="flex flex-col items-center space-y-4">
                <Link href="/">
                  <span className="text-gray-700 hover:text-gray-900 px-4 py-2 font-medium block">Home</span>
                </Link>
                <Link href="/dashboard">
                  <span className="text-gray-700 hover:text-gray-900 px-4 py-2 font-medium block">Categories</span>
                </Link>
                <Link href="/contactus">
                  <span className="text-gray-700 hover:text-gray-900 px-4 py-2 font-medium block">Contact Us</span>
                </Link>
                <Link href="/add-blog">
                  <span className="text-blue-600 hover:text-blue-800 px-4 py-2 font-medium flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Blog
                  </span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;