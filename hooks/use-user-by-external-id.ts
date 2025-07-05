import { useQuery } from "@tanstack/react-query";
import type { User } from "@/types/user";

interface UseUserByExternalIdOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

export function useUserByExternalId(
  externalUserId: string | undefined,
  options: UseUserByExternalIdOptions = {}
) {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
  } = options;

  return useQuery({
    queryKey: ["user", "external", externalUserId],
    queryFn: async (): Promise<User> => {
      if (!externalUserId) {
        throw new Error("External user ID is required");
      }

      const response = await fetch(`/api/user/${externalUserId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch user");
      }

      return response.json();
    },
    enabled: enabled && !!externalUserId,
    staleTime,
    gcTime: cacheTime, // Using gcTime instead of cacheTime for v5
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
      if (error instanceof Error && error.message.includes("User not found")) {
        return false;
      }
      return failureCount < 3;
    },
  });
} 