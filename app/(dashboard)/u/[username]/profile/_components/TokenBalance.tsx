"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, ArrowDownCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import WithdrawModal from "./WithdrawModal";
import { userHasWallet } from "@civic/auth-web3";
import { useUser } from "@civic/auth-web3/react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBalance } from "@/utils/string";
// import {
//   Connection,
//   PublicKey,
//   clusterApiUrl,
//   LAMPORTS_PER_SOL,
// } from "@solana/web3.js";
// import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useBalance, useCurrentUserAta } from "@/hooks/use-balance";

export default function TokenBalance() {
  const { data: currentUserAta, isLoading: isLoadingAta } = useCurrentUserAta();

  const { data: balance = 0, isLoading: isLoadingBalance } = useBalance(
    currentUserAta?.streamerAta
  );

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
  // const network =
  //   process.env.NEXT_PUBLIC_USE_MAINNET === "true" ? "mainnet-beta" : "devnet";
  // const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // ——————————————
  // 3️⃣ Memoized Connection
  // ——————————————
  // const connection = useMemo(() => new Connection(endpoint), [endpoint]);

  // ——————————————
  // 4️⃣ Local state
  // ——————————————

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // —————————————————————————
  // 5️⃣ Fetch balances when address changes
  // —————————————————————————

  // ——————————————
  // 6️⃣ Render
  // ——————————————
  return (
    <Card className="overflow-hidden bg-background">
      <div className="bg-transparent py-2 px-4 w-full border-b">
        <span className="text-red text-sm font-medium mt-2  w-full">
          Wallet Balance
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
                  {isLoadingBalance ? (
                    <Skeleton className=" w-10 h-10" />
                  ) : (
                    <h3 className="text-3xl font-bold text-white font-sans py-2">
                      ${formatBalance(balance)}
                    </h3>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="flex hover:bg-red-500 items-center gap-1"
                onClick={() => setShowWithdrawModal(true)}
              >
                <ArrowDownCircle className="h-4 w-4" />
                <span>Withdraw</span>
              </Button>
            </div>
          </>
        )}
      </CardContent>

      <WithdrawModal open={showWithdrawModal} setOpen={setShowWithdrawModal} />
    </Card>
  );
}
