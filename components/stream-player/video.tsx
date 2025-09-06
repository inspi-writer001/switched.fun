"use client";

import { useState } from "react";
import { ConnectionState, Track } from "livekit-client";
import { 
  useConnectionState,
  useRemoteParticipant,
  useTracks,
  useRoomContext,
} from "@livekit/components-react"

import { Skeleton } from "@/components/ui/skeleton";
import { TipOverlayManager } from "./tip-overlay";
import { useTipBroadcast, TipNotification } from "@/hooks/use-tip-broadcast";

import { OfflineVideo } from "./offline-video";
import { LoadingVideo } from "./loading-video";
import { LiveVideo } from "./live-video";

interface VideoProps {
  hostName: string;
  hostIdentity: string;
  thumbnailUrl?: string | null;
};

export const Video = ({
  hostName,
  hostIdentity,
  thumbnailUrl,
}: VideoProps) => {
  const connectionState = useConnectionState();
  const participant = useRemoteParticipant(hostIdentity);
  const room = useRoomContext();
  const [largeTipNotifications, setLargeTipNotifications] = useState<TipNotification[]>([]);
  
  const tracks = useTracks([
    Track.Source.Camera,
    Track.Source.Microphone,
  ]).filter((track) => track.participant.identity === hostIdentity);

  // Handle large tip notifications for overlay
  const handleLargeTipReceived = (notification: TipNotification) => {
    if (notification.isLargeTip) {
      setLargeTipNotifications(prev => [notification, ...prev.slice(0, 2)]); // Keep only 3 most recent
    }
  };

  const { broadcastTip } = useTipBroadcast(room, handleLargeTipReceived);

  const handleNotificationComplete = (id: string) => {
    setLargeTipNotifications(prev => prev.filter(n => n.id !== id));
  };

  let content;

  if (!participant && connectionState === ConnectionState.Connected) {
    content = <OfflineVideo username={hostName} />;
  } else if (!participant || tracks.length === 0) {
    // content = <LoadingVideo label={connectionState} />
    content = <OfflineVideo username={hostName} thumbnailUrl={thumbnailUrl} />
  } else {
    content = <LiveVideo participant={participant} />
  };

  return (
    <div className="aspect-video border-b border-border/40 group relative">
      {content}
      
      {/* Tip overlay for large tips */}
      <TipOverlayManager 
        notifications={largeTipNotifications}
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
