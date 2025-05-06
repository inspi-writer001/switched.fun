"use server";

import { User } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";

export const updateUser = async (values: Partial<User>) => {
  const self = await getSelf();

  const validData = {
    bio: values.bio,
  };

  const user = await db.user.update({
    where: { id: self.id },
    data: { ...validData }
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
            name: `${data.username.toLocaleLowerCase() || 'User'}'s stream`,
          },
        },
      },
    });
  
    return user
  } catch (e) {
    throw new Error("Something went wrong!");
  }
}

export const getSelfById = async (id: string) => {
  const user = await db.user.findUnique({
    where: { externalUserId: id }
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}