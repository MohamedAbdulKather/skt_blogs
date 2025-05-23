'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMediaQuery } from 'react-responsive';
import Link from 'next/link';
import Image from "next/image";
import { CategoryDropdown } from './CategoryDropdown';
import { Category } from './add-blog/model/add-blog';


// Remove Firebase imports and update BlogPost interface
interface BlogPost {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  categoryId: string;
  isVerified: boolean;
  createdAt: string;
  slug?: string; // Made optional since it's not in the API response
}

// Custom hook for responsive blogs per page
const useBlogsPerPage = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  return isMobile ? 8 : 20; // 10 items on mobile, 20 on desktop
};

export function ViewAllBlogs() {
  // State for blogs and categories
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Create a ref for the blog content section
  const blogSectionRef = useRef<HTMLDivElement>(null);

  // Responsive pagination
  const blogsPerPage = useBlogsPerPage();
  const [currentPage, setCurrentPage] = useState(1);

  // Adjust current page when blogsPerPage changes
  useEffect(() => {
    const newTotalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  }, [blogsPerPage, filteredBlogs.length, currentPage]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await fetch('http://localhost:4000/api/categories');
        const result = await response.json();

        if (result.success) {
          setCategories(result.data);
        } else {
          throw new Error('Failed to fetch categories');
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

  // Fetch all blogs
  useEffect(() => {
    const fetchAllBlogs = async () => {
      setIsLoadingBlogs(true);
      try {
        const response = await fetch('http://localhost:4000/api/blogs');
        const result = await response.json();

        if (result.success) {
          // Only get verified blogs
          const verifiedBlogs = result.data.filter((blog: BlogPost) => blog.isVerified);
          setBlogs(verifiedBlogs);
          setFilteredBlogs(verifiedBlogs);
          setCurrentPage(1);
        } else {
          throw new Error('Failed to fetch blogs');
        }
      } catch (error) {
        console.error("Error fetching all blogs:", error);
        if (error instanceof Error) {
          setError(`Failed to load blogs: ${error.message}`);
        } else {
          setError("Failed to load blogs: An unknown error occurred.");
        }
      } finally {
        setIsLoadingBlogs(false);
      }
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
    setCurrentPage(1);
  }, [selectedCategory, blogs]);

  // Find category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.title : "Unknown Category";
  };

  // Truncate content for preview
  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  // Handle category selection change
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "all" ? null : value);
  };

  // Pagination logic
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

  // Function to scroll to blog section
  const scrollToBlogSection = () => {
    // Use window.scrollTo for a smoother experience
    if (blogSectionRef.current) {
      const yOffset = -100; // Adjust this value for padding at the top
      const y = blogSectionRef.current.getBoundingClientRect().top + window.scrollY + yOffset;

      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  };

  // Change page with scroll
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    setTimeout(scrollToBlogSection, 100); // Small delay to ensure state updates
  };

  // Navigation functions with scroll
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setTimeout(scrollToBlogSection, 100);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setTimeout(scrollToBlogSection, 100);
    }
  };

  const goToFirstPage = () => {
    if (currentPage !== 1) {
      setCurrentPage(1);
      setTimeout(scrollToBlogSection, 100);
    }
  };

  const goToLastPage = () => {
    if (currentPage !== totalPages) {
      setCurrentPage(totalPages);
      setTimeout(scrollToBlogSection, 100);
    }
  };

  return (
    <div className="flex min-h-screen">
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
          <div className="mb-8">
            <CategoryDropdown
              categories={categories}
              selectedCategory={selectedCategory}
              onChange={handleCategoryChange}
              isLoading={isLoadingCategories}
            />
          </div>

          {/* Blog section reference point */}
          <div ref={blogSectionRef} className="scroll-mt-24"></div>

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

          {/* Card Grid */}
          {!isLoadingBlogs && currentBlogs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4 bg-gray-100">
              {currentBlogs.map((blog) => (
                <div key={blog.id} className="bg-white mt-5 mb-5 border border-black-200 shadow-sm hover:shadow-md transition-shadow">
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
                        <div className="h-full w-full bg-white flex items-center justify-center border-b border-gray-200">
                          <div className="text-center p-4">
                            <div className="w-16 h-16 mx-auto mb-2"></div>
                            <p className="text-gray-400 text-sm">Image not available</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Blog Content */}
                  <div className="p-8">
                    <Link href={`/blog/${blog.id}`}>
                      <h2 className="text-2xl md:text-2xl sm:text-3xl font-serif font-bold text-gray-800 mb-4 hover:underline break-words overflow-wrap-anywhere leading-normal">
                        {blog.title}
                      </h2>
                    </Link>

                    <p className="text-gray-700 mb-5 line-clamp-6 text-base md:text-base">
                      {truncateContent(blog.content, 150)}
                    </p>

                    <span className="text-sm sm:text-base text-green-700 font-medium">
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

          {/* Pagination */}
          {!isLoadingBlogs && filteredBlogs.length > blogsPerPage && (
            <div className="flex justify-end mt-12">
              <nav className="flex items-center">
                {/* First Page Button */}
                <button
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 mx-1 rounded-md ${currentPage === 1
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-gray-100'
                    } border border-gray-300`}
                  aria-label="Go to first page"
                >
                  &laquo;
                </button>

                {/* Previous Button */}
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 mx-1 rounded-md ${currentPage === 1
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-gray-100'
                    } border border-gray-300`}
                >
                  &lt;
                </button>

                <div className="flex">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(num => {
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
                          <span key={`ellipsis-before-${number}`} className="px-3 py-2 mx-1 text-black">
                            ...
                          </span>
                        );
                      }

                      result.push(
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`px-4 py-2 mx-1 rounded-md ${currentPage === number
                              ? 'bg-black text-white font-medium'
                              : 'bg-white text-black hover:bg-gray-100'
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
                          <span key={`ellipsis-after-${number}`} className="px-3 py-2 mx-1 text-black">
                            ...
                          </span>
                        );
                      }

                      return result;
                    })}
                </div>

                {/* Next Button */}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 mx-1 rounded-md ${currentPage === totalPages
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-gray-100'
                    } border border-gray-300`}
                >
                  &gt;
                </button>

                {/* Last Page Button */}
                <button
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 mx-1 rounded-md ${currentPage === totalPages
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-gray-100'
                    } border border-gray-300`}
                  aria-label="Go to last page"
                >
                  &raquo;
                </button>
              </nav>
            </div>
          )}

          {/* Page info */}
          {!isLoadingBlogs && filteredBlogs.length > 0 && (
            <div className="text-right mt-4 text-black font-medium text-sm">
              Showing {indexOfFirstBlog + 1}-{Math.min(indexOfLastBlog, filteredBlogs.length)} of {filteredBlogs.length} articles
            </div>
          )}
        </div>
      </div>
    </div>
  );
}