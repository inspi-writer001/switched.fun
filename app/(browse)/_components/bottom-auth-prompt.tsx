"use client";

import { Button } from "@/components/ui/button";
import { useSelf } from "@/hooks/use-self";
import { useUser } from "@civic/auth-web3/react";
import React, { useState } from "react";

export const BottomAuthPrompt = () => {
  const { signIn } = useUser();
  const [loading, setLoading] = useState(false);

  const { isLoading, refetch } = useSelf();

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

  return (
    <div className="fixed bottom-0 w-full py-2 px-4 bg-primary z-50">
      <div className="flex items-center justify-between h-full">
        <p className="text-sm md:text-base text-gray-100">
          Sign in to experience the best of{" "}
          <span className="font-bold text-white">Switched</span>
        </p>

        <Button
          onClick={handleLogin}
          disabled={loading || isLoading}
          variant="secondary"
          className="bg-white text-primary px-8"
        >
          Login
        </Button>
      </div>
    </div>
  );
};
