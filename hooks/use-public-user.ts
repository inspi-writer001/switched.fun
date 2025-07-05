import { useQuery } from "@tanstack/react-query";

interface PublicUser {
  id: string;
  username: string;
  imageUrl: string;
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
    name: string;
    thumbnailUrl: string | null;
  } | null;
  _count: {
    followedBy: number;
    following: number;
  };
}

export function usePublicUser(username: string) {
  return useQuery<PublicUser>({
    queryKey: ["publicUser", username],
    queryFn: async () => {
      const response = await fetch(`/api/user/public/${username}`);
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