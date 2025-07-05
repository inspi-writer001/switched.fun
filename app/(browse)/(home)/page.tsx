import { Suspense } from "react";

import { Results, ResultsSkeleton } from "./_components/results";
import Landing from "../Landing/page";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getStreamsFromApi } from "@/lib/feed-service";

export default async function Page() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
        retry: 1, // Only retry once
        refetchOnWindowFocus: false, // Don't refetch on window focus
      },
    },
  });

  // Prefetch streams with error handling
  try {
    await queryClient.prefetchQuery({
      queryKey: ["streams"],
      queryFn: () => getStreamsFromApi(),
      staleTime: 30 * 1000,
    });
  } catch (error) {
    console.error("Failed to prefetch streams:", error);
    // Continue without prefetched data - client will fetch
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <>
      <Landing />
      <HydrationBoundary state={dehydratedState}>
        <div className="h-full p-8 max-w-screen-2xl mx-auto">
          <Suspense fallback={<ResultsSkeleton />}>
            <Results />
          </Suspense>
        </div>
      </HydrationBoundary>
    </>
  );
};
