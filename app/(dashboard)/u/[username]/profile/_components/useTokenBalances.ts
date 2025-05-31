// hooks/useTokenBalances.ts
"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@civic/auth-web3/react";
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { userHasWallet } from "@civic/auth-web3";

export interface TokenInfo {
  mint: string;
  amount: number;
}

export function useTokenBalances() {
  const userContext = useUser();
  const hasWallet = userHasWallet(userContext);
  const address = hasWallet ? userContext.solana.address : "";

  const network =
    process.env.NEXT_PUBLIC_USE_MAINNET === "true" ? "mainnet-beta" : "devnet";
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const connection = useMemo(() => new Connection(endpoint), [endpoint]);

  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [splTokens, setSplTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasWallet || !address) {
      setSolBalance(null);
      setSplTokens([]);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const pubkey = new PublicKey(address);
        const lamports = await connection.getBalance(pubkey);
        if (!cancelled) setSolBalance(lamports / LAMPORTS_PER_SOL);

        const resp = await connection.getParsedTokenAccountsByOwner(pubkey, {
          programId: TOKEN_PROGRAM_ID,
        });
        if (!cancelled) {
          const tokens = resp.value
            .map(({ account }) => {
              // @ts-ignore: parsed info shape
              const info = account.data.parsed.info;
              return {
                mint: info.mint as string,
                amount: info.tokenAmount.uiAmount as number,
              };
            })
            .filter((t) => t.amount > 0);
          setSplTokens(tokens);
        }
      } catch (err: any) {
        console.error("Error loading balances", err);
        if (!cancelled) setError(err.message ?? "Failed to load balances");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address, hasWallet, connection]);

  // <-- expose connection & address here -->
  return { connection, address, solBalance, splTokens, loading, error };
}
