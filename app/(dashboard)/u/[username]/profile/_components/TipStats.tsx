"use client";

import React, { useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { formatBalance } from "@/utils/string";
import { useBalance, useCurrentUserAta } from "@/hooks/use-balance";

export default function TipStats() {
  const { data: currentUserAta, isLoading: isLoadingAta } = useCurrentUserAta();

  const { data: balance = 0, isLoading: isLoadingBalance } = useBalance(
    currentUserAta?.streamerAta
  );

  return (
    <Card className="overflow-hidden bg-background">
      <div className="bg-transparent py-2 px-4 w-full border-b">
        <span className="text-white text-sm font-medium">
          Total Tips Received (This Month)
        </span>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          {/* Left: total */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {" "}
                ${formatBalance(balance)}
              </p>
            </div>
          </div>

          {/* Right: breakdown */}
          <div className="text-right text-xs text-white space-y-1">
            <div>
              USDC:{" "}
              <span className="text-white font-medium">
                ${formatBalance(balance)}
              </span>
            </div>
          </div>
        </div>

        {/* show any errors inline */}
        {(isLoadingAta || isLoadingBalance) && (
          <p className="mt-2 text-sm text-red-600">Loading…</p>
        )}
      </CardContent>
    </Card>
  );
}
