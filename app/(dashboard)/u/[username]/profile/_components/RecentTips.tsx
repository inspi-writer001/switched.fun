// components/RecentTips.tsx
"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { useRecentTips } from "./hook/useRecentTips";
import { useBalance, useCurrentUserAta } from "@/hooks/use-balance";

interface Tip {
  id: string;
  sender: string;
  amount: number;
  currency: string;
  timeAgo: string;
  message?: string;
}

export default function RecentTips() {
  const { data: currentUserAta, isLoading: isLoadingAta } = useCurrentUserAta();

  const { data: balance = 0, isLoading: isLoadingBalance } = useBalance(
    currentUserAta?.streamerAta
  );

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
    <Card className="p-4 bg-background">
      <h2 className="text-xl font-semibold mb-4">Recent Tips</h2>
      <div className="space-y-4">
        {isLoadingAta || isLoadingBalance ? (
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
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No recent tips found
          </p>
        )}
      </div>
    </Card>
  );
}
