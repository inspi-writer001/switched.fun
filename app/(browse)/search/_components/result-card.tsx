import Link from "next/link";
import { User } from "@prisma/client";
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

export const ResultCard = ({ data }: ResultCardProps) => {
  return (
    <Link href={`/${data.username}`}>
      <div className="w-full flex gap-x-4">
        <div className="relative h-[9rem] w-[9rem]">
          <UserAvatar
            username={data.username}
            imageUrl={data.imageUrl}
            size="lg"
            isLive={data.stream?.isLive}
          />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-x-2">
            <p className="font-semibold text-lg truncate">{data.username}</p>
            <VerifiedMark />
          </div>
          <p className="text-sm text-muted-foreground">
            {data.bio || "No bio yet"}
          </p>
          <div className="flex items-center gap-x-2 text-sm text-muted-foreground">
            <p>{data._count.followedBy} followers</p>
            {data.stream?.isLive && <p className="text-rose-500">• Live</p>}
          </div>
        </div>
      </div>
    </Link>
  );
};

export const ResultCardSkeleton = () => {
  return (
    <div className="w-full flex gap-x-4">
      <div className="relative h-[9rem] w-[9rem]">
        <UserAvatarSkeleton size="lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
};
