// components/DonationChart.tsx
"use client";

import React, { useMemo } from "react";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Bar,
  Legend,
  Line,
} from "recharts";
import dayjs from "dayjs";

// ─── pull in token‐balance logic ─────────────────────────────────────────────
import { useTokenBalances } from "./useTokenBalances";
import { usePrices } from "./usePrices";
// ─────────────────────────────────────────────────────────────────────────────
import { useRecentTips } from "./hook/useRecentTips";

interface DonationChartProps {
  period: "day" | "week" | "month" | "year";
}

// Hard‐code the two known stablecoin mints:
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const USDT_MINT = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";

// Colors for each series (SOL, USDC, USDT, Others, and Total line):
const TOKEN_COLORS: Record<string, string> = {
  SOL: "#9945FF",
  USDC: "#2775CA",
  USDT: "#26A17B",
  Others: "#888888",
  Total: "#9b87f5",
};

export default function DonationChart({ period }: DonationChartProps) {
  // ─── Step 1: historical tips ───────────────────────────────────────────────
  const { tips } = useRecentTips(100);

  // ─── Step 2: on‐chain balances & prices (to replicate TipStats’ “Others”) ──
  const {
    solBalance,
    splTokens,
    loading: balLoading,
    error: balError,
  } = useTokenBalances();
  const { prices, loading: priceLoading, error: priceError } = usePrices();

  // compute on‐chain “othersUSD” exactly the same way as TipStats:
  const onChainOthersUSD = useMemo(() => {
    if (balLoading || priceLoading || balError || priceError) return 0;
    // sum of every SPL token whose mint ≠ USDC_MINT and ≠ USDT_MINT:
    return splTokens
      .filter(({ mint }) => mint !== USDC_MINT && mint !== USDT_MINT)
      .reduce((sum, { amount }) => sum + amount * (prices.sol ?? 0), 0);
  }, [splTokens, prices, balLoading, priceLoading, balError, priceError]);

  // ─── Step 3: build historical‐tips buckets, then append a “Now” bucket ────
  //    Data rows will look like:
  //    { name: string, SOL: number, USDC: number, USDT: number, Others: number, total: number }
  const data = useMemo(() => {
    const now = dayjs();
    const buckets: string[] = [];
    const map: Record<
      string,
      { SOL: number; USDC: number; USDT: number; Others: number }
    > = {};

    const count =
      period === "day"
        ? 24
        : period === "week"
        ? 7
        : period === "month"
        ? 4
        : 12;

    // 3.1 Initialize each historical bucket with zeros
    for (let i = count - 1; i >= 0; i--) {
      const t = now.subtract(
        i,
        period === "day"
          ? "hours"
          : period === "week"
          ? "days"
          : period === "month"
          ? "weeks"
          : "months"
      );

      let key: string;
      if (period === "day") key = t.format("H:00");
      else if (period === "week") key = t.format("ddd");
      else if (period === "month") key = `Week ${Math.ceil(t.date() / 7)}`;
      else key = t.format("MMM");

      buckets.push(key);
      map[key] = { SOL: 0, USDC: 0, USDT: 0, Others: 0 };
    }

    // 3.2 Tally each tip into its bucket
    tips.forEach((tip) => {
      const tm = dayjs.unix(tip.timestamp);
      let key = "";
      if (period === "day") key = tm.format("H:00");
      else if (period === "week") key = tm.format("ddd");
      else if (period === "month") key = `Week ${Math.ceil(tm.date() / 7)}`;
      else key = tm.format("MMM");

      const bucket = map[key];
      if (!bucket) return; // tip timestamp falls outside this range

      // Convert tip → USD:
      let usdValue: number;
      if (tip.currency === "SOL") {
        usdValue = tip.amount * 100;
      } else if (tip.currency === "USDC" || tip.currency === "USDT") {
        usdValue = tip.amount;
      } else {
        usdValue = tip.amount * 100; // any other SPL tip → Others
      }

      if (tip.currency === "SOL") {
        bucket.SOL += usdValue;
      } else if (tip.currency === "USDC") {
        bucket.USDC += usdValue;
      } else if (tip.currency === "USDT") {
        bucket.USDT += usdValue;
      } else {
        bucket.Others += usdValue;
      }
    });

    // 3.3 Build final historical rows
    const historicalRows = buckets.map((name) => {
      const row = {
        name,
        SOL: map[name].SOL,
        USDC: map[name].USDC,
        USDT: map[name].USDT,
        Others: map[name].Others,
        total:
          map[name].SOL + map[name].USDC + map[name].USDT + map[name].Others,
      };
      return row;
    });

    // 3.4 Append one more row for “Now” (current on‐chain balances)
    //     We label it e.g. “Now” or “Current” so it appears as the last column
    const nowLabel = "Now";
    const solUSD =
      solBalance != null && prices.sol != null ? solBalance * prices.sol : 0;
    const usdtUSD = splTokens
      // find the SPL‐token entry whose mint === USDT_MINT
      .filter(({ mint }) => mint === USDT_MINT)
      .reduce((sum, { amount }) => sum + amount * (prices.usdt ?? 1), 0);
    const usdcUSD = splTokens
      .filter(({ mint }) => mint === USDC_MINT)
      .reduce((sum, { amount }) => sum + amount * (prices.usdc ?? 1), 0);
    // othersUSD was computed above as onChainOthersUSD

    const nowRow = {
      name: nowLabel,
      SOL: solUSD,
      USDC: usdcUSD,
      USDT: usdtUSD,
      Others: onChainOthersUSD,
      total: solUSD + usdcUSD + usdtUSD + onChainOthersUSD,
    };

    return [...historicalRows, nowRow];
  }, [
    tips,
    period,
    solBalance,
    splTokens,
    prices,
    balLoading,
    priceLoading,
    balError,
    priceError,
    onChainOthersUSD,
  ]);

  // ─── Step 4: seriesConfig + render ────────────────────────────────────────
  const seriesConfig = {
    SOL: { label: "SOL", color: TOKEN_COLORS.SOL },
    USDC: { label: "USDC", color: TOKEN_COLORS.USDC },
    USDT: { label: "USDT", color: TOKEN_COLORS.USDT },
    Others: { label: "Others", color: TOKEN_COLORS.Others },
    total: { label: "Total", color: TOKEN_COLORS.Total },
  };

  return (
    <ChartContainer config={seriesConfig} className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(v) => `$${v.toFixed(0)}`} width={65} />
          <Tooltip
            content={(props: any) =>
              props.active && props.payload?.length ? (
                <ChartTooltipContent
                  payload={props.payload}
                  label={props.label}
                  active
                />
              ) : null
            }
          />
          <Legend />

          {/* SOL, USDC, USDT, Others bars */}
          <Bar dataKey="SOL" fill={TOKEN_COLORS.SOL} name="SOL" />
          <Bar dataKey="USDC" fill={TOKEN_COLORS.USDC} name="USDC" />
          <Bar dataKey="USDT" fill={TOKEN_COLORS.USDT} name="USDT" />
          <Bar dataKey="Others" fill={TOKEN_COLORS.Others} name="Others" />

          {/* A “Total” line on top */}
          <Line
            type="monotone"
            dataKey="total"
            stroke={seriesConfig.total.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            name={seriesConfig.total.label}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
