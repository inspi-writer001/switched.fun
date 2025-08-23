import React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@civic/auth-web3/react";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  LogOut,
  Podcast,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProfileDropdownProps {
  currentUser: {
    id: string;
    username: string;
    picture: string;
  };
  refetch: () => void;
}

export const ProfileDropdown = ({
  currentUser,
  refetch,
}: ProfileDropdownProps) => {
  const { signOut } = useUser();

  const handleLogout = async () => {
    console.log("Logout");
    await signOut();
    console.log("Logout");
    refetch();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-x-2 border rounded-md border-border p-1 px-2">
        <Avatar className="w-8 h-8">
          <AvatarImage src={currentUser?.picture} />
          <AvatarFallback>{currentUser?.username?.charAt(0)}</AvatarFallback>
        </Avatar>

        <span className="hidden lg:block text-sm text-muted-foreground capitalize">
          {currentUser?.username}
        </span>

        <ChevronDown className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-64 bg-background">
        <div className="flex flex-col items-center pt-8 pb-6">
          <p className="text-sm text-gray-300 capitalize text-center">
            Total Balance
          </p>
          <h3 className="text-3xl font-bold text-white font-sans py-2">
            $2,000.00
          </h3>
          <span className="inline-flex items-center gap-x-2 p-2 rounded-full border border-border cursor-pointer mb-4">
            <p className="text-md text-gray-300">0FZCz...5C2d</p>
            <Copy className="w-4 h-4 text-gray-300 cursor-pointer" />
          </span>

          <Button>Fund Wallet</Button>
        </div>
        <DropdownMenuSeparator className="bg-border" />

        <Link href={`/u/${currentUser?.username}`}>
          <DropdownMenuItem className="cursor-pointer flex justify-between p-3 bg-transparent hover:bg-transparent">
            <div className="flex items-center gap-x-2">
              <Podcast className="w-4 h-4" />
              <p className="text-sm text-gray-300 capitalize">Stream studio</p>
            </div>

            <ChevronRight className="w-4 h-4" />
          </DropdownMenuItem>
        </Link>

        <Link href={`/u/${currentUser?.username}/profile`}>
          <DropdownMenuItem className="cursor-pointer flex justify-between p-3 bg-transparent hover:bg-transparent">
            <div className="flex items-center gap-x-2">
              <User className="w-4 h-4" />
              <p className="text-sm text-gray-300 capitalize">Profile</p>
            </div>
            <ChevronRight className="w-4 h-4" />
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          className="cursor-pointer flex justify-between p-3 bg-transparent hover:bg-transparent"
          onClick={handleLogout}
        >
          <div className="flex items-center gap-x-2">
            <LogOut className="w-4 h-4" />
            <p className="text-sm text-gray-300 capitalize">Logout</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
