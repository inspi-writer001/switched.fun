// components/TopDonors.tsx
"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { useTopDonations } from "./hook/useTopDonors";
import { useUser } from "@civic/auth-web3/react";
import { userHasWallet } from "@civic/auth-web3";

export default function TopDonations() {
  // 1️⃣ Get Civic wallet context
  const userContext = useUser();
  const hasWallet = userHasWallet(userContext);

  // 2️⃣ Don’t fetch anything until wallet’s connected
  if (!hasWallet) {
    return (
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Top Donations</h2>
        <p className="text-sm text-muted-foreground">
          Please connect your wallet to view top donors.
        </p>
      </Card>
    );
  }

  // 3️⃣ Now it’s safe to call the hook
  const { top, loading, error } = useTopDonations(5, 100);

  const shorten = (addr: string) =>
    addr.length > 8 ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : addr;

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">Top Donations</h2>
      <div className="space-y-4">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex justify-between items-center animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200" />
                    <div className="h-3 w-16 bg-gray-200" />
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="h-4 w-12 bg-gray-200 mx-auto" />
                  <div className="h-3 w-10 bg-gray-200 mx-auto" />
                </div>
              </div>
            ))
          : top.map((tip, i) => (
              <div key={tip.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-semibold">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-medium">{shorten(tip.sender)}</p>
                    <p className="text-sm text-muted-foreground">
                      {tip.currency === "SOL"
                        ? `${tip.amount.toFixed(4)} SOL`
                        : `${tip.amount.toFixed(4)} ${shorten(tip.currency)}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {/* <DollarSign className="inline-block h-5 w-5 text-primary mr-1" /> */}
                  <span className="font-medium">{tip.amount.toFixed(2)}</span>
                </div>
              </div>
            ))}

        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>
    </Card>
  );
}
