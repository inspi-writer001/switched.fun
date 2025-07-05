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
  _count: {
    followedBy: number;
  };
}

export function useUserByUsername(username: string) {
  return useQuery<User>({
    queryKey: ["user", "username", username],
    queryFn: async () => {
      const response = await fetch(`/api/user/${encodeURIComponent(username)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      return response.json();
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
} 