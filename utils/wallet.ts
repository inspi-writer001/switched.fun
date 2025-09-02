import { connection, supportedTokens } from "@/config/wallet";
import { getProgram } from "./program";
import { SolanaWallet } from "@civic/auth-web3";
import { Wallet } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  getAccount,
  getAssociatedTokenAddress,
  getMint,
} from "@solana/spl-token";
import { toast } from "sonner";

export const fetchStreamerAta = async (
  hostWalletAddress: string | undefined,
  senderWalletAddress: SolanaWallet | undefined
) => {
  if (!hostWalletAddress) return;

  if (!senderWalletAddress) return;

  try {
    const program = getProgram(
      connection,
      senderWalletAddress as unknown as Wallet
    );

    const tokenMint = new PublicKey(supportedTokens.contractAddress);

    // Calculate the streamer PDA (platform wallet)
    const [streamerStatePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("user"), new PublicKey(hostWalletAddress).toBuffer()],
      program.programId
    );

    // Calculate the streamer's ATA for receiving tips
    const streamerAta = await getAssociatedTokenAddress(
      tokenMint,
      streamerStatePDA,
      true // allowOwnerOffCurve = true for PDA
    );

    // setStreamerAtaAddress(streamerAta.toString());
    return streamerAta.toString();
    // console.log("Streamer platform wallet ATA:", streamerAta.toString());
  } catch (error) {
    toast.error("Failed to calculate streamer ATA");
    return null;
  }
};

export const fetchCurrentUserAta = async (address: SolanaWallet | undefined) => {
  if (!address) return;

  try {
    const program = getProgram(connection, address as unknown as Wallet);

    const tokenMint = new PublicKey(supportedTokens.contractAddress);

    // Calculate the streamer PDA (platform wallet)
    const [streamerStatePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("user"), new PublicKey(address?.publicKey ?? "").toBuffer()],
      program.programId
    );

    // Calculate the streamer's ATA for receiving tips
    const streamerAta = await getAssociatedTokenAddress(
      tokenMint,
      streamerStatePDA,
      true // allowOwnerOffCurve = true for PDA
    );

    return {
      streamerAta: streamerAta.toString(),
      streamerStatePDA: streamerStatePDA.toString(),
    };
  } catch (error) {
    toast.error("Failed to fetch current user ATA");
    return null;
  }
};

export const fetchBalance = async (address: string) => {
  try {
    const tokenInfo = supportedTokens;
    if (!tokenInfo) return;

    const tokenMint = new PublicKey(tokenInfo.contractAddress);

    try {
      const account = await getAccount(connection, new PublicKey(address));
      const mintInfo = await getMint(connection, tokenMint);
      const balance = Number(account.amount) / Math.pow(10, mintInfo.decimals);
      // setBalance(balance);
      return balance;
    } catch (error) {
      return 0;
    }
  } catch (error) {
    toast.error("Failed to fetch balance");
    return 0;
  }
};
