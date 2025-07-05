import { useQuery } from "@tanstack/react-query";

interface SearchResult {
  id: string;
  username: string;
  imageUrl: string;
  bio: string | null;
  stream: {
    id: string;
    isLive: boolean;
    name: string;
    thumbnailUrl: string | null;
  } | null;
  _count: {
    followedBy: number;
  };
}

const searchFromApi = async (term: string): Promise<SearchResult[]> => {
  const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error("Failed to search");
  }
  
  return response.json();
};

export const useSearch = (term: string) => {
  return useQuery({
    queryKey: ['search', term],
    queryFn: () => searchFromApi(term),
    enabled: !!term && term.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}; 