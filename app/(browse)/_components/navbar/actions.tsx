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

export const Actions = () => {
  const [loading, setLoading] = useState(false); // for sign‑in button
  const [submitting, setSubmitting] = useState(false); // for username form
  const [openUsernameModal, setOpenUsernameModal] = useState(false);
  const [username, setUsername] = useState(""); // input state
  const { signIn, user } = useUser();
  const [currentUser, setCurrentUser] = useState<any>(null); // your DB user

  // 👉 1️⃣ When Civic Auth user becomes available (sign‑in/sign‑up), run our check ONCE
  useEffect(() => {
    if (!user) return;
    console.log("Calling server action checkOrCreateUser…");

    const run = async () => {
      try {
        const { user: me, needsUsername } = await checkOrCreateUser();
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

  // 👉 2️⃣ Handle the “Login” button
  async function handleLogin() {
    console.log("[Actions] handleLogin() called");
    setLoading(true);
    try {
      await signIn("iframe");
      console.log("[Actions] signIn() resolved; Civic user should now be set");
    } catch (e) {
      console.error("[Actions] Login failed:", e);
    } finally {
      setLoading(false);
    }
  }

  // 👉 3️⃣ Handle submitting the username form
  async function handleOnSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("[Actions] Username form submitted:", username);
    setSubmitting(true);
    try {
      if (currentUser) {
        console.log("[Actions] Updating existing user:", currentUser.id);
        await updateUser({ id: currentUser.id, username });
      } else {
        console.log("[Actions] Creating new user for Civic ID:", user!.id);
        await createUser({
          externalUserId: user!.id,
          username,
          imageUrl: user!.picture!,
        });
      }
    } catch (err) {
      console.error("[Actions] Error in create/update user:", err);
    } finally {
      setSubmitting(false);
      console.log("[Actions] Closing username modal");
      setOpenUsernameModal(false);
    }
  }

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
