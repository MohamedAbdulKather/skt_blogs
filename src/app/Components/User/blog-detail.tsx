'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useParams, useRouter } from 'next/navigation';
import Image from "next/image";
import { ArrowLeft, BookOpen, Calendar, Bookmark } from 'lucide-react';
import Navbar from './navbar';

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

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;

  // State for blog post and category
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarExpanded] = useState<boolean>(false);
  
  
  // Fetch blog post data by slug
  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!slug) return;

      setIsLoading(true);
      setError(null);

      try {
        // Query the blog collection by slug
        const blogQuery = query(
          collection(db, "blogs"),
          where("slug", "==", slug),
          where("isVerified", "==", true)
        );

        const querySnapshot = await getDocs(blogQuery);

        if (querySnapshot.empty) {
          setError("Blog post not found");
          setIsLoading(false);
          return;
        }

        // Get the first (and should be only) document
        const blogDoc = querySnapshot.docs[0];
        const blogData = blogDoc.data();

        const blogPost: BlogPost = {
          id: blogDoc.id,
          title: blogData.title,
          content: blogData.content,
          imageUrl: blogData.imageUrl,
          createdAt: blogData.createdAt?.toDate() || null,
          categoryId: blogData.categoryId,
          isVerified: blogData.isVerified,
          slug: blogData.slug
        };

        setBlog(blogPost);

        // Fetch the category data
        if (blogData.categoryId) {
          try {
            const categoryDocRef = doc(db, "categories", blogData.categoryId);
            const categoryDoc = await getDoc(categoryDocRef);

            if (categoryDoc.exists()) {
              setCategory({
                id: categoryDoc.id,
                name: categoryDoc.data().name
              });
            }
          } catch (categoryError) {
            console.error("Error fetching category:", categoryError);
          }
        }
      } catch (error) {
        console.error("Error fetching blog post:", error);
        setError(`Failed to load blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      setIsLoading(false);
    };

    fetchBlogPost();
  }, [slug]);

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return "Unknown date";
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format content with paragraphs
  const formatContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-4 font-serif text-gray-800 break-words">
        {paragraph}
      </p>
    ));
  };

  // Handle back button click
  const handleBack = () => {
    router.back();
  };

  // Generate colors based on blog title for placeholder
  const generatePlaceholderColors = (title: string) => {
    const hash = title.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const hue = Math.abs(hash % 360);
    // Use a soothing pastel palette
    return {
      primary: `hsl(${hue}, 70%, 85%)`,
      secondary: `hsl(${(hue + 40) % 360}, 70%, 75%)`,
      tertiary: `hsl(${(hue + 80) % 360}, 70%, 80%)`
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 font-serif overflow-x-hidden">
      {/* Navbar Component */}
      <Navbar />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 w-full ${sidebarExpanded ? 'ml-64' : ''}`}>
        {/* Back Button Container */}
        <div className="max-w-4xl mx-auto pt-8 px-4 md:px-6">
          <button
            onClick={handleBack}
            className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-300 font-serif"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Blogs
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-lg p-6">
              <div className="text-gray-600 font-serif">Loading blog post...</div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-md font-serif">
              <p className="break-words">{error}</p>
              <button
                onClick={handleBack}
                className="mt-2 text-red-700 underline hover:text-red-900 font-serif"
              >
                Return to blogs
              </button>
            </div>
          </div>
        )}

        {/* Blog Post Content */}
        {!isLoading && blog && (
          <div className="max-w-4xl mx-auto px-4 md:px-6 pb-10">
            {/* Featured Image Container */}
            <div className="relative w-full bg-white rounded-t-lg shadow-lg overflow-hidden mb-0">
              {blog.imageUrl ? (
                <div className="relative w-full h-auto">
                  {/* Using Image component with responsive sizing */}
                  <Image
                    src={blog.imageUrl}
                    alt={blog.title}
                    width={1200}
                    height={675}
                    className="w-full h-auto object-contain"
                    priority
                    style={{
                      maxHeight: '500px',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              ) : (
                // Attractive image placeholder when no image is available
                <div 
                  className="relative w-full h-64 md:h-80 flex items-center justify-center overflow-hidden"
                  style={{
                    background: blog.title ? 
                      `linear-gradient(135deg, ${generatePlaceholderColors(blog.title).primary}, ${generatePlaceholderColors(blog.title).secondary})` : 
                      'linear-gradient(135deg, #f3e7e9, #e3eeff)'
                  }}
                >
                  <div className="relative w-full h-full">
                    {/* Decorative elements */}
                    <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 opacity-20">
                      <BookOpen size={100} color="#fff" />
                    </div>
                    <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2 opacity-20">
                      <Bookmark size={80} color="#fff" />
                    </div>
                    <div className="absolute top-1/2 right-1/3 transform -translate-y-1/2 opacity-20">
                      <Calendar size={60} color="#fff" />
                    </div>
                    
                    {/* Abstract patterns */}
                    <div className="absolute inset-0">
                      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#smallGrid)" />
                      </svg>
                    </div>
                    
                    {/* Title overlay for placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white bg-opacity-80 px-6 py-4 rounded-lg shadow-lg max-w-md text-center">
                        <h2 className="text-xl font-medium text-gray-800 break-words">
                          {blog.title}
                        </h2>
                        {category && (
                          <div className="mt-2">
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full uppercase tracking-wider">
                              {category.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Blog Content Container */}
            <div className="bg-white rounded-b-lg shadow-lg p-6 md:p-10">
              {/* Category Badge - Centered */}
              <div className="flex justify-center mb-6">
                {category && (
                  <span className="px-4 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full font-serif uppercase tracking-wider">
                    {category.name}
                  </span>
                )}
              </div>
              
              {/* Blog Title - Centered */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center font-serif break-words">
                {blog.title}
              </h1>
              
              {/* Date - Centered */}
              <div className="text-center mb-8">
                <span className="text-sm text-gray-500 font-serif italic">
                  {blog.createdAt ? formatDate(blog.createdAt) : 'Date unavailable'}
                </span>
              </div>
              
              {/* Decorative Divider */}
              <div className="flex items-center justify-center mb-10">
                <div className="w-16 border-t border-gray-300"></div>
                <div className="mx-4 text-gray-400">❋</div>
                <div className="w-16 border-t border-gray-300"></div>
              </div>
              
              {/* Blog Content - Serif Font */}
              <div className="prose prose-slate max-w-none text-gray-800 leading-relaxed font-serif break-words overflow-hidden">
                {formatContent(blog.content)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}