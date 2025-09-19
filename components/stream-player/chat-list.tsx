"use client";

import { ReceivedChatMessage } from "@livekit/components-react";

import { Skeleton } from "@/components/ui/skeleton";

import { ChatMessage } from "./chat-message";
import { TipNotification } from "@/hooks/use-tip-broadcast";
import { cn } from "@/lib/utils";

interface ChatListProps {
  messages: ReceivedChatMessage[];
  isHidden: boolean;
  notifications: TipNotification[]
};

export const ChatList = ({
  messages,
  isHidden,
  notifications
}: ChatListProps) => {
  if (isHidden || !messages || messages.length === 0) {
    return (
      <div className={cn("h-[calc(100%-4.5rem)] flex flex-1 items-center justify-center", notifications?.length > 0 && "h-[calc(100%-6rem)]")}>
        <p className="text-sm text-muted-foreground">
          {isHidden ? "Chat is disabled" : "Welcome to the chat!"}
        </p>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-1 flex-col-reverse overflow-y-auto p-3 h-[calc(100%-4.5rem)]", notifications?.length > 0 && "h-[calc(100%-6rem)]")}>
      {messages.map((message) => (
        <ChatMessage
          key={message.timestamp}
          data={message}
        />
      ))}
    </div>
  );
};

export const ChatListSkeleton = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <Skeleton className="w-1/2 h-6" />
    </div>
  );
};
