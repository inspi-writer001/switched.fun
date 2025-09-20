"use client";

import { useCallback } from "react";
import { ConnectionState, Track } from "livekit-client";
import { useAtom } from "jotai";
import {
  useConnectionState,
  useRemoteParticipant,
  useTracks,
  useRoomContext,
} from "@livekit/components-react";

import { Skeleton } from "@/components/ui/skeleton";
import { TipOverlayManager } from "./tip-overlay";
import { GiftTipOverlayManager } from "./gift-tip-overlay";
import { useTipBroadcast, TipNotification } from "@/hooks/use-tip-broadcast";
import {
  largeTipNotificationsAtom,
  giftTipNotificationsAtom,
  addTipNotificationAtom,
  removeTipNotificationAtom,
} from "@/store/chat-atoms";

import { OfflineVideo } from "./offline-video";
import { LoadingVideo } from "./loading-video";
import { LiveVideo } from "./live-video";

interface VideoProps {
  hostName: string;
  hostIdentity: string;
  thumbnailUrl?: string | null;
}

export const Video = ({ hostName, hostIdentity, thumbnailUrl }: VideoProps) => {
  const connectionState = useConnectionState();
  const participant = useRemoteParticipant(hostIdentity);
  const room = useRoomContext();

  // Use Jotai atoms for state management
  const [largeTipNotifications] = useAtom(largeTipNotificationsAtom);
  const [giftTipNotifications] = useAtom(giftTipNotificationsAtom);
  const [, addTipNotification] = useAtom(addTipNotificationAtom);
  const [, removeTipNotification] = useAtom(removeTipNotificationAtom);

  const tracks = useTracks([
    Track.Source.Camera,
    Track.Source.Microphone,
  ]).filter((track) => track.participant.identity === hostIdentity);

  // Handle large tip notifications for overlay
  const handleLargeTipReceived = useCallback(
    (notification: TipNotification) => {
      // All tip notifications are now handled centrally by the addTipNotification atom
      // The largeTipNotificationsAtom will automatically filter for large tips
      addTipNotification(notification);
    },
    [addTipNotification]
  );

  const { broadcastTip } = useTipBroadcast(room, handleLargeTipReceived);

  const handleNotificationComplete = useCallback(
    (id: string) => {
      removeTipNotification(id);
    },
    [removeTipNotification]
  );

  let content;

  if (!participant && connectionState === ConnectionState.Connected) {
    content = <OfflineVideo username={hostName} />;
  } else if (!participant || tracks.length === 0) {
    // content = <LoadingVideo label={connectionState} />
    content = <OfflineVideo username={hostName} thumbnailUrl={thumbnailUrl} />;
  } else {
    content = <LiveVideo participant={participant} />;
  }

  return (
    <div className="aspect-video border-b border-border/40 group relative">
      {content}

      {/* 
        Overlay Priority System:
        1. Large/Mega Tips (z-50): Always take priority, includes gift info if applicable
        2. Regular Gift Tips (z-40): Only show for non-large/non-mega gift tips
        
        This prevents conflicts where a large gift tip would show both overlays
      */}

      {/* Large/Mega tip overlay - HIGHEST PRIORITY (z-50) */}
      <TipOverlayManager
        notifications={largeTipNotifications}
        onNotificationComplete={handleNotificationComplete}
      />

      {/* Regular gift tip overlay - LOWER PRIORITY (z-40) */}
      <GiftTipOverlayManager
        notifications={giftTipNotifications}
        onNotificationComplete={handleNotificationComplete}
      />
    </div>
  );
};

export const VideoSkeleton = () => {
  return (
    <div className="aspect-video border-x border-background">
      <Skeleton className="h-full w-full rounded-none" />
    </div>
  );
};
