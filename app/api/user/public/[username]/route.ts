import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
// import { getCachedData } from "@/lib/redis";

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    // Validate input
    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: "Invalid username" }, { status: 400 });
    }

    // Get public user profile with caching
    const user = await db.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
      include: {
        stream: {
          select: {
            id: true,
            isLive: true,
            name: true,
            thumbnailUrl: true,
            isChatEnabled: true,
            isChatDelayed: true,
            isChatFollowersOnly: true,
          },
        },
        interests: {
          include: {
            subCategory: true,
          },
        },
        _count: {
          select: {
            followedBy: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err: any) {
    console.error("[GET /api/user/public/[username]] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
