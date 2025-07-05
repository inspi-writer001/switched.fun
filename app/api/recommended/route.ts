import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@civic/auth-web3/nextjs";
import { db } from "@/lib/db";
import { getCachedData } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    let userId: string | null = null;

    // Try to get authenticated user
    try {
      const self = await getUser();
      if (self?.id) {
        userId = self.id;
      }
    } catch (err: any) {
      // User is not authenticated, continue with null userId
      console.log("User not authenticated, showing public recommendations");
    }

    // Get recommendations with caching
    const cacheKey = userId ? `recommended:authenticated:${userId}` : "recommended:public";
    
    const recommendations = await getCachedData({
      key: cacheKey,
      ttl: 30, // 30 seconds cache for recommendations
      fetchFn: async () => {
        return getRecommendationsOptimized(userId);
      },
    });

    return NextResponse.json(recommendations);
  } catch (err: any) {
    console.error("[GET /api/recommended] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}

async function getRecommendationsOptimized(userId: string | null) {
  if (!userId) {
    // Anonymous users - simple query
    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        imageUrl: true,
        externalUserId: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
        stream: {
          select: { 
            isLive: true,
            name: true,
            thumbnailUrl: true,
          },
        },
      },
      orderBy: [{ stream: { isLive: "desc" } }, { createdAt: "desc" }],
      take: 10,
    });
    return users.map((user) => ({
      ...user,
      stream: user.stream || { isLive: false, name: null, thumbnailUrl: null },
    }));
  }

  // For authenticated users - parallel queries for efficiency
  const [userInterests, potentialUsers] = await Promise.all([
    // Get user's interests
    db.user.findUnique({
      where: { id: userId },
      select: {
        interests: {
          select: {
            subCategory: {
              select: { slug: true },
            },
          },
        },
      },
    }),
    // Get potential recommendations (excluding current user, followers, and blocked users)
    db.user.findMany({
      where: {
        AND: [
          { NOT: { id: userId } },
          { NOT: { followedBy: { some: { followerId: userId } } } },
          { NOT: { blocking: { some: { blockedId: userId } } } },
        ],
      },
      select: {
        id: true,
        username: true,
        imageUrl: true,
        externalUserId: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
        stream: {
          select: { 
            isLive: true,
            name: true,
            thumbnailUrl: true,
          },
        },
      },
      orderBy: [{ stream: { isLive: "desc" } }, { createdAt: "desc" }],
      take: 50, // Get more for better interest matching
    }),
  ]);

  const userInterestSlugs =
    userInterests?.interests.map((i) => i.subCategory.slug) || [];

  if (userInterestSlugs.length === 0) {
    // No interests - return first 10
    return potentialUsers.slice(0, 10).map((user) => ({
      ...user,
      stream: user.stream || { isLive: false, name: null, thumbnailUrl: null },
    }));
  }

  // Get users with matching interests
  const usersWithMatchingInterests = await db.user.findMany({
    where: {
      AND: [
        { NOT: { id: userId } },
        { NOT: { followedBy: { some: { followerId: userId } } } },
        { NOT: { blocking: { some: { blockedId: userId } } } },
        {
          interests: {
            some: {
              subCategory: {
                slug: { in: userInterestSlugs },
              },
            },
          },
        },
      ],
    },
    select: {
      id: true,
      username: true,
      imageUrl: true,
      externalUserId: true,
      bio: true,
      createdAt: true,
      updatedAt: true,
      stream: {
        select: { 
          isLive: true,
          name: true,
          thumbnailUrl: true,
        },
      },
    },
    orderBy: [{ stream: { isLive: "desc" } }, { createdAt: "desc" }],
    take: 8, // Prioritize interest matches
  });

  // Fill remaining slots with general recommendations
  const excludeIds = usersWithMatchingInterests.map((user) => user.id);
  const remainingCount = 10 - usersWithMatchingInterests.length;

  const generalUsers =
    remainingCount > 0
      ? potentialUsers
          .filter((user) => !excludeIds.includes(user.id))
          .slice(0, remainingCount)
      : [];

  const result = [...usersWithMatchingInterests, ...generalUsers];

  // Final safety check - if still no results, try a basic query
  if (result.length === 0) {
    const fallbackUsers = await db.user.findMany({
      where: {
        NOT: { id: userId },
      },
      select: {
        id: true,
        username: true,
        imageUrl: true,
        externalUserId: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
        stream: {
          select: { 
            isLive: true,
            name: true,
            thumbnailUrl: true,
          },
        },
      },
      orderBy: [{ stream: { isLive: "desc" } }, { createdAt: "desc" }],
      take: 10,
    });

    return fallbackUsers.map((user) => ({
      ...user,
      stream: user.stream || { isLive: false, name: null, thumbnailUrl: null },
    }));
  }

  return result.map((user) => ({
    ...user,
    stream: user.stream || { isLive: false, name: null, thumbnailUrl: null },
  }));
} 