import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCachedData } from "@/lib/redis";

// Helper function to determine if the identifier is likely a UUID/ID or username
function isLikelyId(identifier: string): boolean {
  // Check if it's a UUID format (8-4-4-4-12 characters)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  // Check if it's a numeric ID
  const numericRegex = /^\d+$/;
  
  // Check if it's a short alphanumeric ID (common for external user IDs)
  const shortIdRegex = /^[a-zA-Z0-9]{10,20}$/;
  
  return uuidRegex.test(identifier) || numericRegex.test(identifier) || shortIdRegex.test(identifier);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { identifier: string } }
) {
  try {
    const { identifier } = params;

    // Validate input
    if (!identifier || typeof identifier !== "string") {
      return NextResponse.json(
        { error: "Invalid identifier" },
        { status: 400 }
      );
    }

    // Decode URL and trim whitespace to handle potential encoding issues
    const cleanIdentifier = decodeURIComponent(identifier).trim();
    
    // Determine if this is likely an ID or username
    const isId = isLikelyId(cleanIdentifier);
    
    let user;
    
    if (isId) {
      // Handle as externalUserId or internal ID
      user = await getCachedData({
        key: `user:id:${cleanIdentifier}`,
        ttl: 300, // 5 minutes
        fetchFn: async () => {
          return db.user.findFirst({
            where: {
              OR: [{ externalUserId: cleanIdentifier }, { id: cleanIdentifier }],
            },
            select: {
              id: true,
              externalUserId: true,
              username: true,
              bio: true,
              imageUrl: true,
              stream: {
                select: {
                  id: true,
                  isLive: true,
                  isChatDelayed: true,
                  isChatEnabled: true,
                  isChatFollowersOnly: true,
                  thumbnailUrl: true,
                  name: true,
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
        },
      });
    } else {
      // Handle as username
      user = await getCachedData({
        key: `user:username:${cleanIdentifier.toLowerCase()}`,
        ttl: 300, // 5 minutes
        fetchFn: async () => {
          return db.user.findFirst({
            where: {
              username: {
                equals: cleanIdentifier,
                mode: "insensitive",
              },
            },
            select: {
              id: true,
              externalUserId: true,
              username: true,
              bio: true,
              imageUrl: true,
              stream: {
                select: {
                  id: true,
                  isLive: true,
                  isChatDelayed: true,
                  isChatEnabled: true,
                  isChatFollowersOnly: true,
                  thumbnailUrl: true,
                  name: true,
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
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (err: any) {
    console.error("[GET /api/user/[identifier]] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
} 