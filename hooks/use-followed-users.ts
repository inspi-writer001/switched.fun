import { useQuery } from "@tanstack/react-query";

interface FollowedUser {
  id: string;
  following: {
    id: string;
    username: string;
    imageUrl: string;
    bio: string | null;
    stream: {
      isLive: boolean;
      name: string;
      thumbnailUrl: string | null;
    } | null;
  };
  createdAt: string;
}

export function useFollowedUsers() {
  return useQuery<FollowedUser[]>({
    queryKey: ["followedUsers"],
    queryFn: async () => {
      const response = await fetch("/api/follow/following");
      if (!response.ok) {
        throw new Error("Failed to fetch followed users");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
} 