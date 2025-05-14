"use client";

import Link from "next/link";
import { Clapperboard, Loader2 } from "lucide-react";

import { UserButton, useUser } from "@civic/auth-web3/react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { createUser, getSelfById, updateUser } from "@/actions/user";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
      await signIn("iframe");
      // signIn will set `user`, which triggers your useEffect below
    } catch (e) {
      console.error("Login failed", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleUserCheck(user: any) {
    try {
      const me = await getSelfById(user.id);
      setCurrentUser(me);
      if (!me?.username) setOpenUsernameModal(true);
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
        await updateUser({ id: currentUser.id, username });
      } else {
        await createUser({
          externalUserId: user!.id,
          username,
          imageUrl: user!.picture!,
        });
      }
    } finally {
      setSubmitting(false);
      setOpenUsernameModal(false);
    }
  }

  useEffect(() => {
    if (user) handleUserCheck(user);
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

      {!user && (
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
      )}

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
              placeholder="Choose a username…"
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? "Updating…" : "Update Username"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
