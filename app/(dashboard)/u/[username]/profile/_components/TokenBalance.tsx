"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, ArrowDownCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import WithdrawModal from "./WithdrawModal";
import { userHasWallet } from "@civic/auth-web3";
import { useUser } from "@civic/auth-web3/react";
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

interface TokenInfo {
  mint: string;
  amount: number;
}

export default function TokenBalance() {
  // ——————————————
  // 1️⃣ Civic Auth wallet
  // ——————————————
  const userContext = useUser();
  const hasWallet = userHasWallet(userContext);
  const address = hasWallet ? userContext.solana.address : "";

  // ——————————————
  // 2️⃣ Dynamic network selection
  //    default to devnet, set NEXT_PUBLIC_USE_MAINNET=true for mainnet‑beta
  // ——————————————
  const network =
    process.env.NEXT_PUBLIC_USE_MAINNET === "true" ? "mainnet-beta" : "devnet";
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // ——————————————
  // 3️⃣ Memoized Connection
  // ——————————————
  const connection = useMemo(() => new Connection(endpoint), [endpoint]);

  // ——————————————
  // 4️⃣ Local state
  // ——————————————
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [splTokens, setSplTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // —————————————————————————
  // 5️⃣ Fetch balances when address changes
  // —————————————————————————
  useEffect(() => {
    if (!hasWallet || !address) {
      setSolBalance(null);
      setSplTokens([]);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const pubkey = new PublicKey(address);

        // SOL balance
        const lamports = await connection.getBalance(pubkey);
        if (!cancelled) {
          setSolBalance(lamports / LAMPORTS_PER_SOL);
        }

        // SPL tokens
        const resp = await connection.getParsedTokenAccountsByOwner(pubkey, {
          programId: TOKEN_PROGRAM_ID,
        });
        if (!cancelled) {
          const tokens = resp.value
            .map(({ account }) => {
              // @ts-ignore
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
        // handle 403 or other RPC errors
        console.error("Error loading balances", err);
        if (!cancelled) {
          setError(err?.message ?? "Failed to load balances");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [address, hasWallet, connection]);

  // ——————————————
  // 6️⃣ Render
  // ——————————————
  return (
    <Card className="overflow-hidden">
      <div className="bg-transparent py-2 px-4 w-full border-b">
        <span className="text-white text-sm font-medium mt-2  w-full">
          Wallet Balance ({network})
        </span>
      </div>
      <CardContent className="p-4">
        {!hasWallet ? (
          <p className="text-sm text-muted-foreground">
            Please connect your wallet to view balances.
          </p>
        ) : loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {solBalance !== null
                      ? `${solBalance.toFixed(4)} SOL`
                      : "--"}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {1 + splTokens.length} token account
                    {splTokens.length !== 0 && "s"}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => setShowWithdrawModal(true)}
              >
                <ArrowDownCircle className="h-4 w-4" />
                <span>Withdraw</span>
              </Button>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              {solBalance !== null && (
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-yellow-500" />
                    SOL
                  </span>
                  <span className="font-medium">{solBalance.toFixed(4)}</span>
                </div>
              )}
              {splTokens.map((t) => (
                <div key={t.mint} className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-gray-500" />
                    {t.mint.slice(0, 4)}…
                    {/* replace with symbol lookup if desired */}
                  </span>
                  <span className="font-medium">{t.amount}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
      
      <WithdrawModal 
        open={showWithdrawModal} 
        setOpen={setShowWithdrawModal} 
      />
    </Card>
  );
}
