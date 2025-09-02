"use client";

import { Skeleton } from "@/components/ui/skeleton";

import { ChatToggle } from "./chat-toggle";
import { VariantToggle } from "./variant-toggle";
import { ChatVariant, GiftMode, useChatSidebar } from "@/store/use-chat-sidebar";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const ChatHeader = () => {
  const { variant, onChangeVariant, onChangeGiftMode, giftMode } = useChatSidebar(
    (state) => state
  );
  return (
    <>
      {variant !== ChatVariant.GIFT ? (
        <div className="relative p-3 border-b">
          <div className="absolute left-2 top-2 hidden lg:block">
            <ChatToggle />
          </div>
          <p className="font-semibold text-priamry text-center">Stream Chat</p>
          <div className="absolute right-2 top-2">
            <VariantToggle />
          </div>
        </div>
      ) : null}

      {variant === ChatVariant.GIFT ? (
        <div className="flex items-center justify-between p-3 py-2 border-b">
          <div className="flex space-x-2 bg-secondary rounded-full p-1">
            <Button
              onClick={() => onChangeGiftMode(GiftMode.TIP)}
              variant={giftMode === GiftMode.TIP ? "link" : "secondary"}
              className={cn(giftMode === GiftMode.TIP ? "text-primary" : "text-secondary-foreground/60")}
              size="sm"
            >
              Send Tip
            </Button>
            <Button
              onClick={() => onChangeGiftMode(GiftMode.GIFT)}
              variant={giftMode === GiftMode.GIFT ? "link" : "secondary"}
              className={cn(giftMode === GiftMode.GIFT ? "text-primary" : "text-secondary-foreground/60")}
              size="sm"
            >
              Send Gift
            </Button>
          </div>

          <Button
            onClick={() => onChangeVariant(ChatVariant.CHAT)}
            variant="ghost"
            size="icon"
          >
            <X size={20} />
          </Button>
        </div>
      ) : null}
    </>
  );
};

export const ChatHeaderSkeleton = () => {
  return (
    <div className="relative p-3 border-b hidden md:block">
      <Skeleton className="absolute h-6 w-6 left-3 top-3" />
      <Skeleton className="w-28 h-6 mx-auto" />
    </div>
  );
};
