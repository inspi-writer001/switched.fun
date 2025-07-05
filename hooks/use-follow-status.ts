import { useQuery } from "@tanstack/react-query";

export function useFollowStatus(userId: string) {
  return useQuery<{ isFollowing: boolean }>({
    queryKey: ["followStatus", userId],
    queryFn: async () => {
      const response = await fetch(`/api/follow/check/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to check follow status");
      }
      return response.json();
    },
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute (follow status can change)
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
} 