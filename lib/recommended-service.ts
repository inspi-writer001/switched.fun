import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";

// Cache recommendations for 30 seconds to reduce DB load
const CACHE_TTL = 30 * 1000;
const cache = new Map<string, { data: any[]; timestamp: number }>();

export const getRecommended = async () => {
  let userId: string | null = null;

  try {
    const self = await getSelf();
    userId = self.id;
  } catch {
    userId = null;
  }

  // Check cache first
  const cacheKey = userId || "anonymous";
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const recommendations = await getRecommendationsOptimized(userId);

    // Cache the results
    cache.set(cacheKey, {
      data: recommendations,
      timestamp: Date.now(),
    });

    return recommendations;
  } catch (err) {
    console.error("getRecommended failed:", err);
    return [];
  }
};

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
          select: { isLive: true },
        },
      },
      orderBy: [{ stream: { isLive: "desc" } }, { createdAt: "desc" }],
      take: 10,
    });
    return users.map((user) => ({
      ...user,
      stream: user.stream || { isLive: false },
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
          select: { isLive: true },
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
      stream: user.stream || { isLive: false },
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
        select: { isLive: true },
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
          select: { isLive: true },
        },
      },
      orderBy: [{ stream: { isLive: "desc" } }, { createdAt: "desc" }],
      take: 10,
    });

    return fallbackUsers.map((user) => ({
      ...user,
      stream: user.stream || { isLive: false },
    }));
  }

  return result.map((user) => ({
    ...user,
    stream: user.stream || { isLive: false },
  }));
}

// Clean up cache periodically (run every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    const entries = Array.from(cache.entries());
    for (const [key, value] of entries) {
      if (now - value.timestamp > CACHE_TTL) {
        cache.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}
