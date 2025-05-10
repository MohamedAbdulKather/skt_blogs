// AddBlogPage.tsx
'use client';


import React from 'react';
import useBlogForm from './Controller/add-blog-Form';
import BlogForm from './View/BlogForm';


export default function AddBlogPage() {
  const {
    formState,
    loading,
    categories,
    isLoadingCategories,
    error,
    handleInputChange,
    handleImageChange,
    handleSubmit
  } = useBlogForm();

  return (
   
    <BlogForm
      formState={formState}
      loading={loading}
      categories={categories}
      isLoadingCategories={isLoadingCategories}
      error={error}
      handleInputChange={handleInputChange}
      handleImageChange={handleImageChange}
      handleSubmit={handleSubmit}
    />
  );
}