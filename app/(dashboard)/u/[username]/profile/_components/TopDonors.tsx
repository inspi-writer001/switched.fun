// components/TopDonors.tsx
"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { useTopDonations } from "./hook/useTopDonors";

export default function TopDonations() {
  const { top, loading, error } = useTopDonations(5, 100);

  const shorten = (addr: string) =>
    addr.length > 8 ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : addr;

  // Format amount with appropriate decimal places
  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'SOL') {
      return amount >= 1 ? amount.toFixed(2) : amount.toFixed(4);
    }
    // For tokens, show more decimal places
    return amount >= 1 ? amount.toFixed(2) : amount.toFixed(6);
  };

  return (
    <Card className="p-4 bg-background">
      <h2 className="text-xl font-semibold mb-4">Top Donors</h2>
      <div className="space-y-4">
        {loading ? (
          // Show loading skeletons when data is loading
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`loading-${i}`}
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
              </div>
            </div>
          ))
        ) : top.length > 0 ? (
          // Show top donors when data is loaded
          top.map((donor, i) => (
            <div key={donor.id} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-semibold">
                  {i + 1}
                </div>
                <div>
                  <p className="font-medium">{shorten(donor.id)}</p>
                  <p className="text-xs text-muted-foreground">
                    {donor.count} donation{donor.count > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {formatAmount(donor.totalAmount, donor.currency)} {donor.currency}
                </div>
                {donor.currency !== 'SOL' && (
                  <p className="text-xs text-muted-foreground">
                    {donor.currency}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          // Show message when no donors found
          <div className="text-center py-4 text-muted-foreground text-sm">
            No donations received yet
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 mt-2">
            {error}
          </p>
        )}
      </div>
    </Card>
  );
}
