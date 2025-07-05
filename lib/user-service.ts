import { db } from "@/lib/db";
import { getCachedData, invalidateCache } from "@/lib/redis";

/**
 * Fetch a user by username, matching case-insensitively.
 * Throws if no user is found.
 */
export const getUserByUsername = async (username: string) => {
  // Decode URL and trim whitespace to handle potential encoding issues
  const cleanUsername = decodeURIComponent(username).trim();

  try {
    const user = await db.user.findFirst({
      where: {
        username: {
          equals: cleanUsername,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        externalUserId: true,
        username: true,
        bio: true,
        imageUrl: true,
        stream: {
          select: {
            id: true,
            isLive: true,
            isChatDelayed: true,
            isChatEnabled: true,
            isChatFollowersOnly: true,
            thumbnailUrl: true,
            name: true,
          },
        },
        _count: {
          select: {
            followedBy: true,
          },
        },
      },
    });

    if (!user) {
      console.error("User not found");
      return null;
    }

    return user;
  } catch (error) {
    console.error("getUserByUsername Error:", error);
    throw error;
  }
};

/**
 * Fetch a user by ID.
 * Throws if no user is found.
 */
export const getUserById = async (id: string) => {
  return getCachedData({
    key: `user:id:${id}`,
    ttl: 300, // 5 minutes
    fetchFn: async () => {
      const user = await db.user.findFirst({
        where: {
          OR: [{ externalUserId: id }, { id: id }],
        },
        include: {
          stream: true,
          interests: {
            include: {
              subCategory: true,
            },
          },
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    },
  });
};

/**
 * Invalidate user cache
 */
export const invalidateUserCache = async (userId: string, username: string) => {
  await Promise.all([
    invalidateCache(`user:id:${userId}`),
    invalidateCache(`user:username:${username.toLowerCase()}`),
  ]);
};

export const getUserByUsernameFromApi = async (username: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const url = baseUrl ? `${baseUrl}/api/user/${encodeURIComponent(username)}` : `/api/user/${encodeURIComponent(username)}`;
  
  const response = await fetch(url, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }
  
  return response.json();
};

export const getUserByIdFromApi = async (id: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const url = baseUrl ? `${baseUrl}/api/user/${id}` : `/api/user/${id}`;
  
  const response = await fetch(url, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }
  
  return response.json();
};