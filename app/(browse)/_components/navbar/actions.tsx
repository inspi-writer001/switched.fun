"use client";

import Link from "next/link";
import { Clapperboard } from "lucide-react";

// import { getUser } from "@civic/auth-web3/nextjs";
import { UserButton, useUser } from "@civic/auth-web3/react";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { createUser, getSelfById, updateUser } from "@/actions/user";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
// import { LoginButton } from "./login-button";

export const Actions = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openUsernameModal, setOpenUsernameModal] = useState(false);
  const [username, setUsername] = useState("");
  const { signIn, user } = useUser();
  const [currentUser, setCurrentUser] = useState<any>(null);

  async function handleLogin() {
    setLoading(true);
    try {
      const loggedIn = await signIn("iframe");
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }

  async function handleUserCheck(user: any) {
    try {
      const currentUser = await getSelfById(user.id);
      setCurrentUser(currentUser);

      if (!currentUser?.username) {
        setOpenUsernameModal(true);
      }
    } catch (e: any) {
      if (e.message === "User not found") {
        setOpenUsernameModal(true);
      }
    }
  }

  async function handleOnSubmit(e: any) {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (currentUser) {
        // update username
        await updateUser({
          id: currentUser.id,
          username,
        });
      } else {
        // create user
        await createUser({
          externalUserId: user?.id ?? "",
          username,
          imageUrl: user?.picture ?? "",
        });
      }
    } catch (e) {
      console.log("Something went wrong!");
    } finally {
      setSubmitting(false);
      setOpenUsernameModal(false);
    }
  }

  useEffect(() => {
    if (user) {
      handleUserCheck(user);
    }
  }, [user]);

  return (
    <div className="flex items-center justify-end gap-x-2 ml-4 lg:ml-0">
      {!!user && (
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
          <UserButton />
        </div>
      )}

      {!user && <Button onClick={handleLogin}>{loading ? "Loading..." : "Login"}</Button>}

      <Dialog onOpenChange={setOpenUsernameModal} open={openUsernameModal}>
        <DialogClose />

        <DialogContent>
          <h1 className="text-center text-2xl font-bold">Update Username</h1>
          <form className="py-4 px-2" onSubmit={handleOnSubmit}>
            <Input
              className="w-full"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Button type="submit">
              {submitting ? "Loading..." : "Update Username"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
