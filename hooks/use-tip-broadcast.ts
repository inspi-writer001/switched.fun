import { useEffect, useCallback } from "react";
import { useDataChannel } from "@livekit/components-react";
import { Room } from "livekit-client";
import { broadcastTipNotification, createTipBroadcastData, isTipNotification, formatTipMessage } from "@/lib/tip-broadcast";
import { toast } from "sonner";

export interface TipNotification {
  id: string;
  amount: number;
  tokenType: "USDC" | "SOL";
  giftType?: string;
  giftName?: string;
  tipperUsername: string;
  tipperImageUrl: string;
  streamerUsername: string;
  timestamp: number;
  message: string;
}

/**
 * Hook for handling tip broadcasting and notifications
 */
export function useTipBroadcast(
  room: Room | null,
  onTipReceived?: (notification: TipNotification) => void
) {
  const { message } = useDataChannel();

  // Broadcast a tip notification
  const broadcastTip = useCallback(async (tipData: any) => {
    if (!room) {
      console.error("No room available for tip broadcasting");
      return;
    }

    try {
      const broadcastData = createTipBroadcastData(tipData);
      await broadcastTipNotification(room, broadcastData);
      console.log("Tip broadcasted successfully");
    } catch (error) {
      console.error("Failed to broadcast tip:", error);
    }
  }, [room]);

  // Handle incoming tip notifications
  useEffect(() => {
    if (!message) return;

    try {
      const data = JSON.parse(new TextDecoder().decode(message.payload));
      
      if (isTipNotification(data)) {
        const tip = data.tip;
        const notification: TipNotification = {
          id: tip.id,
          amount: tip.amount,
          tokenType: tip.tokenType,
          giftType: tip.giftType,
          giftName: tip.giftName,
          tipperUsername: tip.tipperUsername,
          tipperImageUrl: tip.tipperImageUrl,
          streamerUsername: tip.streamerUsername,
          timestamp: tip.timestamp,
          message: formatTipMessage(tip),
        };

        // Show tip notification
        toast.success(notification.message, {
          duration: 5000,
          description: `${tip.giftType ? `Gift: ${tip.giftName}` : `Amount: $${tip.amount} ${tip.tokenType}`}`,
        });

        // Call the callback if provided
        if (onTipReceived) {
          onTipReceived(notification);
        }

        console.log("Tip notification received:", notification);
      }
    } catch (error) {
      console.error("Failed to parse tip notification:", error);
    }
  }, [message]);

  return {
    broadcastTip,
  };
}
