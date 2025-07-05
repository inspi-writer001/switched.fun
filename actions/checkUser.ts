// app/actions/checkUser.ts
"use server";

import { getUserByIdFromApi } from "@/lib/user-service";

export type CheckUserResult = {
  user: { id: string; username?: string } | null;
  needsUsername: boolean;
  interests: {
    subCategory: {
      id: string;
      name: string;
    }
  }[];
};

export async function checkOrCreateUser(id: string): Promise<CheckUserResult> {
  try {
    const me = await getUserByIdFromApi(id);

    return {
      user: { id: me.id, username: me.username },
      needsUsername: !me.username,
      interests: me.interests,
    };
  } catch (err: any) {
    // If they’re not yet in your DB (first sign‑up), or no auth cookie:
    if (
      err.message === "User not found" ||
      err.message === "No authentication cookie found"
    ) {
      return { user: null, needsUsername: true, interests: [] };
    }
    // Unexpected error → bubble up
    throw err;
  }
}
