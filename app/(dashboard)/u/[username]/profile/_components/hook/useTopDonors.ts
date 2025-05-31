// hooks/useTopDonations.ts
"use client";

import { useMemo } from "react";
import { useRecentTips, RecentTip } from "./useRecentTips";

export function useTopDonations(limit = 5, lookback = 100) {
  // fetch the last `lookback` tips
  const { tips, loading, error } = useRecentTips(lookback);

  // sort by amount descending and take top `limit`
  const top = useMemo<RecentTip[]>(() => {
    return [...tips].sort((a, b) => b.amount - a.amount).slice(0, limit);
  }, [tips, limit]);

  return { top, loading, error };
}
