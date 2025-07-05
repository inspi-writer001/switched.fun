import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  externalUserId: string;
  username: string;
  bio: string | null;
  imageUrl: string;
  stream: {
    id: string;
    isLive: boolean;
    isChatDelayed: boolean;
    isChatEnabled: boolean;
    isChatFollowersOnly: boolean;
    thumbnailUrl: string | null;
    name: string;
  } | null;
  interests: Array<{
    id: string;
    subCategory: {
      id: string;
      name: string;
      categoryId: string;
    };
  }>;
  _count: {
    followedBy: number;
    following: number;
  };
}

export function useUserById(id: string) {
  return useQuery<User>({
    queryKey: ["user", "id", id],
    queryFn: async () => {
      const response = await fetch(`/api/user/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
} 