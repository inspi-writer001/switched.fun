// hooks/usePrices.ts
"use client";

import { useState, useEffect } from "react";

interface Prices {
  sol?: number;
  usdt?: number;
  usdc?: number;
}

export function usePrices() {
  const [prices, setPrices] = useState<Prices>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=solana,tether,usd-coin&vs_currencies=usd"
        );
        const data = await res.json();
        setPrices({
          sol: data["solana"]?.usd,
          usdt: data["tether"]?.usd,
          usdc: data["usd-coin"]?.usd,
        });
      } catch (e: any) {
        console.error(e);
        setError("Failed to fetch prices");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { prices, loading, error };
}
