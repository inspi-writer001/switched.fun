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

export const Actions = () => {
  const [loading, setLoading] = useState(false);
  const [openUsernameModal, setOpenUsernameModal] = useState(false);
  const { signIn, user: civicUser, isAuthenticated } = useUser();

  const {
    data: currentUser,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => getSelf(),
    enabled: isAuthenticated && !!civicUser?.id, // Only fetch when Civic auth is confirmed
    retry: (failureCount, error) => {
      // Don't retry if it's an authentication error
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('User not found')) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  // Handle the "Login" button
  async function handleLogin() {
    setLoading(true);
    try {
      await signIn();
    } catch (error) {
      console.error("Error signing in:", error);
    } finally {
      setLoading(false);
    }
  }

  // Show loading while signing in or while checking authentication
  if (loading || (isAuthenticated && isLoading)) {
    return (
      <div className="flex items-center justify-end gap-x-2 ml-4 lg:ml-0">
        <Skeleton className="w-16 h-8" />
      </div>
    );
  }

  // If not authenticated, show login button
  if (!isAuthenticated || !civicUser) {
    return (
      <div className="flex items-center justify-end gap-x-2 ml-4 lg:ml-0">
        <Button
          onClick={handleLogin}
          disabled={loading}
          variant="default"
          size="sm"
        >
          {loading && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Login
        </Button>
      </div>
    );
  }

  // If authenticated but there's an error fetching user data, show retry button
  if (isAuthenticated && isError) {
    return (
      <div className="flex items-center justify-end gap-x-2 ml-4 lg:ml-0">
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
        >
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Retry
        </Button>
      </div>
    );
  }

  // If authenticated but no user data yet, show loading
  if (isAuthenticated && !currentUser) {
    return (
      <div className="flex items-center justify-end gap-x-2 ml-4 lg:ml-0">
        <Skeleton className="w-16 h-8" />
      </div>
    );
  }

  // Show authenticated user interface
  return (
    <div className="flex items-center justify-end gap-x-2 ml-4 lg:ml-0">
      {currentUser && (
        <>
          <GoLive
            user={{
              id: currentUser.id,
              username: currentUser.username,
            }}
          />
          <div className="flex items-center gap-x-4">
            <Button
              size="sm"
              variant="ghost"
              asChild
            >
              <Link href={`/u/${currentUser.username}`}>
                <Clapperboard className="h-5 w-5 lg:mr-2" />
                <span className="hidden lg:block">Dashboard</span>
              </Link>
            </Button>
            <UserButton />
          </div>

          <UpdateUserProfileModal
            open={openUsernameModal}
            setOpen={setOpenUsernameModal}
            currentUser={{
              id: currentUser.id,
              username: currentUser.username,
              picture: currentUser.imageUrl ?? "",
              interests: currentUser.interests ?? [],
            }}
          />
        </>
      )}
    </div>
  );
};
