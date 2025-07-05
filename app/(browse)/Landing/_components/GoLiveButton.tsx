"use client";

import { useUser } from "@civic/auth-web3/react";
import { useEffect, useState } from "react";
import { checkOrCreateUser } from "@/actions/checkUser";
import GoLive from "../../_components/navbar/goLive";

export function GoLiveButton() {
  const { user } = useUser();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const run = async () => {
      setIsLoading(true);
      try {
        const { user: me } = await checkOrCreateUser(user.id);
        setCurrentUser(me);
      } catch (err) {
        console.error("Error during user check:", err);
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [user]);

  if (!user || isLoading) return null;

  return <GoLive user={currentUser} size="lg" />;
} 