import { Suspense } from "react";

import { Results, ResultsSkeleton } from "./_components/results";
import Landing from "../Landing/page";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getStreams } from "@/lib/feed-service";

export default async function Page() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["streams"],
    queryFn: () => getStreams(),
  });

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
