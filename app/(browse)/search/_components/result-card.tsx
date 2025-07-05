import Link from "next/link";
import Image from "next/image";
import { memo } from "react";
import { formatDistanceToNow } from "date-fns";

import { Skeleton } from "@/components/ui/skeleton";
import { VerifiedMark } from "@/components/verified-mark";
import { UserAvatar, UserAvatarSkeleton } from "@/components/user-avatar";

interface ResultCardProps {
  data: {
    id: string;
    username: string;
    bio: string | null;
    imageUrl: string;
    stream: {
      id: string;
      isLive: boolean;
      name: string;
      thumbnailUrl: string | null;
    } | null;
    _count: {
      followedBy: number;
    };
  };
}

export const ResultCard = memo(({ data }: ResultCardProps) => {
  return (
    <Link href={`/${data.username}`} className="group">
      <div className="w-full flex flex-col items-center gap-x-4 p-4 rounded-lg transition-colors hover:bg-muted/50 gap-y-4 border border-border">
          <UserAvatar
            username={data.username}
            imageUrl={data.imageUrl}
            size="lg"
            isLive={data.stream?.isLive}
            showBadge={true}
          />
        <div className="flex flex-col items-center w-full">
          <div className="flex items-center gap-x-2">
            <p className="font-semibold text-lg truncate group-hover:text-primary transition-colors capitalize">
              {data.username}
            </p>
            <VerifiedMark />
          </div>
          <div className="flex items-center gap-x-2 text-sm text-muted-foreground">
            <p>{data._count.followedBy.toLocaleString()} followers</p>
            {data.stream?.isLive && (
              <p className="text-rose-500 font-medium">• Live</p>
            )}
          </div>
          {data.stream?.name && (
            <p className="text-xs text-muted-foreground truncate">
              {data.stream.name}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
});

ResultCard.displayName = 'ResultCard';

export const ResultCardSkeleton = () => {
  return (
    <div className="w-full flex gap-x-4 p-4">
      <div className="relative h-[9rem] w-[9rem] flex-shrink-0">
        <UserAvatarSkeleton size="lg" />
      </div>
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-2 w-20" />
      </div>
    </div>
  );
};
