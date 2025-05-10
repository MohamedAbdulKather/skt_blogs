'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, where, onSnapshot } from 'firebase/firestore';
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

export function ViewAllBlogs() {
  // State for blogs and categories
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 8;

  // Fetch categories
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

  // Fetch all blogs
  useEffect(() => {
    const fetchAllBlogs = async () => {
      setIsLoadingBlogs(true);
      try {
        // First attempt: try with a compound query that requires an index
        try {
          const q = query(
            collection(db, "blogs"),
            where("isVerified", "==", true),
            orderBy("createdAt", "desc")
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

          setBlogs(blogsData);
          setFilteredBlogs(blogsData);
          setCurrentPage(1); // Reset to first page whenever blogs change
        } catch (indexError) {
          console.error("Index error:", indexError);

          // If we get an index error, try a simpler query as a fallback
          if (indexError instanceof Error && indexError.message.includes("requires an index")) {
            console.log("Falling back to simpler query without compound index requirement");

            const fallbackQ = query(
              collection(db, "blogs"),
              orderBy("createdAt", "desc")
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
            const verifiedBlogs = allBlogsData.filter(blog => blog.isVerified);

            setBlogs(verifiedBlogs);
            setFilteredBlogs(verifiedBlogs);
            setCurrentPage(1); // Reset to first page whenever blogs change

            // Set a specific error to guide the user to create indexes
            setError(
              "Firebase indexes need to be created. Click the link in the console error message to create the required indexes."
            );
          } else {
            throw indexError; // Re-throw if it's not an index error
          }
        }
      } catch (error) {
        console.error("Error fetching all blogs:", error);
        if (error instanceof Error) {
          setError(`Failed to load blogs: ${error.message}`);
        } else {
          setError("Failed to load blogs: An unknown error occurred.");
        }
      }
      setIsLoadingBlogs(false);
    };

    fetchAllBlogs();
  }, []);

  // Filter blogs by category
  useEffect(() => {
    if (selectedCategory) {
      setFilteredBlogs(blogs.filter(blog => blog.categoryId === selectedCategory));
    } else {
      setFilteredBlogs(blogs);
    }
    setCurrentPage(1); // Reset to first page whenever filters change
  }, [selectedCategory, blogs]);

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

  // Handle category selection change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value === "all" ? null : value);
  };

  // Get current blogs for pagination
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Go to next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Go to previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="flex min-h-screen ">
      {/* Main Content */}
      <div className="w-full">
        <div className="max-w-7xl mx-auto py-12 px-6 md:px-8">
          {/* All Blogs Heading */}
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-4xl md:text-5xl font-serif text-gray-800 tracking-wider">
              All Blogs
            </h1>
          </div>

          {/* Category Filter Dropdown */}
          {!isLoadingCategories && categories.length > 0 && (
            <div className="mb-8">
              <div className="relative w-full md:w-64">
                <select
                  value={selectedCategory || "all"}
                  onChange={handleCategoryChange}
                  className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 font-serif"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          )}

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

          {/* No Blogs Found */}
          {!isLoadingBlogs && filteredBlogs.length === 0 && (
            <div className="bg-white border border-gray-200 overflow-hidden p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Articles Found</h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  {selectedCategory 
                    ? "No articles found in this category." 
                    : "No articles have been published yet."}
                </p>
              </div>
            </div>
          )}

          {/* Card Grid - 4 per row matching the design from the image */}
          {!isLoadingBlogs && currentBlogs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4 bg-gray-100">
              {currentBlogs.map((blog) => (
                <div key={blog.id} className="bg-white mt-5 mb-5 border border-black-200 shadow-sm hover:shadow-md transition-shadow">
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
                        <div className="h-full w-full bg-white flex items-center justify-center border-b border-gray-200">
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

          {/* Pagination */}
          {!isLoadingBlogs && filteredBlogs.length > blogsPerPage && (
            <div className="flex justify-center mt-12">
              <nav className="flex items-center">
                <button 
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 mx-1 rounded-md ${
                    currentPage === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  } border border-gray-300`}
                >
                  Previous
                </button>
                
                <div className="flex">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(num => {
                      // Show current page, first page, last page, and pages around current page
                      const maxPagesToShow = 5;
                      if (totalPages <= maxPagesToShow) return true;
                      
                      if (
                        num === 1 || 
                        num === totalPages ||
                        (num >= currentPage - 1 && num <= currentPage + 1)
                      ) {
                        return true;
                      }
                      return false;
                    })
                    .map(number => {
                      // Insert ellipsis for gaps
                      const result = [];
                      if (
                        number > 1 && 
                        !Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(n => {
                            if (totalPages <= 5) return true;
                            return n === 1 || n === totalPages || (n >= currentPage - 1 && n <= currentPage + 1);
                          })
                          .includes(number - 1)
                      ) {
                        result.push(
                          <span key={`ellipsis-before-${number}`} className="px-4 py-2 mx-1">
                            ...
                          </span>
                        );
                      }
                      
                      result.push(
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`px-4 py-2 mx-1 rounded-md ${
                            currentPage === number
                              ? 'bg-gray-800 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          } border border-gray-300`}
                        >
                          {number}
                        </button>
                      );
                      
                      if (
                        number < totalPages && 
                        !Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(n => {
                            if (totalPages <= 5) return true;
                            return n === 1 || n === totalPages || (n >= currentPage - 1 && n <= currentPage + 1);
                          })
                          .includes(number + 1)
                      ) {
                        result.push(
                          <span key={`ellipsis-after-${number}`} className="px-4 py-2 mx-1">
                            ...
                          </span>
                        );
                      }
                      
                      return result;
                    })}
                </div>
                
                <button 
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 mx-1 rounded-md ${
                    currentPage === totalPages 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  } border border-gray-300`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
          
          {/* Page info */}
          {!isLoadingBlogs && filteredBlogs.length > 0 && (
            <div className="text-center mt-6 text-gray-500 text-sm">
              Showing {indexOfFirstBlog + 1}-{Math.min(indexOfLastBlog, filteredBlogs.length)} of {filteredBlogs.length} articles
            </div>
          )}
        </div>
      </div>
    </div>
  );
}