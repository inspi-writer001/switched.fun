"use client";

import Link from "next/link";
import { Clapperboard, Loader2 } from "lucide-react";
import { UserButton, useUser } from "@civic/auth-web3/react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { createUser, getSelfById, updateUser } from "@/actions/user";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getSelf } from "@/lib/auth-service";
import { checkOrCreateUser } from "@/actions/checkUser";
import GoLive from "./goLive";

export const Actions = () => {
  const [loading, setLoading] = useState(false); // for sign‑in button
  const [submitting, setSubmitting] = useState(false); // for username form
  const [openUsernameModal, setOpenUsernameModal] = useState(false);
  const [username, setUsername] = useState(""); // input state
  const { signIn, user } = useUser();
  const [currentUser, setCurrentUser] = useState<any>(null); // your DB user

  // // 👉 1️⃣ When Civic Auth user becomes available (sign‑in/sign‑up), run our check ONCE
  useEffect(() => {
    if (!user) return;

    const run = async () => {
      try {
        const { user: me, needsUsername } = await checkOrCreateUser(user.id);
        console.log("username", me);
        setCurrentUser(me);

        if (needsUsername) {
          setOpenUsernameModal(true);
        }
      } catch (err) {
        console.error("Error during user check:", err);
      }
    };

    run();
  }, [user]);

  // 👉 2️⃣ Handle the "Login" button
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

  // 👉 3️⃣ Handle submitting the username form
  async function handleOnSubmit(e: React.FormEvent) {
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
    } catch (err) {
    } finally {
      setSubmitting(false);
      setOpenUsernameModal(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-x-2 ml-4 lg:ml-0">
      {!!user && <GoLive user={currentUser} />}
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
          <h1 className="text-center text-2xl font-bold">Choose a Username</h1>
          <form className="py-4 px-2" onSubmit={handleOnSubmit}>
            <Input
              className="w-full"
              type="text"
              value={username}
              onChange={(e) => {
                console.log(
                  "[Actions] Username input changed:",
                  e.target.value
                );
                setUsername(e.target.value);
              }}
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
