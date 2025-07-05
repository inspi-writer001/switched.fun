import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCachedData } from "@/lib/redis";

// Cache for 10 minutes since categories don't change frequently
const CATEGORIES_CACHE_TTL = 600; // 10 minutes

export async function GET(
  request: NextRequest,
  { params }: { params: { categorySlug: string } }
) {
  try {
    const { categorySlug } = params;

    // Validate input
    if (!categorySlug || typeof categorySlug !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid category slug" },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("[GET /api/categories/slug/[categorySlug]/subcategories] Database error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sub-categories" },
      { status: 500 }
    );
  }
} 