'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from "next/image";


// Define types
interface Category {
  id: string;
  title: string;  // Changed from name to title to match API
  description: string;
}

interface BlogPost {
  slug: string;
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  categoryId: string;
  isVerified: boolean;
  createdAt: string;  // Changed to string since API returns ISO date string
}

export function ViewBlogPage() {
  const [, setRecentBlogs] = useState<BlogPost[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(8);

  // Detect screen size and set display count accordingly
  useEffect(() => {
    const handleResize = () => {
      // Use md breakpoint (768px) as the threshold
      if (window.innerWidth >= 768) {
        setDisplayCount(20); // Desktop/laptop
      } else {
        setDisplayCount(8); // Mobile
      }
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await fetch('http://localhost:4000/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const result = await response.json();
        if (result.success) {
          setCategories(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch categories');
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories");
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch blogs from API
  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoadingBlogs(true);
      try {
        const response = await fetch('http://localhost:4000/api/blogs');
        if (!response.ok) {
          throw new Error('Failed to fetch blogs');
        }
        
        const result = await response.json();
        if (result.success) {
          const blogsData = result.data
            .filter((blog: BlogPost) => blog.isVerified)
            .slice(0, displayCount);
          
          setRecentBlogs(blogsData);
          setFilteredBlogs(blogsData);
        } else {
          throw new Error(result.message || 'Failed to fetch blogs');
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setError("Failed to load blogs");
      } finally {
        setIsLoadingBlogs(false);
      }
    };

    fetchBlogs();
  }, [displayCount]);

  // Find category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.title : "Unknown Category";
  };

  // Format date for display
 

  // Truncate content for preview
  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="flex min-h-screen">
      {/* Main Content */}
      <div className="w-full">
        <div className="max-w-7xl mx-auto py-12 px-6 md:px-8">
          {/* Blog Heading with View More link */}
          <div className="flex flex-col md:flex-row md:justify-between items-center mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-serif font-bold text-gray-800 tracking-wider text-center mb-4 md:mb-0">
              வலைப்பதிவுகள்
            </h1>
            {/* Desktop View More link */}
            <Link 
              href="/dashboard" 
              className="hidden md:inline-block text-blue-800 hover:text-blue-600 underline font-medium transition-colors"
            >
              View More
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow">
              <p>{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoadingBlogs && (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-600 flex flex-col items-center">
                <div className="w-16 h-16 relative">
                  <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="mt-4 text-gray-800 font-medium">Loading articles...</p>
              </div>
            </div>
          )}

          {/* Categories Loading State */}
          {isLoadingCategories && !isLoadingBlogs && filteredBlogs.length > 0 && (
            <div className="mb-4 px-4">
              <div className="inline-block bg-gray-200 text-gray-500 px-3 py-1 rounded-full text-sm animate-pulse">
                Loading categories...
              </div>
            </div>
          )}

          {/* No Blogs Found */}
          {!isLoadingBlogs && filteredBlogs.length === 0 && (
            <div className="bg-white border border-gray-200 overflow-hidden p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Articles Found</h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  No articles have been published yet.
                </p>
              </div>
            </div>
          )}

          {/* Card Grid - 4 per row matching the design from the image */}
          {!isLoadingBlogs && filteredBlogs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4 bg-gray-100">
              {filteredBlogs.map((blog) => (
                <div key={blog.id} className="bg-white mt-5 mb-5 border border-black shadow-sm hover:shadow-md transition-shadow">
                  {/* Blog Image */}
                  <Link href={`/blog/${blog.id}`}>
                    <div className="relative h-60 w-full overflow-hidden">
                      {blog.imageUrl ? (
                        <Image
                          src={blog.imageUrl}
                          alt={blog.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-white flex items-center justify-center border-black">
                          <div className="text-center p-4">
                            <div className="w-16 h-16 mx-auto mb-2">

                            </div>
                            <p className="text-gray-400 text-sm">Image not available</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Blog Content - Matching the design from the image */}
                  <div className="p-8">
                    <Link href={`/blog/${blog.id}`}>
                      <h2
                        className="text-2xl font-serif font-bold text-gray-800 mb-4 hover:underline"
                        style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                      >
                        {blog.title}
                      </h2>
                    </Link>

                     <p className="text-gray-700 mb-5 line-clamp-6 text-base md:text-base">
                    {truncateContent(blog.content, 150)}
                </p>
                    <span className="text-sm text-green-700 font-medium">
                      {getCategoryName(blog.categoryId)}
                    </span><br />
                    <Link
                    href={`/blog/${blog.id}`}
                    className="text-blue-600 font-medium hover:underline text-sm sm:text-base"
                >
                    View More →
                </Link>
                
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View More link below cards (visible only on mobile) */}
          {!isLoadingBlogs && filteredBlogs.length > 0 && (
            <div className="flex justify-center mt-8 md:hidden">
              <Link
                href="/dashboard"
                className="text-blue-800 hover:text-blue-600 underline font-medium transition-colors flex items-center gap-1"
              >
                View More
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}