"use client";

import { userHasWallet } from "@civic/auth-web3";
import { useUser } from "@civic/auth-web3/react";
import { useEffect } from "react";

export default function CreateWallet() {
  const userContext = useUser();

  useEffect(() => {
    const setupWallet = async () => {
      // 1) If not signed in yet, bail out
      if (!userContext.user) {
        return;
      }

      // 2) Only when signed in & no embedded wallet
      if (!userHasWallet(userContext)) {
        try {
          // <-- now `createWallet` is guaranteed to exist
          await userContext.createWallet();
          console.log("Wallet created successfully");
        } catch (error) {
          console.error("Error creating wallet:", error);
        }
      }
    };

    setupWallet();
  }, [userContext]);

  return null;
}
