"use server";

import { User } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";

export const updateUser = async (values: {
  id?: string;
  username?: string;
  bio?: string;
}) => {
  // re‑fetch the authenticated user
  const self = await getSelf();

  // Build only the fields you actually need to update
  const data: Partial<User> = {};
  if (values.username) {
    data.username = values.username.toLowerCase();
  }
  if (values.bio) {
    data.bio = values.bio;
  }

  const user = await db.user.update({
    where: { id: self.id },
    data,
  });

  revalidatePath(`/${self.username}`);
  revalidatePath(`/u/${self.username}`);

  return user;
};

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
        imageUrl: data.username,
        stream: {
          create: {
            name: `${data.username.toLocaleLowerCase() || "User"}'s stream`,
          },
        },
      },
    });

    return user;
  } catch (e) {
    throw new Error("Something went wrong!");
  }
};

export const getSelfById = async (id: string) => {
  const user = await db.user.findUnique({
    where: { externalUserId: id },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};
