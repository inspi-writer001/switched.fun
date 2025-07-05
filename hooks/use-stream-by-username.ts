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

export function useStreamByUsername(username: string) {
  return useQuery<Stream>({
    queryKey: ["stream", "username", username],
    queryFn: async () => {
      const response = await fetch(`/api/stream/username/${username}`);
      if (!response.ok) {
        throw new Error("Failed to fetch stream");
      }
      return response.json();
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
} 