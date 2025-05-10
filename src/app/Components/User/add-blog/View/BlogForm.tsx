'use client';

import React, { useState } from 'react';
import Image from "next/image";
import Link from 'next/link';
import { Category } from '../model/add-blog';


interface BlogFormProps {
  formState: {
    title: string;
    categoryId: string;
    content: string;
    imagePreview: string | null;
  };
  loading: boolean;
  categories: Category[];
  isLoadingCategories: boolean;
  error: string | null;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

const BlogForm: React.FC<BlogFormProps> = ({
  formState,
  loading,
  categories,
  isLoadingCategories,
  error,
  handleInputChange,
  handleImageChange,
  handleSubmit
}) => {
  const [sidebarExpanded] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(1);


  const nextStep = () => {
    if ((activeStep === 1 && formState.title) || 
        (activeStep === 2 && formState.categoryId) || 
        activeStep === 3) {
      setActiveStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setActiveStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Sidebar */}

      {/* Main Content */}
      <div className={`transition-all duration-300 w-full ${sidebarExpanded ? 'ml-64' : 'ml-16'}`}> 
        <div className="max-w-5xl mx-auto py-6 px-4 md:px-6">
          <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-xl overflow-hidden relative">
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-100 rounded-full opacity-50"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-100 rounded-full opacity-50"></div>
            
            {/* Header with bilingual title */}
            <div className="relative mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Add New Blog</h2>
              <p className="text-base sm:text-lg text-indigo-600 mt-1">புதிய வலைப்பதிவு சேர்க்க</p>
              <div className="mt-3 h-1 w-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
            </div>

            {/* Progress steps - Responsive mobile view */}
            <div className="mb-8 relative">
              <div className="flex justify-between items-center mb-4">
                {[1, 2, 3, 4].map((step) => (
                  <div 
                    key={step} 
                    className={`flex flex-col  items-center ${activeStep >= step ? 'text-blue-600' : 'text-gray-400'}`}
                  >
                    <div 
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-1 
                      ${activeStep === step ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 
                        activeStep > step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}
                    >
                      {activeStep > step ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : step}
                    </div>
                    <span className="text-xs sm:text-sm font-medium">
                      {step === 1 ? 'Title' : 
                       step === 2 ? 'Category' : 
                       step === 3 ? 'Content' : 'Image'}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Progress bar */}
              <div className="h-1 w-full bg-gray-200 rounded-full">
                <div 
                  className="h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300"
                  style={{ width: `${(activeStep / 4) * 100}%` }}
                ></div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              {/* Step 1: Title */}
              <div className={`transition-all duration-500 ${activeStep === 1 ? 'block opacity-100' : 'hidden opacity-0'}`}>
                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                  Heading (தலைப்பு)*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="title"
                    value={formState.title}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 sm:py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black pl-12"
                    placeholder="வலைப்பதிவு தலைப்பை உள்ளிடவும்"
                    required
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!formState.title}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition duration-200 flex items-center"
                  >
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Step 2: Category */}
              <div className={`transition-all duration-500 ${activeStep === 2 ? 'block opacity-100' : 'hidden opacity-0'}`}>
                <label htmlFor="categoryId" className="block text-gray-700 font-medium mb-2">
                  Category (வகை)*
                </label>
                <div className="relative">
                  {isLoadingCategories ? (
                    <div className="flex items-center space-x-2 text-gray-500">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      <p>வகைகள் ஏற்றப்படுகின்றன...</p>
                    </div>
                  ) : error ? (
                    <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                      <p className="text-red-600 font-medium">{error}</p>
                      <p className="mt-2 text-red-500">Please check the console for more details and ensure your Firebase connection is correct.</p>
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                      <div className="flex items-center text-yellow-700 mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-sm font-medium">வகைகள் இல்லை. முதலில் ஒரு வகையை சேர்க்கவும்.</p>
                      </div>
                      <Link href="/admin/add-category" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200">
                        Click here to add categories
                      </Link>
                    </div>
                  ) : (
                    <div className="relative w-full">
                      <select
                        id="categoryId"
                        value={formState.categoryId}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3 sm:py-4 border text-black border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pl-12 appearance-none"
                        required
                      >
                        <option value="" disabled className="text-black">Select Category (வகையை தேர்ந்தெடுக்கவும்)</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!formState.categoryId || categories.length === 0}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition duration-200 flex items-center"
                  >
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Step 3: Content */}
              <div className={`transition-all duration-500 ${activeStep === 3 ? 'block opacity-100' : 'hidden opacity-0'}`}>
                <label htmlFor="content" className="block text-gray-700 font-medium mb-2">
                  Content (உள்ளடக்கம்)*
                </label>
                <div className="relative">
                  <textarea
                    id="content"
                    value={formState.content}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 sm:py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black pl-12"
                    placeholder="வலைப்பதிவு உள்ளடக்கத்தை உள்ளிடவும்"
                    rows={8}
                    required
                  />
                  <div className="absolute left-3 top-6 text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                  </div>
                </div>
                <div className="mt-6 flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:opacity-90 transition duration-200 flex items-center"
                  >
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Step 4: Image Upload and Submit */}
              <div className={`transition-all duration-500 ${activeStep === 4 ? 'block opacity-100' : 'hidden opacity-0'}`}>
                <label htmlFor="imageInput" className="block text-gray-700 font-medium mb-2">
                  Blog Image (வலைப்பதிவு படம்) (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 text-center hover:border-blue-400 transition-colors">
                  <div className="space-y-2">
                    <div className="mx-auto flex justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-gray-600">
                      <label htmlFor="imageInput" className="relative cursor-pointer bg-blue-100 rounded-lg px-4 py-2 text-blue-600 font-medium hover:bg-blue-200 transition-colors">
                        <span>Upload a file</span>
                        <input
                          id="imageInput"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="text-xs mt-2">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                </div>

                {/* Image Preview */}
                {formState.imagePreview && (
                  <div className="mt-6">
                    <p className="text-sm text-gray-600 mb-2">Image Preview (படம் முன்னோட்டம்):</p>
                    <div className="relative h-48 sm:h-64 w-full bg-gray-50 rounded-xl overflow-hidden shadow-md">
                      <Image
                        src={formState.imagePreview}
                        alt="Preview"
                        fill
                        className="object-contain rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Verification Status Notes */}
                <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 sm:p-4 rounded-xl border-l-4 border-blue-500">
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs sm:text-sm text-blue-800">
                        <strong>குறிப்பு:</strong> இந்த வலைப்பதிவு சரிபார்ப்புக்கு பின்னரே வெளியிடப்படும். நிர்வாகி இதை சரிபார்த்த பின்னர் மட்டுமே இது வலைதளத்தில் தோன்றும்.
                      </p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-red-50 to-red-100 p-3 sm:p-4 rounded-xl border-l-4 border-red-500">
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-xs sm:text-sm text-red-800">
                        <strong>Note:</strong> This blog will be published only after verification. It will only appear on the website after the administrator verifies it.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || isLoadingCategories || categories.length === 0 || !formState.title || !formState.categoryId || !formState.content}
                    className="px-4 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition duration-200 font-medium flex items-center shadow-lg shadow-blue-200"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        சேர்க்கிறது...
                      </>
                    ) : (
                      <>
                        <span>வலைப்பதிவு சேர்க்க</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogForm;