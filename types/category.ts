export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  viewers: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  viewers: number;
  subCategories: SubCategory[];
}

export interface CategoryLight {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryWithSubCategories {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  viewers: number;
  subCategories: SubCategory[];
}

export interface CategoriesResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
} 