export interface Category {
    id: string;
    title: string;
    description: string;
}
  
export interface BlogPost {
  title: string;
  categoryId: string;
  content: string;
  imageUrl?: string;
  createdAt?: Date;
  isVerified?: boolean;
  slug?: string;
}
  
export interface CategoryBlogData {
  blogId: string;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date; 
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