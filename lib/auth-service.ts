// lib/auth-service.ts
import { getUser } from "@civic/auth-web3/nextjs";
import { db } from "@/lib/db";

//
// 1. STRICTLY AUTHENTICATED: throws if not logged in or wallet missing
//
export const getSelf = async () => {
  let self;
  try {
    self = await getUser();
  } catch (err: any) {
    // network/feature‑disabled errors bubble up here
    console.error("Civic Auth getUser failed:", err);
    throw new Error("Authentication failed");
  }

  if (!self?.id) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { externalUserId: self.id },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

//
// 2. PUBLIC PROFILE LOOKUP: never calls getUser(), so it’s safe for any visitor
//
export const getPublicUserByUsername = async (username: string) => {
  const user = await db.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

//
// 3. OWNER‑ONLY PROFILE: throws if logged‑in user doesn’t match the username
//
export const getSelfByUsername = async (username: string) => {
  let self;
  try {
    self = await getUser();
  } catch (err: any) {
    console.error("Civic Auth getUser failed:", err);
    throw new Error("Authentication failed");
  }

  if (!self?.id) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (self.id !== user.externalUserId) {
    throw new Error("Unauthorized");
  }

  return user;
};
