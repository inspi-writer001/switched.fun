"use server";

import { getSelf } from "@/lib/auth-service";
import { getStreamByUserId } from "@/lib/stream-service";

export async function getStreamData() {
  try {
    const self = await getSelf();
    console.log("self user", self);
    const stream = await getStreamByUserId(self.id);
    console.log("stream data", stream);

    if (!stream) {
      return { error: "Stream not found" };
    }

    return { stream };
  } catch (error) {
    console.error("Failed to fetch stream data:", error);
    return { error: "Failed to load stream data" };
  }
}
