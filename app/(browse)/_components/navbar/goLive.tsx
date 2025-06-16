"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/app/(dashboard)/u/[username]/keys/_components/copy-button";
import { ConnectModal } from "@/app/(dashboard)/u/[username]/keys/_components/connect-modal";
import { getStreamData } from "@/app/actions/stream";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { createIngress } from "@/actions/ingress";
import { IngressInput } from "livekit-server-sdk";
import { toast } from "sonner";

interface GoLiveProps {
  user: {
    id: string;
    username?: string;
  } | null;
  size?: "default" | "sm" | "lg" | "icon";
}

const GoLive = ({ user, size = "default" }: GoLiveProps) => {
  const [stream, setStream] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchStreamData = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        setError(null);

        const result = await getStreamData();
        console.log("Stream data result:", result);

        if (result.error) {
          setError(result.error);
          setStream(null);
        } else if (result.stream) {
          setStream(result.stream);
          setError(null);
        } else {
          setError("No stream data available");
          setStream(null);
        }
      } catch (err) {
        console.error("Error fetching stream data:", err);
        setError("Failed to load stream data");
        setStream(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreamData();
  }, [user?.id]);

  const handleGenerateNewKey = async () => {
    try {
      setIsLoading(true);
      const ingress = await createIngress(IngressInput.RTMP_INPUT);
      if (ingress) {
        const result = await getStreamData();
        if (result.stream) {
          setStream(result.stream);
          toast.success("New stream key generated");
        }
      }
    } catch (error) {
      console.error("Error generating new key:", error);
      toast.error("Failed to generate new key");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToStudio = () => {
    if (!user) return;
    if (!user.username) {
      toast.error("Username is not set. Please set your username first.");
      return;
    }
    router.push(`/u/${user.username}`);
  };

  if (!user) {
    return (
      <Button variant="primary" disabled size={size}>
        Go Live
      </Button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="primary" size={size}>
          Go Live
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Stream Setup</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center p-6">Loading...</div>
        ) : error ? (
          <div className="text-destructive p-6">{error}</div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-xl bg-muted/50 p-4 flex items-start gap-x-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-2">
                <p className="font-semibold">Before you go live:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Generate a stream key if you haven&apos;t already</li>
                  <li>Copy the server URL and stream key</li>
                  <li>Open OBS and go to Settings → Stream</li>
                  <li>Select &quot;Custom&quot; as the service</li>
                  <li>Paste the server URL and stream key</li>
                  <li>Click &quot;OK&quot; to save settings</li>
                  <li>Click &quot;Start Streaming&quot; in OBS</li>
                  <li>Return here and click &quot;Go to Stream Studio&quot;</li>
                </ol>
              </div>
            </div>

            {stream ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-muted p-6">
                  <div className="flex items-center gap-x-10">
                    <p className="font-semibold shrink-0">Server URL</p>
                    <div className="space-y-2 w-full">
                      <div className="w-full flex items-center gap-x-2">
                        <Input
                          value={stream.serverUrl || ""}
                          disabled
                          placeholder="Server URL"
                        />
                        <CopyButton value={stream.serverUrl || ""} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-muted p-6">
                  <div className="flex items-start gap-x-10">
                    <p className="font-semibold shrink-0">Stream Key</p>
                    <div className="space-y-2 w-full">
                      <div className="w-full flex items-center gap-x-2">
                        <Input
                          value={stream.streamKey || ""}
                          type="password"
                          disabled
                          placeholder="Stream key"
                        />
                        <CopyButton value={stream.streamKey || ""} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between gap-x-2">
                  <Button
                    variant="secondary"
                    onClick={handleGenerateNewKey}
                    disabled={isLoading}
                  >
                    Generate New Key
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleGoToStudio}
                    className="font-semibold"
                  >
                    Go to Stream Studio
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-6 text-center text-muted-foreground">
                  No stream data available
                </div>
                <div className="flex justify-end">
                  <ConnectModal />
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GoLive;
