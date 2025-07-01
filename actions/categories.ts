"use server"

import { db } from "@/lib/db"
import { getCachedData } from "@/lib/redis"

// Cache for 10 minutes since categories don't change frequently
const CATEGORIES_CACHE_TTL = 600; // 10 minutes

export async function getCategories(includeInactive: boolean = false) {
  try {
    const cacheKey = `categories:${includeInactive ? 'all' : 'active'}`;
    
    const categories = await getCachedData({
      key: cacheKey,
      ttl: CATEGORIES_CACHE_TTL,
      fetchFn: async () => {
        // Optimized query with selective fields and proper ordering
        return db.category.findMany({
          where: includeInactive ? {} : { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            viewers: true,
            subCategories: {
              where: includeInactive ? {} : { isActive: true },
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                viewers: true,
              },
              orderBy: { name: "asc" }
            }
          },
          orderBy: { name: "asc" }
        });
      }
    });

    return {
      success: true,
      data: categories
    }
  } catch (error) {
    console.error("[getCategories] Database error:", error);
    return {
      success: false,
      error: "Failed to fetch categories"
    }
  }
}

// Optimized function for getting just category names and IDs (faster for dropdowns)
export async function getCategoriesLight(includeInactive: boolean = false) {
  try {
    const cacheKey = `categories:light:${includeInactive ? 'all' : 'active'}`;
    
    const categories = await getCachedData({
      key: cacheKey,
      ttl: CATEGORIES_CACHE_TTL,
      fetchFn: async () => {
        return db.category.findMany({
          where: includeInactive ? {} : { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
          },
          orderBy: { name: "asc" }
        });
      }
    });

    return {
      success: true,
      data: categories
    }
  } catch (error) {
    console.error("[getCategoriesLight] Database error:", error);
    return {
      success: false,
      error: "Failed to fetch categories"
    }
  }
}

export async function getCategoryWithSubCategories(categoryId: string) {
  try {
    const cacheKey = `category:${categoryId}:with-subs`;
    
    const category = await getCachedData({
      key: cacheKey,
      ttl: CATEGORIES_CACHE_TTL,
      fetchFn: async () => {
        return db.category.findUnique({
          where: { id: categoryId },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            viewers: true,
            subCategories: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                viewers: true,
              },
              orderBy: { name: "asc" }
            }
          }
        });
      }
    });

    if (!category) {
      return {
        success: false,
        error: "Category not found"
      }
    }

    return {
      success: true,
      data: category
    }
  } catch (error) {
    console.error("[getCategoryWithSubCategories] Database error:", error);
    return {
      success: false,
      error: "Failed to fetch category"
    }
  }
}

export async function getSubCategoriesBySlug(categorySlug: string) {
  try {
    const cacheKey = `category:slug:${categorySlug}:subs`;
    
    const result = await getCachedData({
      key: cacheKey,
      ttl: CATEGORIES_CACHE_TTL,
      fetchFn: async () => {
        const category = await db.category.findUnique({
          where: { slug: categorySlug },
          select: {
            subCategories: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                viewers: true,
              },
              orderBy: { name: "asc" }
            }
          }
        });
        
        return category?.subCategories || null;
      }
    });

    if (!result) {
      return {
        success: false,
        error: "Category not found"
      }
    }

    return {
      success: true,
      data: result
    }
  } catch (error) {
    console.error("[getSubCategoriesBySlug] Database error:", error);
    return {
      success: false,
      error: "Failed to fetch sub-categories"
    }
  }
}

// Utility function to invalidate categories cache (call when categories are updated)
export async function invalidateCategoriesCache() {
  try {
    // Note: This would need to be implemented in your Redis utility
    // For now, we'll use a simple approach
    const keys = [
      'categories:active',
      'categories:all',
      'categories:light:active',
      'categories:light:all'
    ];
    
    // If using Redis, you could delete these keys
    // await redis.del(...keys);
    
    return { success: true };
  } catch (error) {
    console.error("[invalidateCategoriesCache] Error:", error);
    return { success: false };
  }
}
