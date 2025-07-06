"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { createBrowserStream, startBrowserStream, stopBrowserStream, updateBrowserStreamTitle } from "@/lib/browser-stream-service";
import { createHostToken } from "@/actions/token";

const CreateBrowserStreamSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100, "Title must be less than 100 characters"),
});

const UpdateTitleSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100, "Title must be less than 100 characters"),
});

export const createBrowserStreamAction = async (data: z.infer<typeof CreateBrowserStreamSchema>) => {
  try {
    const validated = CreateBrowserStreamSchema.parse(data);
    const result = await createBrowserStream(validated);
    
    if (result.success) {
      return { success: true, stream: result.stream };
    } else {
      return { success: false, error: "Failed to create browser stream" };
    }
  } catch (error: any) {
    console.error("[createBrowserStreamAction] error:", error);
    return { success: false, error: error.message || "Failed to create browser stream" };
  }
};

export const startBrowserStreamAction = async () => {
  try {
    const result = await startBrowserStream();
    
    if (result.success) {
      return { success: true, stream: result.stream };
    } else {
      return { success: false, error: "Failed to start browser stream" };
    }
  } catch (error: any) {
    console.error("[startBrowserStreamAction] error:", error);
    return { success: false, error: error.message || "Failed to start browser stream" };
  }
};

export const stopBrowserStreamAction = async () => {
  try {
    const result = await stopBrowserStream();
    
    if (result.success) {
      return { success: true, stream: result.stream };
    } else {
      return { success: false, error: "Failed to stop browser stream" };
    }
  } catch (error: any) {
    console.error("[stopBrowserStreamAction] error:", error);
    return { success: false, error: error.message || "Failed to stop browser stream" };
  }
};

export const updateBrowserStreamTitleAction = async (data: z.infer<typeof UpdateTitleSchema>) => {
  try {
    const validated = UpdateTitleSchema.parse(data);
    const result = await updateBrowserStreamTitle(validated.title);
    
    if (result.success) {
      return { success: true, stream: result.stream };
    } else {
      return { success: false, error: "Failed to update stream title" };
    }
  } catch (error: any) {
    console.error("[updateBrowserStreamTitleAction] error:", error);
    return { success: false, error: error.message || "Failed to update stream title" };
  }
};

export const getHostTokenAction = async () => {
  try {
    // This will be called from the client to get a host token for browser streaming
    // We need to get the current user's ID to create the token
    const { getSelf } = await import("@/lib/auth-service");
    const self = await getSelf();
    const token = await createHostToken(self.id);
    return { success: true, token };
  } catch (error: any) {
    console.error("[getHostTokenAction] error:", error);
    return { success: false, error: error.message || "Failed to get host token" };
  }
}; 