import React, { useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { MobileAboutCard } from "./mobile-about-card";
import { CustomStream, CustomUser } from ".";
import { MobileChat } from "./mobile-chat";

interface MobileStreamPlayerDetailsProps {
  user: CustomUser;
  identity: string;
  isFollowing: boolean;
  stream: CustomStream;
  viewerName: string;
}

export const MobileStreamPlayerDetails = ({
  user,
  identity,
  isFollowing,
  stream,
  viewerName,
}: MobileStreamPlayerDetailsProps) => {
  const [option, setOption] = useState<"about" | "chat">("about");
  return (
    <div className="flex flex-col gap-3 p-2 py-4">
      <div>
        <div className="inline-flex p-1 space-x-2 bg-secondary rounded-full">
          <Button
            size="sm"
            variant={"secondary"}
            className={cn(
              "px-4",
              option === "about"
                ? "bg-primary/10 text-primary"
                : "text-secondary-foreground/60"
            )}
            onClick={() => setOption("about")}
          >
            About Creator
          </Button>
          <Button
            size="sm"
            variant={"secondary"}
            className={cn(
              "px-4",
              option === "chat"
                ? "bg-primary/10 text-primary"
                : "text-secondary-foreground/60"
            )}
            onClick={() => setOption("chat")}
          >
            Chat
          </Button>
        </div>
      </div>

      {option === "about" && (
        <MobileAboutCard
          user={user}
          identity={identity}
          isFollowing={isFollowing}
          stream={stream}
        />
      )}
      {option === "chat" && (
        <MobileChat
          user={user}
          isFollowing={isFollowing}
          stream={stream}
          viewerName={viewerName}
        />
      )}
    </div>
  );
};
