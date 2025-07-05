import { useQuery } from "@tanstack/react-query";

interface Stream {
  id: string;
  userId: string;
  name: string;
  thumbnailUrl: string | null;
  isLive: boolean;
  isChatEnabled: boolean;
  isChatDelayed: boolean;
  isChatFollowersOnly: boolean;
  serverUrl: string | null;
  streamKey: string | null;
  user: {
    id: string;
    username: string;
    imageUrl: string;
    bio: string | null;
  };
}

export function useStreamByUserId(userId: string) {
  return useQuery<Stream>({
    queryKey: ["stream", "user", userId],
    queryFn: async () => {
      const response = await fetch(`/api/stream/user/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch stream");
      }
      return response.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
} 