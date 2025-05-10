'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, where, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import Image from "next/image";

// Define types
interface Category {
  id: string;
  name: string;
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  categoryId: string;
  isVerified: boolean;
  slug: string;
}

export function ViewBlogPage() {
  // State for blogs and categories
  const [, setRecentBlogs] = useState<BlogPost[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categori
  useEffect(() => {
    setIsLoadingCategories(true);

    try {
      const q = query(
        collection(db, "categories"),
        orderBy("name", "asc")
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const categoriesData: Category[] = [];
        querySnapshot.forEach((doc) => {
          categoriesData.push({
            id: doc.id,
            name: doc.data().name,
          });
        });

        setCategories(categoriesData);
        setIsLoadingCategories(false);
      }, (error) => {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories");
        setIsLoadingCategories(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Exception when setting up category listener:", error);
      setError(`Exception when fetching categories: ${error}`);
      setIsLoadingCategories(false);
    }
  }, []);

  // Fetch the latest blogs
  useEffect(() => {
    const fetchRecentBlogs = async () => {
      setIsLoadingBlogs(true);
      try {
        // First attempt: try with a compound query that requires an index
        try {
          const q = query(
            collection(db, "blogs"),
            where("isVerified", "==", true),
            orderBy("createdAt", "desc"),
            limit(8)
          );

          const querySnapshot = await getDocs(q);
          const blogsData: BlogPost[] = [];

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            blogsData.push({
              id: doc.id,
              title: data.title,
              content: data.content,
              imageUrl: data.imageUrl,
              createdAt: data.createdAt?.toDate?.() || null,
              categoryId: data.categoryId,
              isVerified: data.isVerified,
              slug: data.slug
            });
          });

          setRecentBlogs(blogsData);
          setFilteredBlogs(blogsData);
        } catch (indexError) {
          console.error("Index error:", indexError);

          // If we get an index error, try a simpler query as a fallback
          if (indexError instanceof Error && indexError.message.includes("requires an index")) {
            console.log("Falling back to simpler query without compound index requirement");

            const fallbackQ = query(
              collection(db, "blogs"),
              orderBy("createdAt", "desc"),
              limit(20) // Get more to filter client-side
            );

            const fallbackSnapshot = await getDocs(fallbackQ);
            const allBlogsData: BlogPost[] = [];

            fallbackSnapshot.forEach((doc) => {
              const data = doc.data();
              allBlogsData.push({
                id: doc.id,
                title: data.title,
                content: data.content,
                imageUrl: data.imageUrl,
                createdAt: data.createdAt?.toDate?.() || null,
                categoryId: data.categoryId,
                isVerified: data.isVerified || false,
                slug: data.slug
              });
            });

            // Filter verified blogs client-side
            const verifiedBlogs = allBlogsData.filter(blog => blog.isVerified).slice(0, 8);

            setRecentBlogs(verifiedBlogs);
            setFilteredBlogs(verifiedBlogs);

            // Set a specific error to guide the user to create indexes
            setError(
              "Firebase indexes need to be created. Click the link in the console error message to create the required indexes."
            );
          } else {
            throw indexError; // Re-throw if it's not an index error
          }
        }
      } catch (error) {
        console.error("Error fetching recent blogs:", error);
        if (error instanceof Error) {
          setError(`Failed to load recent blogs: ${error.message}`);
        } else {
          setError("Failed to load recent blogs: An unknown error occurred.");
        }
        setIsLoadingBlogs(false);
      }
      setIsLoadingBlogs(false);
    };

    fetchRecentBlogs();
  }, []);

  // Find category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "Unknown Category";
  };

  // Truncate content for preview
  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="flex min-h-screen ">
      {/* Main Content */}
      <div className="w-full">
        <div className="max-w-7xl mx-auto py-12 px-6 md:px-8">
          {/* Hiking & Backpacking Heading - Modified for centered heading on mobile */}
          <div className="flex flex-col md:flex-row md:justify-between items-center mb-10">
            <h1 className="text-4xl md:text-5xl font-serif text-gray-800 tracking-wider text-center md:text-left mb-4 md:mb-0">
              வலைப்பதிவுகள்
            </h1>
            {/* View More link in header (visible only on desktop) */}
            <Link 
              href="/dashboard"
              className="text-gray-800 underline hover:underline font-medium hidden md:block"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4  bg-gray-100 ">
              {filteredBlogs.map((blog) => (
                <div key={blog.id} className="bg-white mt-5 mb-5 border border-black shadow-sm hover:shadow-md transition-shadow">
                  {/* Blog Image */}
                  <Link href={`/blog/${blog.slug}`}>
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
                    <Link href={`/blog/${blog.slug}`}>
                      <h2 className="text-2xl font-serif font-bold text-gray-800 mb-4 hover:underline">
                        {blog.title}
                      </h2>
                    </Link>

                    <p className="text-gray-700 mb-5 line-clamp-3 text-base">
                      {truncateContent(blog.content, 150)}
                    </p>
                    
                    <span className="text-sm text-green-700 font-medium">
                      {getCategoryName(blog.categoryId)}
                    </span>
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
                className="underline text-black-800 hover:underline font-medium"
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