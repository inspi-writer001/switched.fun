import { db } from "@/lib/db";
import { getSelfFromApi } from "@/lib/auth-service";

export const getSearch = async (term?: string) => {
  let userId;

  try {
    const self = await getSelfFromApi();
    userId = self.id;
  } catch {
    userId = null;
  }

  let users = [];

  if (userId) {
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

  return users;
};

export const searchFromApi = async (term?: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = term ? `${baseUrl}/api/search?term=${encodeURIComponent(term)}` : `${baseUrl}/api/search`;
  
  const response = await fetch(url, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error("Failed to search");
  }
  
  return response.json();
};

