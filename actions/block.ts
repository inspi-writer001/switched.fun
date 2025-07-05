"use server";

import { blockUser, unblockUser } from "@/lib/block-service";
import { revalidatePath } from "next/cache";

export async function block(blockedId: string) {
  try {
    await blockUser(blockedId);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error blocking user:", error);
    return { error: "Failed to block user" };
  }
}

export async function unblock(blockedId: string) {
  try {
    await unblockUser(blockedId);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error unblocking user:", error);
    return { error: "Failed to unblock user" };
  }
}
