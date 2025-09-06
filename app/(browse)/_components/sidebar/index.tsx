import { getFollowingFromApi } from "@/lib/follow-service";
import { getRecommendedFromApi } from "@/lib/recommended-service";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { Wrapper } from "./wrapper";
import { Toggle, ToggleSkeleton } from "./toggle";
import { Following, FollowingSkeleton } from "./following";
import { Recommended, RecommendedSkeleton } from "./recommended";

export const Sidebar = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["following"],
    queryFn: () => getFollowingFromApi(),
  });

  await queryClient.prefetchQuery({
    queryKey: ["recommended"],
    queryFn: () => getRecommendedFromApi(),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <div className="hidden md:block">
      <HydrationBoundary state={dehydratedState}>
        <Wrapper>
          <Toggle />
          <div className="space-y-4 pt-4 lg:pt-0">
            <Following />
            <Recommended />
          </div>
        </Wrapper>
      </HydrationBoundary>
    </div>
  );
};

export const SidebarSkeleton = () => {
  return (
    <aside className="hidden md:flex left-0 flex-col w-[70px] lg:w-60 h-full bg-background border-r border-black/95 z-50">
      <ToggleSkeleton />
      <FollowingSkeleton />
      <RecommendedSkeleton />
    </aside>
  );
};
