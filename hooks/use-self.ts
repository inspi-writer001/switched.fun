import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  username: string;
  imageUrl: string;
  externalUserId: string;
  bio: string | null;
  interests: Array<{
    id: string;
    subCategory: {
      id: string;
      name: string;
      categoryId: string;
    };
  }>;
  stream: {
    id: string;
    isLive: boolean;
    isChatEnabled: boolean;
    isChatDelayed: boolean;
    isChatFollowersOnly: boolean;
  } | null;
  _count: {
    followedBy: number;
    following: number;
  };
}

export function useSelf() {
  return useQuery<User>({
    queryKey: ["self"],
    queryFn: async () => {
      const response = await fetch("/api/user/me");
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
} 