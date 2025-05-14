"use client";

import Link from "next/link";
import { CircleUserRound, LogOut } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

import { Button } from "@/components/ui/button";

export const Actions = () => {
  const router = useRouter();
  const { username } = useParams(); // ← grabs the [username] from /u/[username]

  const handleProfile = () => {
    if (username) {
      router.push(`/u/${username}/profile`);
    }
  };
  return (
    <div className="flex items-center justify-end gap-x-2">
      <div className="flex items-center justify-end gap-x-2">
        <Button
          onClick={handleProfile}
          size="sm"
          variant="ghost"
          className="text-muted-foreground hover:text-primary"
        >
          <CircleUserRound className="h-5 w-5 mr-2" />
          Profile
        </Button>
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="text-muted-foreground hover:text-primary"
      >
        <Link href="/">
          <LogOut className="h-5 w-5 mr-2" />
          Exit
        </Link>
      </Button>
    </div>
  );
};
