// hooks/useRecentTips.ts
"use client";

import { useState, useEffect } from "react";
import { PublicKey, ParsedConfirmedTransaction } from "@solana/web3.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useTokenBalances } from "../useTokenBalances";

dayjs.extend(relativeTime);

// helper to pause
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// retry wrapper for 429s
async function retryOn429<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 500
): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (
      retries > 0 &&
      err?.error?.code === 429 // web3.js wraps JSON-RPC error under `error`
    ) {
      await sleep(delay);
      return retryOn429(fn, retries - 1, delay * 2);
    }
    throw err;
  }
}

export interface RecentTip {
  id: string;
  amount: number;
  currency: string;
  sender: string;
  timeAgo: string;
  message: string | null;
  timestamp: number;
}

export function useRecentTips(limit = 5) {
  const { connection, address } = useTokenBalances();
  const [tips, setTips] = useState<RecentTip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setTips([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);

      try {
        const pk = new PublicKey(address);

        // 1️⃣ Fetch signatures with retry
        const sigInfos = await retryOn429(
          () => connection.getSignaturesForAddress(pk, { limit }),
          3,
          500
        );

        // 2️⃣ Fetch parsed transactions *sequentially* with retry + delay
        const parsedTxs: (ParsedConfirmedTransaction | null)[] = [];
        for (const s of sigInfos) {
          if (cancelled) break;
          try {
            const tx = await retryOn429(
              () => connection.getParsedTransaction(s.signature),
              2,
              300
            );
            parsedTxs.push(tx);
          } catch {
            parsedTxs.push(null);
          }
          await sleep(200); // throttle
        }

        // 3️⃣ Process each tx
        const out: RecentTip[] = [];
        for (const tx of parsedTxs) {
          if (!tx || !tx.meta) continue;
          const sig = tx.transaction.signatures[0];
          const blockTime = tx.blockTime ?? 0;
          const keys = tx.transaction.message.accountKeys.map((k) =>
            typeof k === "string" ? k : k.pubkey.toBase58()
          );
          const myIndex = keys.findIndex((k) => k === address);
          if (myIndex === -1) continue;

          // sender
          const sender = keys.find((k) => k !== address) || "";

          // memo
          let message: string | null = null;
          const memoIx = tx.transaction.message.instructions.find(
            (ix: any) => ix.program === "spl-memo"
          );
          if (memoIx && typeof (memoIx as any).data === "string") {
            try {
              message = Buffer.from((memoIx as any).data, "base64").toString();
            } catch {
              message = null;
            }
          }

          // SOL delta
          const pre = tx.meta.preBalances || [];
          const post = tx.meta.postBalances || [];
          let amount = 0;
          let currency = "SOL";
          if (pre.length && post.length) {
            const diff = post[myIndex] - pre[myIndex];
            if (diff > 0) amount = diff / 1e9;
          }

          // SPL token delta if no SOL
          if (amount === 0 && tx.meta.postTokenBalances) {
            const preTB = tx.meta.preTokenBalances || [];
            const postTB = tx.meta.postTokenBalances;
            for (const p of postTB) {
              if (p.accountIndex === myIndex) {
                const before =
                  preTB.find(
                    (x) => x.accountIndex === myIndex && x.mint === p.mint
                  )?.uiTokenAmount.uiAmount || 0;
                const after = p.uiTokenAmount.uiAmount || 0;
                const delta = after - before;
                if (delta > 0) {
                  amount = delta;
                  currency = p.mint;
                  break;
                }
              }
            }
          }

          if (amount > 0) {
            out.push({
              id: sig,
              amount,
              currency,
              sender,
              timeAgo: dayjs.unix(blockTime).fromNow(),
              message,
              timestamp: blockTime,
            });
            if (out.length >= limit) break;
          }
        }

        if (!cancelled) setTips(out);
      } catch (e: any) {
        console.error("Failed to load recent tips:", e);
        if (!cancelled) {
          setError("Unable to load recent tips");
          setTips([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address, connection, limit]);

  return { tips, loading, error };
}
