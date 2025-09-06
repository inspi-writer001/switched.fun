import { useEffect, useCallback } from "react";
import { useDataChannel } from "@livekit/components-react";
import { Room } from "livekit-client";
import { broadcastTipNotification, createTipBroadcastData, isTipNotification, formatTipMessage } from "@/lib/tip-broadcast";
import { toast } from "sonner";
import { TIP_CONFIG } from "@/lib/tip-config";

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
  isLargeTip?: boolean; // New field to indicate if this is a large tip
  isMegaTip?: boolean; // New field to indicate if this is a mega tip
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
        const isLargeTip = tip.amount >= TIP_CONFIG.LARGE_TIP_THRESHOLD;
        const isMegaTip = tip.amount >= TIP_CONFIG.MEGA_TIP_THRESHOLD;
        
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
          isLargeTip,
          isMegaTip,
        };

        // Show different notifications based on tip size
        if (isMegaTip) {
          // Mega tips get the most prominent toast
          toast.success(`🚀 MEGA TIP! ${notification.message}`, {
            duration: TIP_CONFIG.MEGA_TOAST_DURATION,
            description: `${tip.giftType ? `Gift: ${tip.giftName}` : `Amount: $${tip.amount} ${tip.tokenType}`}`,
            className: "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/50",
          });
        } else if (isLargeTip) {
          // Large tips get a prominent toast
          toast.success(`🌟 BIG TIP! ${notification.message}`, {
            duration: TIP_CONFIG.LARGE_TOAST_DURATION,
            description: `${tip.giftType ? `Gift: ${tip.giftName}` : `Amount: $${tip.amount} ${tip.tokenType}`}`,
            className: "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/50",
          });
        } else {
          // Regular tips get standard toast
          toast.success(notification.message, {
            duration: TIP_CONFIG.REGULAR_TOAST_DURATION,
            description: `${tip.giftType ? `Gift: ${tip.giftName}` : `Amount: $${tip.amount} ${tip.tokenType}`}`,
          });
        }

        // Call the callback if provided
        if (onTipReceived) {
          onTipReceived(notification);
        }

        console.log("Tip notification received:", notification);
      }
    } catch (error) {
      console.error("Failed to parse tip notification:", error);
    }
  }, [message, onTipReceived]);

  return {
    broadcastTip,
    LARGE_TIP_THRESHOLD: TIP_CONFIG.LARGE_TIP_THRESHOLD, // Export threshold for use in components
    MEGA_TIP_THRESHOLD: TIP_CONFIG.MEGA_TIP_THRESHOLD, // Export mega threshold
  };
}
