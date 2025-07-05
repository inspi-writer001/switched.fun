import { useQuery } from "@tanstack/react-query";

interface RecommendedUser {
  id: string;
  username: string;
  imageUrl: string;
  externalUserId: string;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
  stream: {
    isLive: boolean;
    name: string | null;
    thumbnailUrl: string | null;
  } | null;
}

export function useRecommended() {
  return useQuery<RecommendedUser[]>({
    queryKey: ["recommended"],
    queryFn: async () => {
      const response = await fetch("/api/recommended");
      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds (recommendations change frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
} 