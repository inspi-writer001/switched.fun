import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCachedData } from "@/lib/redis";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Validate input
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Get stream with caching
    const stream = await getCachedData({
      key: `stream:user:${userId}`,
      ttl: 300, // 5 minutes
      fetchFn: async () => {
        return db.stream.findUnique({
          where: { userId },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                imageUrl: true,
                bio: true,
              },
            },
          },
        });
      },
    });

    if (!stream) {
      return NextResponse.json(
        { error: "Stream not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(stream);
  } catch (err: any) {
    console.error("[GET /api/stream/user/[userId]] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch stream" },
      { status: 500 }
    );
  }
} 