// app/(dashboard)/u/[username]/profile/_components/hook/useTipStats.ts
"use client";

import { useRecentTips } from "./useRecentTips";
import { useEffect, useState } from "react";

export function useTipStats() {
  const { tips, loading, error } = useRecentTips(100); // Get more tips for stats
  const [stats, setStats] = useState({
    totalAmount: 0,
    tipCount: 0,
    averageTip: 0,
    topToken: "SOL",
  });

  useEffect(() => {
    if (loading || error || tips.length === 0) return;

    // Calculate statistics
    const totalAmount = tips.reduce((sum, tip) => sum + tip.amount, 0);
    const tipCount = tips.length;
    const averageTip = totalAmount / tipCount;

    // Find most tipped token
    const tokenCounts: Record<string, number> = {};
    tips.forEach((tip) => {
      tokenCounts[tip.currency] = (tokenCounts[tip.currency] || 0) + 1;
    });

    const topToken =
      Object.entries(tokenCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([token]) => token)[0] || "SOL";

    setStats({
      totalAmount,
      tipCount,
      averageTip,
      topToken,
    });
  }, [tips, loading, error]);

  return {
    stats,
    loading,
    error,
  };
}
