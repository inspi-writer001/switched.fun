"use client";

import { toast } from "sonner";
import { Heart } from "lucide-react";
import { useTransition } from "react";
import { useUser } from "@civic/auth-web3/react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { onFollow, onUnfollow } from "@/actions/follow";
import { ChatVariant, useChatSidebar } from "@/store/use-chat-sidebar";
import { DollarSign } from "lucide-react";

interface ActionsProps {
  hostIdentity: string;
  isFollowing: boolean;
  isHost: boolean;
}

export const Actions = ({
  hostIdentity,
  isFollowing,
  isHost,
}: ActionsProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { user } = useUser();
  const { onChangeVariant } = useChatSidebar();

  const handleFollow = () => {
    startTransition(() => {
      onFollow(hostIdentity)
        .then((data) =>
          toast.success(`You are now following ${data.following.username}`)
        )
        .catch(() => toast.error("Something went wrong"));
    });
  };

  const handleUnfollow = () => {
    startTransition(() => {
      onUnfollow(hostIdentity)
        .then((data) =>
          toast.success(`You have unfollowed ${data.following.username}`)
        )
        .catch(() => toast.error("Something went wrong"));
    });
  };

  const toggleFollow = () => {
    if (!user?.id) {
      return router.push("/sign-in");
    }

    if (isHost) return;

    if (isFollowing) {
      handleUnfollow();
    } else {
      handleFollow();
    }
  };

  const handleSendTip = () => {
    if (!user?.id) {
      return router.push("/sign-in");
    }

    if (isHost) return;

    onChangeVariant(ChatVariant.GIFT);
  };

  return (
    <div className="flex gap-x-2">
      <Button
        disabled={isPending || isHost}
        onClick={toggleFollow}
        variant="primary"
        size="sm"
        className="w-full lg:w-auto"
      >
        <Heart
          className={cn(
            "h-4 w-4 mr-2",
            isFollowing ? "fill-white" : "fill-none"
          )}
        />
        {isFollowing ? "Unfollow" : "Follow"}
      </Button>

      <Button
        disabled={isHost}
        onClick={handleSendTip}
        variant="primary"
        size="sm"
        className="w-full lg:w-auto"
      >
        Send Tip
      </Button>
    </div>
  );
};

export const ActionsSkeleton = () => {
  return <Skeleton className="h-10 w-full lg:w-24" />;
};
