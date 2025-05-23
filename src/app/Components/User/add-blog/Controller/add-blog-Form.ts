import { useState, useEffect } from 'react';
import {  Category, FormState, CategoryResponse, ApiResponse } from '../model/add-blog';
import { toast } from 'react-toastify';

export default function useBlogForm() {
  const [formState, setFormState] = useState<FormState>({
    title: '',
    categoryId: '',
    content: '',
    image: null,
    imagePreview: null
  });
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      setError(null);
      
      try {
        const response = await fetch('http://localhost:4000/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const result = await response.json() as ApiResponse<CategoryResponse>;
        if (result.success) {
          const categoriesData = result.data.map((category: CategoryResponse) => ({
            id: category.id,
            title: category.title,
            description: category.description
          }));
          
          setCategories(categoriesData);
          
          // Set default category if available
          if (categoriesData.length > 0 && !formState.categoryId) {
            setFormState(prev => ({
              ...prev,
              categoryId: categoriesData[0].id
            }));
          }
        } else {
          throw new Error(result.message || 'Failed to fetch categories');
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError(`Failed to load categories: ${error}`);
        toast.error("Failed to load categories");
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      setFormState(prev => ({
        ...prev,
        image: file
      }));
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormState(prev => ({
          ...prev,
          imagePreview: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormState(prev => ({
        ...prev,
        image: null,
        imagePreview: null
      }));
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Function to close modal
  const handleCloseModal = () => {
    setIsSuccessModalOpen(false);
  };

  // Function to upload image and get URL
  

  // Function to save blog to API
  const saveBlogToAPI = async (blogData: FormData): Promise<void> => {
    try {
      const response = await fetch('http://localhost:4000/api/blogs', {
        method: 'POST',
        body: blogData,
      });

      if (!response.ok) {
        throw new Error('Failed to create blog post');
      }

      const result = await response.json();

      if (result.success) {
        // Reset form
        setFormState({
          title: '',
          categoryId: categories.length > 0 ? categories[0].id : '',
          content: '',
          image: null,
          imagePreview: null
        });
        
        // Reset file input
        const fileInput = document.getElementById('imageInput') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
        
        toast.success('வலைப்பதிவு வெற்றிகரமாக சேர்க்கப்பட்டது!');
      } else {
        throw new Error(result.message || 'Failed to create blog post');
      }
    } catch (error) {
      console.error("Error saving blog post:", error);
      toast.error("வலைப்பதிவை சேமிப்பதில் பிழை");
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedTitle = formState.title.trim();
    const trimmedContent = formState.content.trim();
    
    // Form validation
    if (!trimmedTitle) {
      toast.error("தலைப்பு தேவை!");
      return;
    }
    
    if (!formState.categoryId) {
      toast.error("வகை தேர்ந்தெடுக்கவும்!");
      return;
    }
    
    if (!trimmedContent) {
      toast.error("உள்ளடக்கம் தேவை!");
      return;
    }
    
    setLoading(true);

    try {
      // Create FormData object to handle file upload
      const formData = new FormData();
      formData.append('title', trimmedTitle);
      formData.append('categoryId', formState.categoryId);
      formData.append('content', trimmedContent);

      if (formState.image) {
        formData.append('image', formState.image);
      }

      await saveBlogToAPI(formData);
      setLoading(false);
    } catch (error) {
      console.error("Error adding blog:", error);
      toast.error("வலைப்பதிவு சேர்ப்பதில் பிழை. மீண்டும் முயற்சிக்கவும்.");
      setLoading(false);
    }
  };

  return {
    formState,
    loading,
    categories,
    isLoadingCategories,
    error,
    isSuccessModalOpen,
    handleInputChange,
    handleImageChange,
    handleSubmit,
    handleCloseModal
  };
}