// useBlogForm.ts
'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db } from '@/lib/firebase';
import { BlogPost, Category, CategoryBlogData, FormState } from '../model/add-blog';
import { toast } from 'react-toastify';


export default function useBlogForm() {
  // Form state
  const [formState, setFormState] = useState<FormState>({
    title: '',
    categoryId: '',
    content: '',
    image: null,
    imagePreview: null
  });
  
  // Other state
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Fetch categories from Firestore for the dropdown
  useEffect(() => {
    setIsLoadingCategories(true);
    setError(null);
    
    try {
      console.log("Fetching categories from Firestore...");
      
      const q = query(
        collection(db, "categories"),
        orderBy("name", "asc") // Order alphabetically
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        console.log(`Got ${querySnapshot.size} categories`);
        
        const categoriesData: Category[] = [];
        querySnapshot.forEach((doc) => {
          categoriesData.push({
            id: doc.id,
            name: doc.data().name,
          });
        });
        
        console.log("Categories loaded:", categoriesData);
        setCategories(categoriesData);
        setIsLoadingCategories(false);
        
        // Set default category if available
        if (categoriesData.length > 0 && !formState.categoryId) {
          setFormState(prev => ({
            ...prev,
            categoryId: categoriesData[0].id
          }));
        }
      }, (error) => {
        console.error("Error fetching categories:", error);
        setError(`Failed to load categories: ${error.message}`);
        toast.error("Failed to load categories");
        setIsLoadingCategories(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Exception when setting up category listener:", error);
      setError(`Exception when fetching categories: ${error}`);
      setIsLoadingCategories(false);
    }
  }, [formState.categoryId]);

  // Generate a slug from the title
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim(); // Trim leading/trailing spaces
  };

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

  // Function to close modal and reset form
  const handleCloseModal = () => {
    setIsSuccessModalOpen(false);
  };

  // Function to save blog to Firestore
  const saveBlogToFirestore = async (blogData: BlogPost) => {
    try {
      // Store the blog post in the main "blogs" collection first
      const blogDocRef = await addDoc(collection(db, "blogs"), blogData);
      
      // Also store a reference to this blog in the category's blogs subcollection
      const categoryBlogData: CategoryBlogData = {
        blogId: blogDocRef.id,
        title: blogData.title,
        content: blogData.content.substring(0, 200) + (blogData.content.length > 200 ? '...' : ''), // Store a preview
        imageUrl: blogData.imageUrl || null, // Handle the case when no image
        createdAt: blogData.createdAt,
        isVerified: blogData.isVerified,
        slug: blogData.slug
      };
      
      await addDoc(collection(db, "categories", blogData.categoryId, "blogs"), categoryBlogData);
      
      // Reset form
      setFormState({
        title: '',
        categoryId: categories.length > 0 ? categories[0].id : '',
        content: '',
        image: null,
        imagePreview: null
      });
      
      // If you have a file input ref, you can reset it
      if (document.getElementById('imageInput') as HTMLInputElement) {
        (document.getElementById('imageInput') as HTMLInputElement).value = '';
      }
      
      // Show success modal instead of toast
      setIsSuccessModalOpen(true);
      setLoading(false);
    } catch (error) {
      console.error("Error saving blog post to Firestore:", error);
      toast.error("வலைப்பதிவை சேமிப்பதில் பிழை");
      setLoading(false);
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
      // Generate slug from title
      const slug = generateSlug(trimmedTitle);
      
      // Create blog post object
      const blogData: BlogPost = {
        title: trimmedTitle,
        categoryId: formState.categoryId,
        content: trimmedContent,
        createdAt: serverTimestamp(),
        isVerified: false, // Initially set to not verified
        slug: slug
      };
      
      // Handle image upload if an image was selected
      if (formState.image) {
        // 1. Upload image to Firebase Storage
        const storage = getStorage();
        const timestamp = new Date().getTime();
        const imageFileName = `blog_images/${formState.categoryId}/${timestamp}_${formState.image.name}`;
        const storageRef = ref(storage, imageFileName);
        
        const uploadTask = uploadBytesResumable(storageRef, formState.image);
        
        // Handle the upload and save blog post
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Progress monitoring (optional)
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload is ${progress}% done`);
          },
          (error) => {
            // Error handling
            console.error("Error uploading image:", error);
            toast.error("படம் பதிவேற்றுவதில் பிழை");
            setLoading(false);
          },
          async () => {
            // Upload completed successfully
            try {
              // Get the download URL
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              
              // Add the image URL to the blog data
              blogData.imageUrl = downloadURL;
              
              // Save the blog data to Firestore
              await saveBlogToFirestore(blogData);
            } catch (error) {
              console.error("Error saving blog post:", error);
              toast.error("வலைப்பதிவை சேமிப்பதில் பிழை");
              setLoading(false);
            }
          }
        );
      } else {
        // No image, just save the blog data
        await saveBlogToFirestore(blogData);
      }
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