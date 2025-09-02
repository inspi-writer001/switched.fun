import { useQuery } from "@tanstack/react-query";
import { fetchBalance, fetchCurrentUserAta } from "@/utils/wallet";
import { useWallet } from "@civic/auth-web3/react";

interface UseBalanceOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useBalance(
  walletAddress: string | undefined,
  options: UseBalanceOptions = {}
) {
  const {
    enabled = true,
    staleTime = 30 * 1000, // 30 seconds for balance updates
    gcTime = 2 * 60 * 1000, // 2 minutes
  } = options;

  return useQuery({
    queryKey: ["balance", walletAddress],
    queryFn: async (): Promise<number> => {
      if (!walletAddress) {
        throw new Error("Wallet address is required");
      }

      const balance = await fetchBalance(walletAddress);
      return balance || 0;
    },
    enabled: enabled && !!walletAddress,
    staleTime,
    gcTime,
    retry: (failureCount, error) => {
      // Don't retry on network errors
      if (error instanceof Error && error.message.includes("Network")) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

interface UseCurrentUserAtaOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useCurrentUserAta(
  options: UseCurrentUserAtaOptions = {}
) {

  const { wallet } = useWallet({
    type: "solana",
  });

  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes for ATA (less frequent updates)
    gcTime = 10 * 60 * 1000, // 10 minutes
  } = options;

  return useQuery({
    queryKey: ["currentUserAta", wallet?.publicKey],
    queryFn: async (): Promise<{ streamerAta: string; streamerStatePDA: string }> => {
      if (!wallet?.publicKey) {
        throw new Error("Wallet address is required");
      }

      const ata = await fetchCurrentUserAta(wallet);
      if (!ata) {
        throw new Error("Failed to fetch current user ATA");
      }
      return ata;
    },
    enabled: enabled && !!wallet?.publicKey,
    staleTime,
    gcTime,
    retry: (failureCount, error) => {
      // Don't retry on network errors
      if (error instanceof Error && error.message.includes("Network")) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
