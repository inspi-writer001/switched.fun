import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCachedData } from "@/lib/redis";

// Cache for 10 minutes since categories don't change frequently
const CATEGORIES_CACHE_TTL = 600; // 10 minutes

export async function GET(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { categoryId } = params;

    // Validate input
    if (!categoryId || typeof categoryId !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid category ID" },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error("[GET /api/categories/[categoryId]] Database error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch category" },
      { status: 500 }
    );
  }
} 