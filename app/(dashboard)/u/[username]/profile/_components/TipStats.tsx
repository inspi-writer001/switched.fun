"use client";

import React, { useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { useTokenBalances } from "./useTokenBalances";
import { usePrices } from "./usePrices";

export default function TipStats() {
  // 1️⃣ On-chain SOL & SPL balances
  const {
    solBalance,
    splTokens,
    loading: balLoading,
    error: balError,
  } = useTokenBalances();

  // 2️⃣ USD prices for SOL, USDT & USDC
  const { prices, loading: priceLoading, error: priceError } = usePrices();

  // real mint addresses
  const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
  const USDT_MINT = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";

  // 3️⃣ Compute USD breakdown & total from on-chain data
  const { totalUSD, breakdown } = useMemo(() => {
    let solUSD = 0,
      usdtUSD = 0,
      usdcUSD = 0,
      othersUSD = 0;

    if (!balLoading && !priceLoading && !balError && !priceError) {
      // SOL → USD
      if (solBalance != null && prices.sol != null) {
        solUSD = solBalance * prices.sol;
      }

      // each SPL token → USD
      splTokens.forEach(({ mint, amount }) => {
        if (mint === USDT_MINT) {
          usdtUSD += amount * (prices.usdt ?? 1);
        } else if (mint === USDC_MINT) {
          usdcUSD += amount * (prices.usdc ?? 1);
        } else {
          // everything else, price it in SOL
          othersUSD += amount * (prices.sol ?? 0);
        }
      });
    }

    return {
      totalUSD: solUSD + usdtUSD + usdcUSD + othersUSD,
      breakdown: { solUSD, usdtUSD, usdcUSD, othersUSD },
    };
  }, [
    solBalance,
    splTokens,
    prices,
    balLoading,
    priceLoading,
    balError,
    priceError,
  ]);

  // 4️⃣ Dev‐log
  useEffect(() => {
    console.log("SOL balance:", solBalance);
    console.log("SPL tokens:", splTokens);
    console.log("Prices:", prices);
    console.log("Breakdown USD:", breakdown);
    console.log("Total USD:", totalUSD);
  }, [solBalance, splTokens, prices, breakdown, totalUSD]);

  // 5️⃣ Helper to render a value or show Loading…
  const renderAmt = (value: number) =>
    balLoading || priceLoading ? (
      <span className="text-sm text-muted-foreground">Loading…</span>
    ) : (
      `$${value.toFixed(2)}`
    );

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-accent py-2 px-4">
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
              <p className="text-2xl font-bold">{renderAmt(totalUSD)}</p>
            </div>
          </div>

          {/* Right: breakdown */}
          <div className="text-right text-xs text-muted-foreground space-y-1">
            <div>
              SOL:{" "}
              <span className="text-foreground font-medium">
                {renderAmt(breakdown.solUSD)}
              </span>
            </div>
            <div>
              USDT:{" "}
              <span className="text-foreground font-medium">
                {renderAmt(breakdown.usdtUSD)}
              </span>
            </div>
            <div>
              USDC:{" "}
              <span className="text-foreground font-medium">
                {renderAmt(breakdown.usdcUSD)}
              </span>
            </div>
            <div>
              Others:{" "}
              <span className="text-foreground font-medium">
                {renderAmt(breakdown.othersUSD)}
              </span>
            </div>
          </div>
        </div>

        {/* show any errors inline */}
        {(balError || priceError) && (
          <p className="mt-2 text-sm text-red-600">{balError || priceError}</p>
        )}
      </CardContent>
    </Card>
  );
}
