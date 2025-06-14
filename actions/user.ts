"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";
import { invalidateUserCache } from "@/lib/user-service";
import { getCachedData } from "@/lib/redis";

// Input validation schemas
const createUserSchema = z.object({
  externalUserId: z.string().min(1, "External user ID is required"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  imageUrl: z.string().url("Invalid image URL"),
});

const updateUserSchema = z.object({
  id: z.string().min(1),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

// Rate limiting helper
const rateLimitKey = (userId: string, action: string) =>
  `rate_limit:${action}:${userId}`;

async function checkRateLimit(
  userId: string,
  action: string,
  limit: number = 5,
  window: number = 300
) {
  const key = rateLimitKey(userId, action);
  const current = await getCachedData({
    key,
    ttl: window,
    fetchFn: async () => 0,
  });

  if (current >= limit) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }

  // Increment counter
  await getCachedData({
    key,
    ttl: window,
    fetchFn: async () => (current as number) + 1,
  });
}

// ————————————————
// Create a brand‑new user
// ————————————————
export const createUser = async (data: {
  externalUserId: string;
  username: string;
  imageUrl: string;
}) => {
  try {
    // Validate input
    const validatedData = createUserSchema.parse(data);

    // Check if username is already taken
    const existingUser = await db.user.findFirst({
      where: {
        username: {
          equals: validatedData.username.toLowerCase(),
          mode: "insensitive",
        },
      },
    });

    if (existingUser) {
      throw new Error("Username is already taken");
    }

    // Create user with transaction for atomicity
    const user = await db.$transaction(async (tx) => {
      return tx.user.create({
        data: {
          externalUserId: validatedData.externalUserId,
          username: validatedData.username.toLowerCase(),
          imageUrl: validatedData.imageUrl,
          stream: {
            create: {
              name: `${validatedData.username.toLowerCase()}'s stream`,
            },
          },
        },
        include: {
          stream: true,
        },
      });
    });

    // Batch revalidate paths
    const pathsToRevalidate = [
      `/u/${user.username}`,
      `/@${user.username}`,
      "/", // Home page to show new user
    ];

    await Promise.all(pathsToRevalidate.map((path) => revalidatePath(path)));

    return user;
  } catch (err: any) {
    console.error("[createUser] error:", err);

    // Return user-friendly error messages
    if (err instanceof z.ZodError) {
      throw new Error(err.errors[0]?.message || "Invalid input data");
    }

    if (err.message.includes("Unique constraint")) {
      throw new Error("Username or external ID already exists");
    }

    throw new Error(err.message || "Failed to create user");
  }
};

// ————————————————
// Update an existing user's username or bio
// ————————————————
export const updateUser = async (values: {
  id: string;
  username?: string;
  bio?: string;
}) => {
  try {
    // Validate input
    const validatedValues = updateUserSchema.parse(values);

    // Get current user and apply rate limiting
    const self = await getSelf();
    await checkRateLimit(self.id, "update_user", 10, 300); // 10 updates per 5 minutes

    const updateData: { username?: string; bio?: string } = {};

    // Check if username is available before updating
    if (validatedValues.username) {
      const existingUser = await db.user.findFirst({
        where: {
          username: {
            equals: validatedValues.username.toLowerCase(),
            mode: "insensitive",
          },
          NOT: { id: self.id },
        },
      });

      if (existingUser) {
        throw new Error("Username is already taken");
      }

      updateData.username = validatedValues.username.toLowerCase();
    }

    if (validatedValues.bio !== undefined) {
      updateData.bio = validatedValues.bio;
    }

    if (Object.keys(updateData).length === 0) {
      return self;
    }

    // Use transaction for atomic update
    const updated = await db.$transaction(async (tx) => {
      return tx.user.update({
        where: { id: self.id },
        data: updateData,
        include: {
          stream: true,
          _count: {
            select: {
              followedBy: true,
            },
          },
        },
      });
    });

    // Batch cache invalidation and path revalidation
    const cacheInvalidations = [invalidateUserCache(self.id, self.username)];

    const pathsToRevalidate = [
      `/u/${updated.username}`,
      `/@${updated.username}`,
    ];

    if (validatedValues.username) {
      cacheInvalidations.push(
        invalidateUserCache(self.id, validatedValues.username)
      );
      pathsToRevalidate.push(`/u/${self.username}`, `/@${self.username}`);
    }

    // Execute all operations in parallel
    await Promise.all([
      ...cacheInvalidations,
      ...pathsToRevalidate.map((path) => revalidatePath(path)),
    ]);

    return updated;
  } catch (err: any) {
    console.error("[updateUser] error:", err);

    if (err instanceof z.ZodError) {
      throw new Error(err.errors[0]?.message || "Invalid input data");
    }

    throw new Error(err.message || "Failed to update user");
  }
};

// ————————————————
// Fetch the DB user by their external (Civic) ID with caching
// ————————————————
export const getSelfById = async (externalUserId: string) => {
  try {
    // Validate input
    if (!externalUserId || typeof externalUserId !== "string") {
      throw new Error("Invalid external user ID");
    }

    const user = await getCachedData({
      key: `user:external:${externalUserId}`,
      ttl: 300, // 5 minutes
      fetchFn: async () => {
        return db.user.findUnique({
          where: { externalUserId },
          include: {
            stream: true,
          },
        });
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (err: any) {
    console.error("[getSelfById] error:", err);
    throw new Error(err.message || "Failed to fetch user");
  }
};
