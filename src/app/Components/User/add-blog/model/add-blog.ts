import { FieldValue, Timestamp } from 'firebase/firestore';

export interface Category {
    id: string;
    title: string;
    description: string;
}
  
export interface BlogPost {
  title: string;
  categoryId: string;
  content: string;
  imageUrl?: string; // Make it optional with string type only
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

export interface CategoryResponse {
  id: string;
  title: string;
  description: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T[];
  message?: string;
}