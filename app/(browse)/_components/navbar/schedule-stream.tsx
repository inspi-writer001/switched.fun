"use client";

import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScheduleStreamForm } from "./schedule-stream-form";
interface ScheduleStreamProps {
  user: {
    id: string;
    username?: string;
  } | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ScheduleStream = ({
  user,
  open = false,
  onOpenChange,
}: ScheduleStreamProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="flex flex-col py-24">
          <h2 className="text-3xl font-semibold font-sans text-center">
            Start a New Stream
          </h2>
          <p className="text-gray-400 pt-2 pb-8 text-center">
            Add a title. You can update it later.
          </p>

          <ScheduleStreamForm />
        </div>
      </DialogContent>
    </Dialog>
  );
};
