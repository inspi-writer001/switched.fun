"use client";

import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  const handleSuccess = () => {
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="flex flex-col py-24">
          <h2 className="text-3xl font-semibold font-sans text-center">
            Start a New Stream
          </h2>
          <p className="text-muted-foreground pt-2 pb-8 text-center">
            Add a title. You can update it later.
          </p>

          <BrowserGoLiveForm user={user} onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
