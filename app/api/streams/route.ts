import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@civic/auth-web3/nextjs";
import { db } from "@/lib/db";
import { getCachedData } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    let userId: string | null = null;

    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    // Try to get authenticated user
    try {
      const self = await getUser();
      if (self?.id) {
        userId = self.id;
      }
    } catch (err: any) {
      // User is not authenticated, continue with null userId
      console.log("User not authenticated, showing public streams");
    }

    // Get streams with caching and pagination
    const cacheKey = userId ? `streams:authenticated:${userId}:${page}:${limit}` : `streams:public:${page}:${limit}`;
    
    const streams = await getCachedData({
      key: cacheKey,
      ttl: 60, // 1 minute cache for streams (they change frequently)
      fetchFn: async () => {
        const baseQuery = {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                username: true,
                imageUrl: true,
                bio: true,
              }
            },
            isLive: true,
            name: true,
            thumbnailUrl: true,
            updatedAt: true,
          },
          orderBy: [
            {
              isLive: "desc" as const,
            },
            {
              updatedAt: "desc" as const,
            }
          ],
          skip: offset,
          take: limit,
        };

        if (userId) {
          // Authenticated user: filter out blocked users
          return db.stream.findMany({
            ...baseQuery,
            where: {
              user: {
                NOT: {
                  blocking: {
                    some: {
                      blockedId: userId,
                    }
                  }
                }
              }
            },
          });
        } else {
          // Public user: show all streams
          return db.stream.findMany(baseQuery);
        }
      },
    });

    return NextResponse.json(streams);
  } catch (err: any) {
    console.error("[GET /api/streams] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch streams" },
      { status: 500 }
    );
  }
} 