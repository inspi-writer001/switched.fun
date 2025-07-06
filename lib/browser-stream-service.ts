import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";
import { revalidatePath } from "next/cache";

export interface CreateBrowserStreamData {
  title: string;
}

export const createBrowserStream = async (data: CreateBrowserStreamData) => {
  const self = await getSelf();

  // Check if user already has a stream
  const existingStream = await db.stream.findUnique({
    where: { userId: self.id },
  });

  if (existingStream) {
    // Update existing stream for browser streaming
    const updatedStream = await db.stream.update({
      where: { userId: self.id },
      data: {
        title: data.title,
        streamType: "BROWSER",
        isLive: false,
        streamStartedAt: null,
      },
    });

    revalidatePath(`/u/${self.username}`);
    return { success: true, stream: updatedStream };
  }

  // Create new stream for browser streaming
  const newStream = await db.stream.create({
    data: {
      name: self.id, // Use user ID as room name
      title: data.title,
      userId: self.id,
      streamType: "BROWSER",
      isLive: false,
    },
  });

  revalidatePath(`/u/${self.username}`);
  return { success: true, stream: newStream };
};

export const startBrowserStream = async () => {
  const self = await getSelf();

  const stream = await db.stream.findUnique({
    where: { userId: self.id },
  });

  if (!stream) {
    throw new Error("No stream found. Please create a stream first.");
  }

  if (stream.streamType !== "BROWSER") {
    throw new Error("This stream is not configured for browser streaming.");
  }

  if (stream.isLive) {
    throw new Error("Stream is already live.");
  }

  const updatedStream = await db.stream.update({
    where: { userId: self.id },
    data: {
      isLive: true,
      streamStartedAt: new Date(),
    },
  });

  revalidatePath(`/u/${self.username}`);
  return { success: true, stream: updatedStream };
};

export const stopBrowserStream = async () => {
  const self = await getSelf();

  const stream = await db.stream.findUnique({
    where: { userId: self.id },
  });

  if (!stream) {
    throw new Error("No stream found.");
  }

  if (!stream.isLive) {
    throw new Error("Stream is not currently live.");
  }

  const updatedStream = await db.stream.update({
    where: { userId: self.id },
    data: {
      isLive: false,
    },
  });

  revalidatePath(`/u/${self.username}`);
  return { success: true, stream: updatedStream };
};

export const getBrowserStreamData = async () => {
  const self = await getSelf();

  const stream = await db.stream.findUnique({
    where: { userId: self.id },
  });

  if (!stream) {
    return { error: "No stream found" };
  }

  if (stream.streamType !== "BROWSER") {
    return { error: "Stream is not configured for browser streaming" };
  }

  return { stream };
};

export const updateBrowserStreamTitle = async (title: string) => {
  const self = await getSelf();

  const stream = await db.stream.findUnique({
    where: { userId: self.id },
  });

  if (!stream) {
    throw new Error("No stream found");
  }

  const updatedStream = await db.stream.update({
    where: { userId: self.id },
    data: { title },
  });

  revalidatePath(`/u/${self.username}`);
  return { success: true, stream: updatedStream };
}; 