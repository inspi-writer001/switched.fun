"use server"

// This file has been migrated to API routes for better performance
// See: app/api/categories/route.ts
// See: app/api/categories/[categoryId]/route.ts  
// See: app/api/categories/slug/[categorySlug]/subcategories/route.ts
// See: hooks/use-categories.ts for TanStack Query hooks

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
