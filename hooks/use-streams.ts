import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

interface Stream {
  id: string;
  user: {
    id: string;
    username: string;
    imageUrl: string;
    bio: string | null;
  };
  isLive: boolean;
  name: string;
  thumbnailUrl: string | null;
  updatedAt: string;
}

interface StreamsResponse {
  streams: Stream[];
  hasMore: boolean;
  total: number;
}

interface InfiniteStreamsResponse {
  streams: Stream[];
  nextPage: number | undefined;
  hasMore: boolean;
}

export function useStreams(page = 1, limit = 20) {
  return useQuery<StreamsResponse>({
    queryKey: ["streams", page, limit],
    queryFn: async () => {
      const response = await fetch(`/api/streams?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error("Failed to fetch streams");
      }
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds (reduced from 1 minute)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // 1 minute for now
    refetchIntervalInBackground: false, // Don't refetch when tab is not active
  });
}

// Infinite query hook for infinite scroll
export function useStreamsInfinite(limit = 12) {
  return useInfiniteQuery({
    queryKey: ["streams-infinite"],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await fetch(`/api/streams?page=${pageParam}&limit=${limit}`);
      if (!response.ok) {
        throw new Error("Failed to fetch streams");
      }
      return response.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      // If we got fewer items than requested, we've reached the end
      return lastPage.length === limit ? allPages.length + 1 : undefined;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: false,
  });
}

// Legacy hook for backward compatibility - returns the actual API response
export function useStreamsLegacy() {
  return useQuery<Stream[]>({
    queryKey: ["streams"],
    queryFn: async () => {
      const response = await fetch("/api/streams");
      if (!response.ok) {
        throw new Error("Failed to fetch streams");
      }
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // 1 minute for now
    refetchIntervalInBackground: false, // Don't refetch when tab is not active
  });
} 