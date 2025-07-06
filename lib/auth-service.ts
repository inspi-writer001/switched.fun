// lib/auth-service.ts

import { getUser } from "@civic/auth-web3/nextjs";
import { db } from "@/lib/db";
// import { cookies } from "next/headers";
//
// 1. STRICTLY AUTHENTICATED: throws if not logged in or wallet missing
//
export const getSelf = async () => {
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
    where: { externalUserId: self.id },
    include: {
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
};

//
// 2. PUBLIC PROFILE LOOKUP: case‑insensitive, safe for any visitor
//
export const getPublicUserByUsername = async (username: string) => {
  const user = await db.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
  });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

//
// 3. OWNER‑ONLY PROFILE: case‑insensitive + strict Civic auth match
//
export const getSelfByUsername = async (username: string) => {
  // 1) Fetch by username, ignoring case
  const user = await db.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
    include: { stream: true },
  });
  if (!user) {
    throw new Error("User not found");
  }

  // 2) Verify Civic auth
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
  if (self.id !== user.externalUserId) {
    throw new Error("Unauthorized");
  }

  return user;
};

export const getSelfFromApi = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/user/me`;
  
  const response = await fetch(url, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }
  
  return response.json();
};

export const getSelfByUsernameFromApi = async (username: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/user/by-username/${username}`;
  
  const response = await fetch(url, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }
  
  return response.json();
};

export const getSelfByExternalIdFromApi = async (externalId: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/user/by-external-id/${externalId}`;
  
  const response = await fetch(url, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }
  
  return response.json();
};

export const getPublicUserByUsernameFromApi = async (username: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const url = baseUrl ? `${baseUrl}/api/user/public/${username}` : `/api/user/public/${username}`;
  
  const response = await fetch(url, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }
  
  return response.json();
};
