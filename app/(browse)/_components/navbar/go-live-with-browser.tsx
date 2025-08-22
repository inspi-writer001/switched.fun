"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/app/(dashboard)/u/[username]/keys/_components/copy-button";
import { ConnectModal } from "@/app/(dashboard)/u/[username]/keys/_components/connect-modal";
import { AlertCircle, Monitor } from "lucide-react";
import { BrowserGoLiveForm } from "./browser-go-live-form";

interface GoLiveWithBrowserProps {
  user: {
    id: string;
    username?: string;
  } | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const GoLiveWithBrowser = ({
  user,
  open = false,
  onOpenChange,
}: GoLiveWithBrowserProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="flex flex-col py-24">
          <h2 className="text-3xl font-semibold font-sans text-center">
            Browser Streaming
          </h2>
          <p className="text-gray-300 pt-2 pb-8 text-center">Coming soon</p>

          {/* <BrowserGoLiveForm /> */}
        </div>
      </DialogContent>
    </Dialog>
  );
};
