"use server";

import { getSelf } from "@/lib/auth-service";
import { getStreamByUserId } from "@/lib/stream-service";

export async function getStreamData() {
  try {
    const self = await getSelf();
    const stream = await getStreamByUserId(self.id);

    if (!stream) {
      return { error: "Stream not found" };
    }

    return { stream };
  } catch (error) {
    console.error("Failed to fetch stream data:", error);
    return { error: "Failed to load stream data" };
  }
}
