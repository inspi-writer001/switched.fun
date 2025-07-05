import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCachedData } from "@/lib/redis";

// Cache for 10 minutes since categories don't change frequently
const CATEGORIES_CACHE_TTL = 600; // 10 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";
    const light = searchParams.get("light") === "true";

    if (light) {
      // Handle light categories request
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

      return NextResponse.json({
        success: true,
        data: categories
      });
    }

    // Handle full categories request
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

    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error("[GET /api/categories] Database error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
} 