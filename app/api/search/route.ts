import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@civic/auth-web3/nextjs";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const term = searchParams.get('q');

    // Validate input
    if (!term || typeof term !== "string" || term.trim().length === 0) {
      return NextResponse.json([]);
    }

    let userId: string | null = null;

    // Try to get authenticated user
    try {
      const self = await getUser();
      if (self?.id) {
        userId = self.id;
      }
    } catch (err: any) {
      // User is not authenticated, continue with null userId
      console.log("User not authenticated, showing public search results");
    }

    // Get search results directly from database
    let users;
    
    if (userId) {
      // Authenticated user: filter out blocked users
      users = await db.user.findMany({
        where: {
          NOT: {
            blocking: {
              some: {
                blockedId: userId,
              },
            },
          },
          OR: [
            {
              username: {
                contains: term,
                mode: "insensitive",
              },
            },
            {
              bio: {
                contains: term,
                mode: "insensitive",
              },
            },
          ],
        },
        select: {
          id: true,
          username: true,
          bio: true,
          imageUrl: true,
          stream: {
            select: {
              id: true,
              isLive: true,
              name: true,
              thumbnailUrl: true,
            },
          },
          _count: {
            select: {
              followedBy: true,
            },
          },
        },
        orderBy: [
          {
            stream: {
              isLive: "desc",
            },
          },
          {
            createdAt: "desc",
          },
        ],
      });
    } else {
      // Public user: show all results
      users = await db.user.findMany({
        where: {
          OR: [
            {
              username: {
                contains: term,
                mode: "insensitive",
              },
            },
            {
              bio: {
                contains: term,
                mode: "insensitive",
              },
            },
          ],
        },
        select: {
          id: true,
          username: true,
          bio: true,
          imageUrl: true,
          stream: {
            select: {
              id: true,
              isLive: true,
              name: true,
              thumbnailUrl: true,
            },
          },
          _count: {
            select: {
              followedBy: true,
            },
          },
        },
        orderBy: [
          {
            stream: {
              isLive: "desc",
            },
          },
          {
            createdAt: "desc",
          },
        ],
      });
    }

    return NextResponse.json(users);
  } catch (err: any) {
    console.error("[GET /api/search] error:", err);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
} 