// hooks/useTopDonations.ts
"use client";

import { useMemo } from "react";
import { useRecentTips, RecentTip } from "./useRecentTips";

interface TopDonor extends Omit<RecentTip, 'id'> {
  id: string; // wallet address of the sender
  totalAmount: number;
  count: number;
  lastDonation: number;
}

export function useTopDonations(limit = 5, lookback = 100) {
  // fetch the last `lookback` tips with real-time updates
  const { tips, loading, error } = useRecentTips(lookback);

  // Aggregate and sort donors by total amount donated
  const top = useMemo<TopDonor[]>(() => {
    // Create a map to aggregate donations by sender
    const donorMap = new Map<string, TopDonor>();
    
    tips.forEach(tip => {
      const existing = donorMap.get(tip.sender);
      
      if (existing) {
        // Update existing donor
        existing.totalAmount += tip.amount;
        existing.count += 1;
        // Keep the most recent donation timestamp
        if (tip.timestamp > existing.lastDonation) {
          existing.lastDonation = tip.timestamp;
          // Update currency to the most recent one
          existing.currency = tip.currency;
        }
      } else {
        // Add new donor
        donorMap.set(tip.sender, {
          ...tip,
          id: tip.sender, // Use sender address as ID for the donor
          totalAmount: tip.amount,
          count: 1,
          lastDonation: tip.timestamp
        });
      }
    });

    // Convert map to array, sort by total amount (descending) and take top N
    return Array.from(donorMap.values())
      .sort((a, b) => {
        // First sort by total amount (descending)
        if (b.totalAmount !== a.totalAmount) {
          return b.totalAmount - a.totalAmount;
        }
        // If amounts are equal, sort by most recent donation (descending)
        return b.lastDonation - a.lastDonation;
      })
      .slice(0, limit);
  }, [tips, limit]);

  return { top, loading, error };
}
