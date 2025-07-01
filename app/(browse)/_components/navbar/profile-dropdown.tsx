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

interface ProfileDropdownProps {
  currentUser: {
    id: string;
    username: string;
    picture: string;
  };
  refetch: () => void;
}

export const ProfileDropdown = ({ currentUser, refetch }: ProfileDropdownProps) => {
  const { signOut } = useUser();

  const handleLogout = async () => {
    await signOut();
    refetch();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-x-2 border rounded-md border-border p-1 px-2">
        <Avatar className="w-8 h-8">
          <AvatarImage src={currentUser?.picture} />
          <AvatarFallback>{currentUser?.username?.charAt(0)}</AvatarFallback>
        </Avatar>

        <span className="hidden lg:block text-sm text-muted-foreground capitalize">{currentUser?.username}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
