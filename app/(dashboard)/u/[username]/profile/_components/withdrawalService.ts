import {
  Connection,
  PublicKey,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import { BN } from "bn.js";

// Constants
const USDC_MINT = new PublicKey("2o39Cm7hzaXmm9zGGGsa5ZiveJ93oMC2D6U7wfsREcCo");
const PROGRAM_ID = new PublicKey("swinS25mqCw6ExEAtLJFxp6HYcqMvoYxKz3by6FfbRD");
const USDC_DECIMALS = 6;

export interface WithdrawalParams {
  amount: number; // USDC amount in UI units
  destinationAddress: string;
  walletType: 'platform' | 'normal';
  userAddress: string;
  connection: Connection;
}

export class WithdrawalService {
  /**
   * Estimates gas fee in SOL for a transaction
   */
  static async estimateGasFee(
    connection: Connection,
    transaction: Transaction
  ): Promise<number> {
    try {
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      
      const feeEstimate = await connection.getFeeForMessage(
        transaction.compileMessage()
      );
      
      return (feeEstimate.value || 0) / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error("Error estimating gas fee:", error);
      return 0.001; // Fallback estimate
    }
  }

  /**
   * Converts SOL amount to USDC amount
   */
  static convertSolToUsdc(solAmount: number, solPrice: number, usdcPrice: number = 1): number {
    const usdValue = solAmount * solPrice;
    return usdValue / usdPrice;
  }

  /**
   * Handles platform wallet withdrawal using program.methods.withdraw
   */
  static async withdrawFromPlatformWallet(params: WithdrawalParams, solPrice: number): Promise<string> {
    const { amount, destinationAddress, userAddress, connection } = params;
    
    try {
      // Calculate user PDA
      const [userPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("user"), new PublicKey(userAddress).toBuffer()],
        PROGRAM_ID
      );

      // Get destination ATA
      const destinationPubkey = new PublicKey(destinationAddress);
      const destinationATA = await getAssociatedTokenAddress(
        USDC_MINT,
        destinationPubkey
      );

      // Create a mock transaction for fee estimation
      const mockTransaction = new Transaction();
      // Add a simple instruction for estimation (this is rough)
      mockTransaction.add(
        createTransferInstruction(
          await getAssociatedTokenAddress(USDC_MINT, userPDA, true),
          destinationATA,
          userPDA,
          Math.floor(amount * Math.pow(10, USDC_DECIMALS)),
          [],
          TOKEN_PROGRAM_ID
        )
      );

      // Estimate gas fee
      const gasInSol = await this.estimateGasFee(connection, mockTransaction);
      const gasInUsdc = this.convertSolToUsdc(gasInSol, solPrice);
      const gasInUsdcBaseUnits = new BN(Math.ceil(gasInUsdc * Math.pow(10, USDC_DECIMALS)));
      
      console.log("Platform withdrawal details:", {
        amount,
        gasInSol,
        gasInUsdc,
        gasInUsdcBaseUnits: gasInUsdcBaseUnits.toString(),
      });

      // TODO: Implement actual program.methods.withdraw call
      // This would require:
      // 1. Loading the actual IDL
      // 2. Creating proper Anchor provider with signing capability
      // 3. Calling program.methods.withdraw with proper accounts
      
      /*
      const tx = await program.methods
        .withdraw({
          amount: new BN(Math.floor(amount * Math.pow(10, USDC_DECIMALS))),
          gasInUsdc: gasInUsdcBaseUnits,
        })
        .signers([userKeypair])
        .accounts({
          signer: userPubkey,
          receivingAta: destinationATA,
          tokenMint: USDC_MINT,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
      */

      // For now, return a mock transaction signature
      throw new Error("Platform wallet withdrawal requires full Anchor integration - not yet implemented");
      
    } catch (error) {
      console.error("Platform withdrawal error:", error);
      throw error;
    }
  }

  /**
   * Handles normal wallet withdrawal using direct SPL transfer
   */
  static async withdrawFromNormalWallet(params: WithdrawalParams): Promise<string> {
    const { amount, destinationAddress, userAddress, connection } = params;
    
    try {
      const userPubkey = new PublicKey(userAddress);
      const destinationPubkey = new PublicKey(destinationAddress);
      
      // Get source and destination ATAs
      const sourceATA = await getAssociatedTokenAddress(USDC_MINT, userPubkey);
      const destinationATA = await getAssociatedTokenAddress(USDC_MINT, destinationPubkey);
      
      // Convert amount to base units
      const amountInBaseUnits = Math.floor(amount * Math.pow(10, USDC_DECIMALS));
      
      console.log("Normal wallet withdrawal details:", {
        amount,
        amountInBaseUnits,
        sourceATA: sourceATA.toString(),
        destinationATA: destinationATA.toString(),
      });

      // TODO: Implement actual SPL transfer
      // This would require:
      // 1. Creating the transfer instruction
      // 2. Creating and signing the transaction
      // 3. Sending the transaction
      
      /*
      const transaction = new Transaction().add(
        createTransferInstruction(
          sourceATA,
          destinationATA,
          userPubkey,
          amountInBaseUnits,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      // Sign and send transaction (requires wallet integration)
      const signature = await connection.sendTransaction(transaction, [userKeypair]);
      await connection.confirmTransaction(signature);
      */
      
      // For now, return a mock transaction signature
      throw new Error("Normal wallet withdrawal requires wallet signing integration - not yet implemented");
      
    } catch (error) {
      console.error("Normal wallet withdrawal error:", error);
      throw error;
    }
  }

  /**
   * Main withdrawal method that routes to appropriate handler
   */
  static async withdraw(params: WithdrawalParams, solPrice: number): Promise<string> {
    if (params.walletType === 'platform') {
      return this.withdrawFromPlatformWallet(params, solPrice);
    } else {
      return this.withdrawFromNormalWallet(params);
    }
  }
}