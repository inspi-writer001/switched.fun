"use client";

import { useSidebar } from "@/store/use-sidebar";

import { UserItem, UserItemSkeleton } from "./user-item";
import { useQuery } from "@tanstack/react-query";
import { getRecommended } from "@/lib/recommended-service";


export const Recommended = () => {
  const { collapsed } = useSidebar((state) => state);

  const { data, isLoading } = useQuery({
    queryKey: ["recommended"],
    queryFn: () => getRecommended(),
  });

  const showLabel = !collapsed && data?.length && data.length > 0;

  if (isLoading) {
    return <RecommendedSkeleton />;
  }

  return (
    <div>
      {showLabel && (
        <div className="pl-6 mb-4">
          <p className="text-sm text-muted-foreground">
            Recommended
          </p>
        </div>
      )}
      <ul className="space-y-2 px-2">
        {data?.map((user) => (
          <UserItem
            key={user.id}
            username={user.username}
            imageUrl={user.imageUrl}
            isLive={user.stream?.isLive}
          />
        ))}
      </ul>
    </div>
  );
};

export const RecommendedSkeleton = () => {
  return (
    <ul className="px-2">
      {[...Array(3)].map((_, i) => (
        <UserItemSkeleton key={i} />
      ))}
    </ul>
  );
};
