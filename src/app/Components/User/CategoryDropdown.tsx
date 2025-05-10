'use client';

import React, { useState, useEffect, useRef } from 'react';

// Define types
interface Category {
  id: string;
  name: string;
}

interface CategoryDropdownProps {
  categories: Category[];
  selectedCategory: string | null;
  onChange: (categoryId: string) => void;
  isLoading: boolean;
}

export function CategoryDropdown({ 
  categories, 
  selectedCategory, 
  onChange, 
  isLoading 
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get the selected category name or "All Categories" if null
  const getSelectedCategoryName = () => {
    if (!selectedCategory) return "All Categories";
    const category = categories.find(cat => cat.id === selectedCategory);
    return category ? category.name : "All Categories";
  };

  // Handle selecting a category
  const handleSelectCategory = (categoryId: string | null) => {
    onChange(categoryId ? categoryId : "all");
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add "All Categories" to the beginning of the list
  const allCategoriesOption = { id: "all", name: "All Categories" };
  const categoriesWithAll = [allCategoriesOption, ...categories];

  return (
    <div className="relative w-full md:w-64" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 font-serif"
      >
        <span>{getSelectedCategoryName()}</span>
        <svg className={`fill-current h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} 
             xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
          {categoriesWithAll.map((category, index) => (
            <div
              key={category.id}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 
                         ${(selectedCategory === category.id || (category.id === "all" && !selectedCategory)) ? 'bg-gray-100' : ''}
                         ${index !== categoriesWithAll.length - 1 ? 'border-b border-gray-200' : ''}`}
              onClick={() => handleSelectCategory(category.id === "all" ? null : category.id)}
            >
              {category.name}
            </div>
          ))}
          
          {isLoading && (
            <div className="px-4 py-2 text-gray-500 text-center">
              Loading categories...
            </div>
          )}
          
          {!isLoading && categories.length === 0 && (
            <div className="px-4 py-2 text-gray-500 text-center">
              No categories available
            </div>
          )}
        </div>
      )}
    </div>
  );
}