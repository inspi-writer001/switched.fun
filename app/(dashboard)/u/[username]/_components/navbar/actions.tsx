"use client";

import Link from "next/link";
import { CircleUserRound, LogOut } from "lucide-react";
import { useParams } from "next/navigation";
import { useSelf } from "@/hooks/use-self";

import { Button } from "@/components/ui/button";

export const Actions = () => {
  const { username } = useParams();

  const { data: currentUser } = useSelf();

  return (
    <div className="flex items-center justify-end gap-x-2">
      <div className="flex items-center justify-end gap-x-2">
        <Link href={`/u/${username}/profile`}>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:text-white hover:bg-red-500"
          >
            <CircleUserRound className="h-5 w-5 mr-2" />
            Profile
          </Button>
        </Link>
      </div>
      <Link href="/" className="flex items-center hover:bg-red-500 rounded-md">
        <Button
          size="sm"
          variant="ghost"
          className="text-white hover:text-white hover:bg-red-500"
        >
          Exit
        </Button>
        <LogOut className="h-5 w-5 mr-2" />
      </Link>
    </div>
  );
};
