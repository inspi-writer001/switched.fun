"use client";

import { useUserByExternalId } from "@/hooks/use-user-by-external-id";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LiveBadge } from "@/components/live-badge";

interface UserProfileProps {
  externalUserId: string;
}

export function UserProfile({ externalUserId }: UserProfileProps) {
  const {
    data: user,
    isLoading,
    error,
  } = useUserByExternalId(externalUserId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 mt-2" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">
            {error instanceof Error ? error.message : "Failed to load user"}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">User not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.imageUrl} alt={user.username} />
            <AvatarFallback>
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{user.username}</CardTitle>
              {user.stream?.isLive && <LiveBadge />}
            </div>
            <p className="text-sm text-muted-foreground">
              {user._count?.followedBy || 0} followers
            </p>
          </div>
        </div>
      </CardHeader>
      {user.bio && (
        <CardContent>
          <p className="text-sm text-muted-foreground">{user.bio}</p>
        </CardContent>
      )}
    </Card>
  );
} 