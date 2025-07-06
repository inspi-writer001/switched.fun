import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@civic/auth-web3/nextjs";
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

    // Get authenticated user
    let self;
    try {
      self = await getUser();
    } catch (err: any) {
      console.error("Civic Auth getUser failed:", err);
      // Return false for unauthenticated users instead of error
      return NextResponse.json({ isFollowing: false });
    }

    if (!self?.id) {
      // Return false for unauthenticated users
      return NextResponse.json({ isFollowing: false });
    }

    // Check if following with caching
    const isFollowing = await getCachedData({
      key: `following:${self.id}:${userId}`,
      ttl: 60, // 1 minute (follow status can change)
      fetchFn: async () => {
        const otherUser = await db.user.findUnique({
          where: { id: userId },
        });

        if (!otherUser) {
          throw new Error("User not found");
        }

        if (otherUser.id === self.id) {
          return true; // You're always "following" yourself
        }

        const existingFollow = await db.follow.findFirst({
          where: {
            followerId: self.id,
            followingId: otherUser.id,
          },
        });

        return !!existingFollow;
      },
    });

    return NextResponse.json({ isFollowing });
  } catch (err: any) {
    console.error("[GET /api/follow/check/[userId]] error:", err);
    
    if (err.message === "User not found") {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Return false for any other errors instead of throwing
    return NextResponse.json({ isFollowing: false });
  }
} 