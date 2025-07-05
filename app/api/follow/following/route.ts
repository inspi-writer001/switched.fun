import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@civic/auth-web3/nextjs";
import { db } from "@/lib/db";
import { getCachedData } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    let self;
    try {
      self = await getUser();
    } catch (err: any) {
      console.error("Civic Auth getUser failed:", err);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    if (!self?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get followed users with caching
    const followedUsers = await getCachedData({
      key: `followed:${self.id}`,
      ttl: 300, // 5 minutes
      fetchFn: async () => {
        return db.follow.findMany({
          where: {
            followerId: self.id,
            following: {
              blocking: {
                none: {
                  blockedId: self.id,
                },
              },
            },
          },
          include: {
            following: {
              include: {
                stream: {
                  select: {
                    isLive: true,
                    name: true,
                    thumbnailUrl: true,
                  },
                },
              },
            },
          },
          orderBy: [
            {
              following: {
                stream: {
                  isLive: "desc",
                },
              },
            },
            {
              createdAt: "desc"
            },
          ]
        });
      },
    });

    return NextResponse.json(followedUsers);
  } catch (err: any) {
    console.error("[GET /api/follow/following] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch followed users" },
      { status: 500 }
    );
  }
} 