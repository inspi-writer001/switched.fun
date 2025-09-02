import React, { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
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
import { useBalance, useCurrentUserAta } from "@/hooks/use-balance";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBalance, truncateWalletAddress } from "@/utils/string";
import { FundWalletModal } from "./fund-wallet-modal";

interface ProfileDropdownProps {
  currentUser: {
    id: string;
    username: string;
    picture: string;
    wallet: string | undefined
  };
  refetch: () => void;
}

export const ProfileDropdown = ({
  currentUser,
  refetch,
}: ProfileDropdownProps) => {
  const { signOut } = useUser();
  const [openFundWalletModal, setOpenFundWalletModal] = useState(false);

  const { data: currentUserAta, isLoading: isLoadingAta } = useCurrentUserAta();

  const { data: balance = 0, isLoading: isLoadingBalance } = useBalance(currentUserAta?.streamerAta);

  const handleLogout = async () => {
    await signOut();
    refetch();
  };

  return (
    <>
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
            
            {isLoadingBalance ? (
              <Skeleton className=" w-10 h-10" />
            ) : (
              <h3 className="text-3xl font-bold text-white font-sans py-2">
                ${formatBalance(balance)}
              </h3>
            )}
            <span className="inline-flex items-center gap-x-2 p-2 rounded-full border border-border cursor-pointer mb-4">
              {isLoadingAta ? (
                <Skeleton className=" w-10 h-10" />
              ) : (
                <>
                  <p className="text-md text-gray-300">{truncateWalletAddress(currentUserAta?.streamerAta ?? "")}</p>
                  <Copy className="w-4 h-4 text-gray-300 cursor-pointer" onClick={() => navigator.clipboard.writeText(currentUserAta?.streamerAta ?? "")} />
                </>
              )}
            </span>

            <Button onClick={() => setOpenFundWalletModal(true)}>Fund Wallet</Button>
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
    
      <FundWalletModal open={openFundWalletModal} setOpen={setOpenFundWalletModal} walletAddress={currentUserAta?.streamerAta ?? ""} />
    </>
  );
};
