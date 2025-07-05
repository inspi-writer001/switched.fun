import { useQuery } from "@tanstack/react-query";
import type { 
  Category, 
  CategoryLight, 
  CategoryWithSubCategories, 
  SubCategory,
  CategoriesResponse 
} from "@/types/category";

interface UseCategoriesOptions {
  includeInactive?: boolean;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

interface UseCategoriesLightOptions {
  includeInactive?: boolean;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

interface UseCategoryWithSubCategoriesOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

interface UseSubCategoriesBySlugOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

// Hook for getting all categories with subcategories
export function useCategories(options: UseCategoriesOptions = {}) {
  const {
    includeInactive = false,
    enabled = true,
    staleTime = 10 * 60 * 1000, // 10 minutes
    cacheTime = 20 * 60 * 1000, // 20 minutes
  } = options;

  return useQuery({
    queryKey: ["categories", { includeInactive }],
    queryFn: async (): Promise<Category[]> => {
      const params = new URLSearchParams();
      if (includeInactive) params.append("includeInactive", "true");

      const response = await fetch(`/api/categories?${params.toString()}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch categories");
      }

      const result: CategoriesResponse<Category[]> = await response.json();
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch categories");
      }

      return result.data;
    },
    enabled,
    staleTime,
    gcTime: cacheTime,
    retry: (failureCount, error) => {
      return failureCount < 3;
    },
  });
}

// Hook for getting light categories (just names and IDs)
export function useCategoriesLight(options: UseCategoriesLightOptions = {}) {
  const {
    includeInactive = false,
    enabled = true,
    staleTime = 10 * 60 * 1000, // 10 minutes
    cacheTime = 20 * 60 * 1000, // 20 minutes
  } = options;

  return useQuery({
    queryKey: ["categories", "light", { includeInactive }],
    queryFn: async (): Promise<CategoryLight[]> => {
      const params = new URLSearchParams();
      params.append("light", "true");
      if (includeInactive) params.append("includeInactive", "true");

      const response = await fetch(`/api/categories?${params.toString()}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch categories");
      }

      const result: CategoriesResponse<CategoryLight[]> = await response.json();
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch categories");
      }

      return result.data;
    },
    enabled,
    staleTime,
    gcTime: cacheTime,
    retry: (failureCount, error) => {
      return failureCount < 3;
    },
  });
}

// Hook for getting a specific category with subcategories
export function useCategoryWithSubCategories(
  categoryId: string | undefined,
  options: UseCategoryWithSubCategoriesOptions = {}
) {
  const {
    enabled = true,
    staleTime = 10 * 60 * 1000, // 10 minutes
    cacheTime = 20 * 60 * 1000, // 20 minutes
  } = options;

  return useQuery({
    queryKey: ["category", "with-subs", categoryId],
    queryFn: async (): Promise<CategoryWithSubCategories> => {
      if (!categoryId) {
        throw new Error("Category ID is required");
      }

      const response = await fetch(`/api/categories/${categoryId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch category");
      }

      const result: CategoriesResponse<CategoryWithSubCategories> = await response.json();
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch category");
      }

      return result.data;
    },
    enabled: enabled && !!categoryId,
    staleTime,
    gcTime: cacheTime,
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
      if (error instanceof Error && error.message.includes("Category not found")) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Hook for getting subcategories by category slug
export function useSubCategoriesBySlug(
  categorySlug: string | undefined,
  options: UseSubCategoriesBySlugOptions = {}
) {
  const {
    enabled = true,
    staleTime = 10 * 60 * 1000, // 10 minutes
    cacheTime = 20 * 60 * 1000, // 20 minutes
  } = options;

  return useQuery({
    queryKey: ["subcategories", "by-slug", categorySlug],
    queryFn: async (): Promise<SubCategory[]> => {
      if (!categorySlug) {
        throw new Error("Category slug is required");
      }

      const response = await fetch(`/api/categories/slug/${categorySlug}/subcategories`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch subcategories");
      }

      const result: CategoriesResponse<SubCategory[]> = await response.json();
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch subcategories");
      }

      return result.data;
    },
    enabled: enabled && !!categorySlug,
    staleTime,
    gcTime: cacheTime,
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
      if (error instanceof Error && error.message.includes("Category not found")) {
        return false;
      }
      return failureCount < 3;
    },
  });
} 