"use client";

import Link from "next/link";
import { Clapperboard, Loader2 } from "lucide-react";
import { useUser } from "@civic/auth-web3/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import GoLive from "./goLive";
import { UpdateUserProfileModal } from "./update-profile-modal";
import { useQuery } from "@tanstack/react-query";
import { getSelf } from "@/lib/auth-service";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileDropdown } from "./profile-dropdown";

export const Actions = () => {
  const [loading, setLoading] = useState(false);
  const [openUsernameModal, setOpenUsernameModal] = useState(false);
  const { signIn } = useUser();

  const {
    data: currentUser,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => getSelf(),
  });

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
    <div className="flex items-center justify-end gap-x-2 ml-4 lg:ml-0">
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
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-primary"
            asChild
          >
            <Link href={`/u/${currentUser?.username ?? ""}`}>
              <Clapperboard className="h-5 w-5 lg:mr-2" />
              <span className="hidden lg:block">Dashboard</span>
            </Link>
          </Button>
          <ProfileDropdown
            currentUser={{
              id: currentUser?.id ?? "",
              username: currentUser?.username ?? "",
              picture: currentUser?.imageUrl ?? "",
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
    </div>
  );
};
