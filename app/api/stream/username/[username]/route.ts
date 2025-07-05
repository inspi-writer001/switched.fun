import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCachedData } from "@/lib/redis";

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    // Validate input
    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "Invalid username" },
        { status: 400 }
      );
    }

    // Get stream with caching
    const stream = await getCachedData({
      key: `stream:username:${username.toLowerCase()}`,
      ttl: 300, // 5 minutes
      fetchFn: async () => {
        const user = await db.user.findFirst({
          where: { 
            username: {
              equals: username,
              mode: "insensitive",
            }
          },
          select: { id: true }
        });
        
        if (!user) return null;
        
        return db.stream.findUnique({
          where: { userId: user.id },
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
    console.error("[GET /api/stream/username/[username]] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch stream" },
      { status: 500 }
    );
  }
} 