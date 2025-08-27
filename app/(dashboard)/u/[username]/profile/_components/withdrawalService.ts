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
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import { BN } from "bn.js";
import { getProgram } from "@/utils/program";
import { userHasWallet } from "@civic/auth-web3";
import idl from "@/switched_fun_program/target/idl/switched_fun.json";

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
  program?: any; // Anchor program instance (for platform withdrawals)
  civicWallet?: any; // Civic wallet for normal withdrawals
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
    return usdValue / usdcPrice;
  }

  /**
   * Handles platform wallet withdrawal using program.methods.withdraw
   */
  static async withdrawFromPlatformWallet(params: WithdrawalParams, solPrice: number): Promise<string> {
    const { amount, destinationAddress, userAddress, connection, program } = params;
    
    if (!program) {
      throw new Error("Program instance required for platform withdrawal");
    }
    
    try {
      const userPubkey = new PublicKey(userAddress);
      
      // Calculate streamer state PDA (user state)
      const [streamerState] = PublicKey.findProgramAddressSync(
        [Buffer.from("user"), userPubkey.toBuffer()],
        program.programId
      );

      // Calculate global state PDA
      const [globalState] = PublicKey.findProgramAddressSync(
        [Buffer.from("global_state")],
        program.programId
      );

      // Calculate treasury account PDA  
      const [treasuryAccount] = PublicKey.findProgramAddressSync(
        [globalState.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), USDC_MINT.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      // Calculate streamer ATA (platform wallet USDC account)
      const [streamerAta] = PublicKey.findProgramAddressSync(
        [streamerState.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), USDC_MINT.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      // Get destination ATA
      const destinationPubkey = new PublicKey(destinationAddress);
      const destinationATA = await getAssociatedTokenAddress(
        USDC_MINT,
        destinationPubkey
      );

      // Estimate gas fee and convert to USDC
      const gasInSol = 0.001; // Conservative estimate for withdraw instruction
      const gasInUsdc = this.convertSolToUsdc(gasInSol, solPrice);
      const gasInUsdcBaseUnits = new BN(Math.ceil(gasInUsdc * Math.pow(10, USDC_DECIMALS)));
      
      console.log("Platform withdrawal details:", {
        amount,
        gasInSol,
        gasInUsdc,
        gasInUsdcBaseUnits: gasInUsdcBaseUnits.toString(),
        streamerState: streamerState.toString(),
        streamerAta: streamerAta.toString(),
        destinationATA: destinationATA.toString(),
      });

      // Execute withdrawal using Anchor program - same pattern as tipping
      const tx = await program.methods
        .withdraw({
          amount: new BN(Math.floor(amount * Math.pow(10, USDC_DECIMALS))),
          gasInUsdc: gasInUsdcBaseUnits,
        })
        .accounts({
          signer: userPubkey,
          receivingAta: destinationATA,
          streamerAta: streamerAta,
          tokenMint: USDC_MINT,
          globalState: globalState,
          treasuryAccount: treasuryAccount,
          streamerState: streamerState,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Platform withdrawal successful:", tx);
      return tx;
      
    } catch (error) {
      console.error("Platform withdrawal error:", error);
      throw error;
    }
  }

  /**
   * Handles normal wallet withdrawal using direct SPL transfer
   */
  static async withdrawFromNormalWallet(params: WithdrawalParams): Promise<string> {
    const { amount, destinationAddress, userAddress, connection, civicWallet } = params;
    
    if (!civicWallet || !civicWallet.signTransaction) {
      throw new Error("Civic wallet with signing capability required for normal wallet withdrawal");
    }
    
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

      // Create transaction with transfer instruction
      const transaction = new Transaction();
      
      // Check if destination ATA exists, if not add create instruction
      try {
        await connection.getAccountInfo(destinationATA);
      } catch {
        // ATA doesn't exist, need to create it
        console.log("Adding create ATA instruction for destination");
        transaction.add(
          createAssociatedTokenAccountInstruction(
            userPubkey, // payer
            destinationATA,
            destinationPubkey, // owner
            USDC_MINT,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }

      // Add transfer instruction
      transaction.add(
        createTransferInstruction(
          sourceATA,
          destinationATA,
          userPubkey,
          amountInBaseUnits,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPubkey;

      console.log("Transaction before signing:", {
        feePayer: transaction.feePayer?.toString(),
        instructions: transaction.instructions.length,
        blockhash,
      });

      // Sign transaction using Civic wallet
      const signedTransaction = await civicWallet.signTransaction(transaction);
      
      console.log("Transaction signed successfully");

      // Send and confirm transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }

      console.log("Normal wallet withdrawal successful:", signature);
      return signature;
      
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