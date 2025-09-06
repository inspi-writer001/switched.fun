// hooks/useRecentTips.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PublicKey, Connection } from "@solana/web3.js";
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

// Process a single transaction to extract tip information
async function processTransaction(
  connection: Connection,
  signature: string,
  address: string
): Promise<RecentTip | null> {
  try {
    const tx = await connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!tx || !tx.meta) return null;

    const blockTime = tx.blockTime ?? 0;
    const keys = tx.transaction.message.accountKeys.map((k) =>
      typeof k === "string" ? k : k.pubkey.toBase58()
    );
    const myIndex = keys.findIndex((k) => k === address);
    if (myIndex === -1) return null;

    // Sender is the other account in the transaction
    const sender = keys.find((k) => k !== address) || "";

    // Extract memo if present
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

    // Check for SOL transfer
    let amount = 0;
    let currency = "SOL";
    const pre = tx.meta.preBalances || [];
    const post = tx.meta.postBalances || [];

    if (pre.length && post.length) {
      const diff = post[myIndex] - pre[myIndex];
      if (diff > 0) amount = diff / 1e9;
    }

    // Check for SPL token transfer if no SOL transfer found
    if (amount === 0 && tx.meta.postTokenBalances) {
      const preTB = tx.meta.preTokenBalances || [];
      const postTB = tx.meta.postTokenBalances;
      for (const p of postTB) {
        if (p.accountIndex === myIndex) {
          const before =
            preTB.find((x) => x.accountIndex === myIndex && x.mint === p.mint)
              ?.uiTokenAmount.uiAmount || 0;
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
      return {
        id: signature,
        amount,
        currency,
        sender,
        timeAgo: dayjs.unix(blockTime).fromNow(),
        message,
        timestamp: blockTime,
      };
    }
  } catch (error) {
    console.error("Error processing transaction:", error);
  }
  return null;
}

export function useRecentTips(limit = 5) {
  const { connection, address } = useTokenBalances();
  const [tips, setTips] = useState<RecentTip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subscriptionId = useRef<number | null>(null);
  const isMounted = useRef(true);

  // Function to fetch initial tips
  const fetchInitialTips = useCallback(async () => {
    if (!address || !isMounted.current) return;

    try {
      setLoading(true);
      setError(null);

      const pk = new PublicKey(address);
      const sigInfos = await connection.getSignaturesForAddress(pk, { limit });

      const initialTips: RecentTip[] = [];
      for (const sigInfo of sigInfos) {
        if (!isMounted.current) break;
        const tip = await processTransaction(
          connection,
          sigInfo.signature,
          address
        );
        if (tip) {
          initialTips.push(tip);
          if (initialTips.length >= limit) break;
        }
      }

      if (isMounted.current) {
        setTips(initialTips);
      }
    } catch (e) {
      console.error("Failed to load recent tips:", e);
      if (isMounted.current) {
        setError("Unable to load recent tips");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [address, connection, limit]);

  // Setup WebSocket subscription for new tips
  const setupSubscription = useCallback(() => {
    if (!address || !isMounted.current) return;

    const pk = new PublicKey(address);

    // Unsubscribe from any existing subscription
    if (subscriptionId.current !== null) {
      connection.removeAccountChangeListener(subscriptionId.current);
      subscriptionId.current = null;
    }

    try {
      // Subscribe to account changes
      subscriptionId.current = connection.onAccountChange(
        pk,
        async (accountInfo, context) => {
          if (!isMounted.current) return;

          // Get the most recent signature for this account
          const [signature] = await connection.getSignaturesForAddress(pk, {
            limit: 1,
          });
          if (!signature) return;

          // Check if we already have this tip
          setTips((currentTips) => {
            if (currentTips.some((tip) => tip.id === signature.signature)) {
              return currentTips; // Already have this tip
            }
            return currentTips; // Will be updated by the processing below
          });

          // Process the new transaction
          const tip = await processTransaction(
            connection,
            signature.signature,
            address
          );
          if (tip && isMounted.current) {
            setTips((currentTips) => {
              // Check again in case another update happened while we were processing
              if (currentTips.some((t) => t.id === tip.id)) {
                return currentTips;
              }
              return [tip, ...currentTips].slice(0, limit);
            });
          }
        },
        "confirmed" // Only process confirmed transactions
      );
    } catch (e) {
      console.error("Failed to subscribe to account changes:", e);
    }
  }, [address, connection, limit]);

  // Initial data fetch and subscription setup
  useEffect(() => {
    isMounted.current = true;

    const init = async () => {
      await fetchInitialTips();
      setupSubscription();
    };

    init();

    // Cleanup function
    return () => {
      isMounted.current = false;
      if (subscriptionId.current !== null) {
        connection.removeAccountChangeListener(subscriptionId.current);
      }
    };
  }, [fetchInitialTips, setupSubscription]);

  // Refresh subscription if connection changes
  useEffect(() => {
    if (!isMounted.current) return;
    setupSubscription();

    return () => {
      if (subscriptionId.current !== null) {
        connection.removeAccountChangeListener(subscriptionId.current);
        subscriptionId.current = null;
      }
    };
  }, [connection, setupSubscription]);

  return { tips, loading, error };
}
