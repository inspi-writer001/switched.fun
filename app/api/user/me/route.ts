import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@civic/auth-web3/nextjs";
import { db } from "@/lib/db";
import { getCachedData } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Civic
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

    // Get user from database with caching
    const user = await getCachedData({
      key: `user:me:${self.id}`,
      ttl: 300, // 5 minutes
      fetchFn: async () => {
        return db.user.findUnique({
          where: { externalUserId: self.id },
          include: {
            interests: {
              include: {
                subCategory: true,
              },
            },
            stream: true,
            _count: {
              select: {
                followedBy: true,
                following: true,
              },
            },
          },
        });
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (err: any) {
    console.error("[GET /api/user/me] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
} 