"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";

// ————————————————
// Create a brand‑new user
// ————————————————
export const createUser = async (data: {
  externalUserId: string;
  username: string;
  imageUrl: string;
}) => {
  try {
    const user = await db.user.create({
      data: {
        externalUserId: data.externalUserId,
        username: data.username.toLowerCase(),
        // FIXED: was mistakenly `data.username`
        imageUrl: data.imageUrl,
        stream: {
          create: {
            name: `${data.username.toLowerCase() || "user"}'s stream`,
          },
        },
      },
    });

    // re‑cache your profile pages so the new user is immediately visible
    revalidatePath(`/u/${user.username}`);
    revalidatePath(`/@${user.username}`);

    return user;
  } catch (err: any) {
    console.error("[createUser] DB error:", err);
    // rethrow the original message so you can see the real cause in the client
    throw new Error(err.message || "Create user failed");
  }
};

// ————————————————
// Update an existing user’s username or bio
// ————————————————
export const updateUser = async (values: {
  username?: string;
  bio?: string;
}) => {
  try {
    // re‑validate auth & get the currently logged‑in user
    const self = await getSelf();

    const updateData: { username?: string; bio?: string } = {};

    if (values.username) {
      updateData.username = values.username.toLowerCase();
    }

    // Allow updating bio to an empty string
    if (values.bio !== undefined) {
      updateData.bio = values.bio;
    }

    if (Object.keys(updateData).length === 0) {
      // No data to update
      return self;
    }

    const updated = await db.user.update({
      where: { id: self.id },
      data: updateData,
    });

    // re‑cache the old and new username paths if username was updated
    if (values.username) {
      revalidatePath(`/u/${self.username}`);
      revalidatePath(`/u/${updated.username}`);
      revalidatePath(`/@${self.username}`);
      revalidatePath(`/@${updated.username}`);
    }

    // Revalidate the current user's path regardless of username change
    revalidatePath(`/u/${updated.username}`);
    revalidatePath(`/@${updated.username}`);

    return updated;
  } catch (err: any) {
    console.error("[updateUser] error:", err);
    throw new Error(err.message || "Update user failed");
  }
};

// ————————————————
// Fetch the DB user by their external (Civic) ID
// ————————————————
export const getSelfById = async (externalUserId: string) => {
  try {
    const user = await db.user.findUnique({
      where: { externalUserId },
    });
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (err: any) {
    console.error("[getSelfById] error:", err);
    throw new Error(err.message || "Fetch user by ID failed");
  }
};
