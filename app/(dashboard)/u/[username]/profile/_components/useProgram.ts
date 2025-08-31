"use client";

import { useMemo } from "react";
import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { userHasWallet } from "@civic/auth-web3";
import { useUser } from "@civic/auth-web3/react";

// Program ID
const PROGRAM_ID = new PublicKey("swinS25mqCw6ExEAtLJFxp6HYcqMvoYxKz3by6FfbRD");

// IDL type - you'd typically import this from the generated types
// For now, using minimal type definition
export interface SwitchedFunProgram {
  methods: {
    withdraw: (params: { amount: anchor.BN; gasInUsdc: anchor.BN }) => any;
  };
}

export function useProgram() {
  const userContext = useUser();
  const hasWallet = userHasWallet(userContext);

  const network =
    process.env.NEXT_PUBLIC_USE_MAINNET === "true" ? "mainnet-beta" : "devnet";

  const connection = useMemo(
    () => new Connection(clusterApiUrl(network)),
    [network]
  );

  const program = useMemo(() => {
    if (!hasWallet) return null;

    try {
      // Create a wallet adapter for Anchor
      const wallet = {
        publicKey: new PublicKey(userContext.solana.address),
        signTransaction: async (transaction: any) => {
          // This would need to integrate with Civic's signing mechanism
          // For now, this is a placeholder
          throw new Error("Signing not implemented yet");
        },
        signAllTransactions: async (transactions: any[]) => {
          throw new Error("Bulk signing not implemented yet");
        },
      };

      const provider = new anchor.AnchorProvider(
        connection,
        wallet as any,
        anchor.AnchorProvider.defaultOptions()
      );

      // You'd typically load the IDL here
      // For now, returning a minimal interface
      return {
        programId: PROGRAM_ID,
        provider,
        connection,
        // This would be the actual program instance
        // program: new anchor.Program(idl, PROGRAM_ID, provider)
      };
    } catch (error) {
      console.error("Error creating program instance:", error);
      return null;
    }
  }, [hasWallet, userContext, connection]);

  return program;
}
