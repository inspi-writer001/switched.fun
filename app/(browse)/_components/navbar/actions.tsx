"use client";

import { Loader2 } from "lucide-react";
import { useUser } from "@civic/auth-web3/react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import GoLive from "./goLive";
import { UpdateUserProfileModal } from "./update-profile-modal";
import { ActivatePlatformWalletModal } from "./activate-platform-wallet-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileDropdown } from "./profile-dropdown";
import { useSelf } from "@/hooks/use-self";
const log = console.log;

export const Actions = () => {
  const [loading, setLoading] = useState(false);
  const [openUsernameModal, setOpenUsernameModal] = useState(false);
  const [openPlatformWalletModal, setOpenPlatformWalletModal] = useState(false);
  const { signIn } = useUser();

  const { data: currentUser, isLoading, isError, refetch } = useSelf();

  console.log("currentUser", currentUser?.solanaWallet);

  // Handle modal opening logic
  useEffect(() => {
    if (!isLoading && !isError && currentUser) {
      // First priority: check if user needs to complete profile
      if (!currentUser?.username || !currentUser?.interests?.length) {
        setOpenUsernameModal(true);
        setOpenPlatformWalletModal(false);
      } 
      // Second priority: check if user needs platform wallet
      else if ((currentUser as any)?.needsPlatformWallet) {
        setOpenUsernameModal(false);
        setOpenPlatformWalletModal(true);
      }
      // All good, close any open modals
      else {
        setOpenUsernameModal(false);
        setOpenPlatformWalletModal(false);
      }
    }
  }, [currentUser, isLoading, isError]);

  // 👉 2️⃣ Handle the "Login" button
  async function handleLogin() {
    setLoading(true);
    try {
      await signIn();
      refetch();
    } catch (error) {
      console.error("Error signing in:", error);
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) {
    return <Skeleton className="w-12 h-6" />;
  }

  if (isError) {
    return (
      <Button
        onClick={handleLogin}
        disabled={loading}
        variant="default"
        size="sm"
        className="px-8"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in…
          </>
        ) : (
          "Login"
        )}
      </Button>
    );
  }

  return (
    <div className="flex items-center justify-end gap-x-6 ml-4 lg:ml-0">
      {!!currentUser && (
        <GoLive
          user={{
            id: currentUser?.id ?? "",
            username: currentUser?.username ?? "",
          }}
        />
      )}
      {!!currentUser && (
        <div className="flex items-center gap-x-4">
          <ProfileDropdown
            currentUser={{
              id: currentUser?.id ?? "",
              username: currentUser?.username ?? "",
              picture: currentUser?.imageUrl ?? "",
              wallet: currentUser?.solanaWallet ?? "",
            }}
            refetch={refetch}
          />
        </div>
      )}

      <UpdateUserProfileModal
        open={openUsernameModal}
        setOpen={setOpenUsernameModal}
        currentUser={{
          id: currentUser?.id ?? "",
          username: currentUser?.username ?? "",
          picture: currentUser?.imageUrl ?? "",
          interests: currentUser?.interests ?? [],
        }}
      />

      <ActivatePlatformWalletModal
        open={openPlatformWalletModal}
        setOpen={setOpenPlatformWalletModal}
        currentUser={{
          id: currentUser?.id ?? "",
          username: currentUser?.username ?? "",
        }}
        onSuccess={() => {
          console.log("Platform wallet activated successfully");
          refetch(); // Refresh user data
        }}
      />
    </div>
  );
};
