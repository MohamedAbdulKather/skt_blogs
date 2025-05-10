'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
        {/* Desktop header with blog name */}
        <div className="hidden md:flex justify-center py-8">
          <h1 className="text-4xl md:text-5xl font-serif text-gray-800 tracking-wider">
            SITHAI THULIGAL
          </h1>
        </div>
        
        <div className="border-t border-gray-200">
          {/* Desktop menu */}
          <div className="hidden md:flex justify-center space-x-16 py-4 text-gray-700">
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
          
          {/* Mobile menu button - enlarged and centered */}
          <div className="md:hidden flex items-center justify-between py-4">
            <div className="flex-1">
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
            </div>
            
            
            {/* Empty div to balance the layout */}
            <div className="flex-1"></div>
          </div>
          
          {/* Mobile menu dropdown */}
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
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;