import { FieldValue, Timestamp } from 'firebase/firestore';

export interface Category {
    id: string;
    name: string;
  }
  
  export interface BlogPost {
    title: string;
    categoryId: string;
    content: string;
    createdAt: FieldValue | Timestamp; // Updated type
    isVerified: boolean;
    slug: string;
    imageUrl?: string;
  }
  
  export interface CategoryBlogData {
    blogId: string;
    title: string;
    content: string;
    imageUrl: string | null;
    createdAt: FieldValue | Timestamp; 
    isVerified: boolean;
    slug: string;
  }
  
  export interface FormState {
    title: string;
    categoryId: string;
    content: string;
    image: File | null;
    imagePreview: string | null;
  }