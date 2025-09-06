import React, { memo } from "react";
import Link from "next/link";

import { Thumbnail, ThumbnailSkeleton } from "@/components/thumbnail";
import { Skeleton } from "@/components/ui/skeleton";
import { LiveBadge } from "@/components/live-badge";
import { UserAvatar, UserAvatarSkeleton } from "@/components/user-avatar";

interface ResultCardProps {
  data: {
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
  };
}

export const ResultCard = memo(({ data }: ResultCardProps) => {
  return (
    <Link href={`/${data.user.username}`} className="block h-full">
      <div className="h-full w-full space-y-4 group hover-bg-border/30">
        <Thumbnail
          src={data.thumbnailUrl}
          fallback={data.user.imageUrl}
          isLive={data.isLive}
          username={data.user.username}
        />

        <div className="flex gap-x-3">
          <UserAvatar
            username={data.user.username}
            imageUrl={data.user.imageUrl}
            isLive={data.isLive}
          />
          <div className="flex flex-col text-sm overflow-hidden flex-1 min-w-0">
            <p className="truncate font-semibold group-hover:text-blue-500 transition-colors">
              {data.name}
            </p>
            <p className="text-muted-foreground truncate">{data.user.username}</p>
          </div>
        </div>
      </div>
    </Link>
  );
});

ResultCard.displayName = "ResultCard";

export const ResultCardSkeleton = () => {
  return (
    <div className="h-full w-full space-y-4">
      <ThumbnailSkeleton />
      <div className="flex gap-x-3">
        <UserAvatarSkeleton />
        <div className="flex flex-col gap-y-1 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
};
