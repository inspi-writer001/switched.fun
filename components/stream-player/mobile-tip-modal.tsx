"use client";

import { GiftMode, useChatSidebar } from "@/store/use-chat-sidebar";
import React from "react";
import { Dialog, DialogHeader, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { TipComponent } from "./gift-chat";

interface TipComponentProps {
  hostIdentity: string;
  hostWalletAddress?: string;
  onClose?: () => void;
  onSendTip?: (amount: number) => void;
}

export const MobileTipModal = ({
  hostIdentity,
  hostWalletAddress,
  onClose,
  onSendTip,
}: TipComponentProps) => {
  const { isShowTipModal, onChangeShowTipModal, giftMode, onChangeGiftMode } =
    useChatSidebar((state) => state);
  return (
    <Dialog
      modal={false}
      open={isShowTipModal}
      onOpenChange={onChangeShowTipModal}
    >
      <DialogContent className="w-full overflow-x-hidden h-[100dvh]">
        <div className="max-w-[340px] mx-auto">
          <DialogHeader className="w-full border-b border-b-border/30">
            <DialogTitle>
              <div className="inline-flex space-x-2 bg-secondary rounded-full p-1">
                <Button
                  onClick={() => onChangeGiftMode(GiftMode.TIP)}
                  variant={giftMode === GiftMode.TIP ? "link" : "secondary"}
                  className={cn(
                    "font-sans",
                    giftMode === GiftMode.TIP
                      ? "bg-primary/10 text-primary"
                      : "text-secondary-foreground/60"
                  )}
                  size="sm"
                >
                  Send Tip
                </Button>
                <Button
                  onClick={() => onChangeGiftMode(GiftMode.GIFT)}
                  variant={giftMode === GiftMode.GIFT ? "link" : "secondary"}
                  className={cn(
                    "font-sans",
                    giftMode === GiftMode.GIFT
                      ? "bg-primary/10 text-primary"
                      : "text-secondary-foreground/60"
                  )}
                  size="sm"
                >
                  Send Gift
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="h-[calc(100dvh-100px)] min-w-[340px] w-full">
            <TipComponent
              hostIdentity={hostIdentity}
              hostWalletAddress={hostWalletAddress}
              onClose={() => {
                  onChangeShowTipModal(false);
                  onClose?.();
              }}
              onSendTip={onSendTip}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
