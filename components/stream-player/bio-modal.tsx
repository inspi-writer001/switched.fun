"use client";

import { toast } from "sonner";
import { useState, useTransition, useRef } from "react";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { updateUser } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface BioModalProps {
  initialValue?: string;
}

export const BioModal: React.FC<BioModalProps> = ({ initialValue = "" }) => {
  // 1️⃣ Use HTMLButtonElement for the ref
  const closeRef = useRef<HTMLButtonElement>(null);
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(initialValue);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 2️⃣ Wrap your async server action in an async transition callback
    startTransition(async () => {
      try {
        await updateUser({
          bio: value,
          id: "",
        });
        toast.success("User bio updated");
        // 3️⃣ Click the “Cancel” button to close the dialog
        closeRef.current?.click();
      } catch {
        toast.error("Something went wrong");
      }
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="ml-auto">
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit user bio</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <Textarea
            placeholder="User bio"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isPending}
            className="resize-none"
          />

          <div className="flex justify-between">
            {/* 
              4️⃣ Move the ref onto the actual <button>, 
              not onto DialogClose itself 
            */}
            <DialogClose asChild>
              <Button type="button" variant="ghost" ref={closeRef}>
                Cancel
              </Button>
            </DialogClose>

            <Button type="submit" variant="primary" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
