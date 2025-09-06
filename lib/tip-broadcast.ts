import { Room } from "livekit-client";

export interface TipBroadcastData {
  type: "tip";
  id: string;
  amount: number;
  tokenType: "USDC" | "SOL";
  giftType?: string;
  giftName?: string;
  tipperId: string;
  tipperUsername: string;
  tipperImageUrl: string;
  streamerId: string;
  streamerUsername: string;
  timestamp: number;
  transactionHash?: string;
}

export interface TipNotificationData {
  type: "tip_notification";
  tip: TipBroadcastData;
}

/**
 * Broadcast a tip notification to all participants in the LiveKit room
 */
export async function broadcastTipNotification(
  room: Room,
  tipData: TipBroadcastData
): Promise<void> {
  try {
    const notificationData: TipNotificationData = {
      type: "tip_notification",
      tip: tipData,
    };

    // Send data to all participants in the room
    await room.localParticipant.publishData(
      new TextEncoder().encode(JSON.stringify(notificationData)),
      0 // DataPacket_Kind.RELIABLE
    );

    console.log("Tip notification broadcasted:", tipData);
  } catch (error) {
    console.error("Failed to broadcast tip notification:", error);
    throw error;
  }
}

/**
 * Create tip broadcast data from tip record
 */
export function createTipBroadcastData(
  tip: {
    id: string;
    amount: number;
    tokenType: "USDC" | "SOL";
    giftType?: string | null;
    giftName?: string | null;
    tipperId: string;
    streamerId: string;
    transactionHash?: string | null;
    createdAt: Date;
    tipper: {
      username: string;
      imageUrl: string;
    };
    streamer: {
      username: string;
    };
  }
): TipBroadcastData {
  return {
    type: "tip",
    id: tip.id,
    amount: Number(tip.amount),
    tokenType: tip.tokenType,
    giftType: tip.giftType || undefined,
    giftName: tip.giftName || undefined,
    tipperId: tip.tipperId,
    tipperUsername: tip.tipper.username,
    tipperImageUrl: tip.tipper.imageUrl,
    streamerId: tip.streamerId,
    streamerUsername: tip.streamer.username,
    timestamp: tip.createdAt.getTime(),
    transactionHash: tip.transactionHash || undefined,
  };
}

/**
 * Format tip message for display
 */
export function formatTipMessage(tip: TipBroadcastData): string {
  const giftText = tip.giftType ? ` with ${tip.giftName}` : "";
  return `💰 ${tip.tipperUsername} tipped $${tip.amount} ${tip.tokenType}${giftText} to ${tip.streamerUsername}!`;
}

/**
 * Check if data is a tip notification
 */
export function isTipNotification(data: any): data is TipNotificationData {
  return data?.type === "tip_notification" && data?.tip?.type === "tip";
}
