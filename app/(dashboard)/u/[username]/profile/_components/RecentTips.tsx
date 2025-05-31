// components/RecentTips.tsx
"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { useRecentTips } from "./hook/useRecentTips";
import { useUser } from "@civic/auth-web3/react";
import { userHasWallet } from "@civic/auth-web3";

export default function RecentTips() {
  // 1️⃣ Civic wallet state
  const userContext = useUser();
  const hasWallet = userHasWallet(userContext);

  // 2️⃣ Don’t fetch or render tips until wallet is connected
  if (!hasWallet) {
    return (
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Recent Tips</h2>
        <p className="text-sm text-muted-foreground">
          Please connect your wallet to view recent tips.
        </p>
      </Card>
    );
  }

  // 3️⃣ Now safe to fetch
  const { tips, loading, error } = useRecentTips(5);

  // helper to trim long addresses
  const shorten = (addr: string) =>
    addr.length > 8 ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : addr;

  // token color mapping
  const getTokenColor = (currency: string) => {
    switch (currency) {
      case "SOL":
        return "bg-yellow-500";
      case "USDC":
        return "bg-blue-500";
      case "USDT":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">Recent Tips</h2>
      <div className="space-y-4">
        {loading ? (
          // loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 pb-4">
              <div className="bg-gray-200 rounded-full h-10 w-10 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
            </div>
          ))
        ) : error ? (
          <p className="text-sm text-red-600 mt-2">{error}</p>
        ) : tips.length > 0 ? (
          tips.map((tip) => (
            <div
              key={tip.id}
              className="flex items-start gap-3 border-b pb-4 last:border-0"
            >
              <div
                className={`h-10 w-10 rounded-full ${getTokenColor(
                  tip.currency
                )} flex items-center justify-center text-white`}
              >
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="font-medium">{shorten(tip.sender)}</p>
                  <p className="text-sm text-muted-foreground">{tip.timeAgo}</p>
                </div>
                {tip.message && (
                  <p className="text-sm mt-1 text-muted-foreground">
                    {tip.message}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {tip.amount.toFixed(4)} {tip.currency}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No recent tips found
          </p>
        )}
      </div>
    </Card>
  );
}
