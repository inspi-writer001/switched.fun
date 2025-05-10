import { db } from "@/lib/db";

/**
 * Fetch a user by username, matching case-insensitively.
 * Throws if no user is found.
 */
export const getUserByUsername = async (username: string) => {
  const user = await db.user.findFirst({
    where: {
      username: {
        equals: username,
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
    throw new Error("User not found");
  }

  return user;
};

/**
 * Fetch a user by ID.
 * Throws if no user is found.
 */
export const getUserById = async (id: string) => {
  const user = await db.user.findUnique({
    where: { id },
    include: {
      stream: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};
