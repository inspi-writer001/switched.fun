import { PublicKey, Transaction } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import { BN } from "bn.js";
import {
  getConnection,
  getServerWallet,
  signAndSendTransaction,
} from "./server-wallet";

const USDC_MINT = new PublicKey("2o39Cm7hzaXmm9zGGGsa5ZiveJ93oMC2D6U7wfsREcCo");
const USDC_DECIMALS = 6;

// Generate a withdrawal transaction for user to sign
export const generateWithdrawalTransaction = async (
  userPublicKey: PublicKey,
  destinationAddress: PublicKey,
  amount: number,
  gasInUsdc: number,
  program: any // Anchor program instance
): Promise<{
  serializedTransaction: string;
  message: string;
}> => {
  try {
    // Get server wallet first
    const serverWallet = getServerWallet();

    // Convert amounts to base units
    const amountInBaseUnits = new BN(
      Math.floor(amount * Math.pow(10, USDC_DECIMALS))
    );
    const gasInUsdcBaseUnits = new BN(
      Math.ceil(gasInUsdc * Math.pow(10, USDC_DECIMALS))
    );

    // Get the proper ATA for the destination address
    const connection = getConnection();
    const destinationAtaAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      serverWallet,
      USDC_MINT,
      destinationAddress
    );
    const destinationAta = destinationAtaAccount.address;

    console.log("Withdrawal transaction details:", {
      userPublicKey: userPublicKey.toString(),
      destinationAddress: destinationAddress.toString(),
      destinationAta: destinationAta.toString(),
      amount,
      gasInUsdc,
      amountInBaseUnits: amountInBaseUnits.toString(),
      gasInUsdcBaseUnits: gasInUsdcBaseUnits.toString(),
    });

    // Create the withdraw transaction with explicit account resolution
    const withdrawBuilder = program.methods
      .withdraw({
        amount: amountInBaseUnits,
        gasInUsdc: gasInUsdcBaseUnits,
      })
      .accounts({
        signer: userPublicKey,
        receivingAta: destinationAta,
        tokenMint: USDC_MINT,
        tokenProgram: TOKEN_PROGRAM_ID,
      });
    
    console.log("About to call .transaction() on withdraw method...");
    
    let tx;
    try {
      tx = await withdrawBuilder.transaction();
      console.log("Successfully created withdraw transaction");
    } catch (error) {
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        logs: error.logs
      });
      throw error;
    }

    // Set fee payer to server wallet (platform pays gas)
    console.log("Server wallet public key:", serverWallet.publicKey.toString());
    console.log("User public key:", userPublicKey.toString());
    tx.feePayer = serverWallet.publicKey;

    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;

    // Server wallet signs first (as fee payer)
    tx.partialSign(serverWallet);

    // Serialize the transaction for user to sign (server signature already included)
    const serializedTransaction = tx
      .serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      })
      .toString("base64");

    return {
      serializedTransaction,
      message:
        "Withdrawal transaction created. User must sign and return for broadcasting.",
    };
  } catch (error) {
    console.error("Failed to generate withdrawal transaction:", error);
    throw error;
  }
};

// Broadcast user-signed withdrawal transaction
export const broadcastWithdrawalTransaction = async (
  userSignedTransaction: string
): Promise<string> => {
  try {
    // Deserialize the user-signed transaction (already has server signature)
    const transactionBuffer = Buffer.from(userSignedTransaction, "base64");
    const transaction = Transaction.from(transactionBuffer);

    console.log("Final withdrawal transaction ready for broadcast:");
    console.log("- Fee payer:", transaction.feePayer?.toString());
    console.log(
      "- Signatures:",
      transaction.signatures.map((sig) => ({
        publicKey: sig.publicKey?.toString(),
        signature: sig.signature ? "present" : "missing",
      }))
    );

    // Verify transaction signatures before sending
    try {
      const isValid = transaction.verifySignatures();
      console.log("Transaction signature verification:", isValid);
    } catch (verifyError) {
      console.log("Signature verification error:", verifyError.message);
    }

    // Transaction should already be fully signed, just broadcast it
    const signature = await signAndSendTransaction(transaction);

    console.log(`Withdrawal transaction broadcasted: ${signature}`);
    return signature;
  } catch (error) {
    console.error("Failed to broadcast withdrawal transaction:", error);
    throw error;
  }
};

// Create withdrawal transaction for user to sign
export const createWithdrawalTransaction = async (
  userId: string,
  userPublicKey: string,
  amount: number,
  destinationAddress: string,
  gasInUsdc: number,
  program: any
): Promise<{
  serializedTransaction: string;
  message: string;
}> => {
  try {
    // Convert string addresses to PublicKey objects
    const userPubKey = new PublicKey(userPublicKey);
    const destinationPubKey = new PublicKey(destinationAddress);

    console.log("Creating withdrawal transaction:", {
      userId,
      userPublicKey,
      amount,
      destinationAddress,
      gasInUsdc,
    });

    // Generate the transaction for user to sign
    const result = await generateWithdrawalTransaction(
      userPubKey,
      destinationPubKey,
      amount,
      gasInUsdc,
      program
    );

    return result;
  } catch (error) {
    console.error("Failed to create withdrawal transaction:", error);
    throw error;
  }
};

// Complete withdrawal after user signs
export const completeWithdrawal = async (
  userId: string,
  userPublicKey: string,
  userSignedTransaction: string
): Promise<{
  signature: string;
}> => {
  try {
    console.log("Completing withdrawal for user:", userId);

    // Broadcast the user-signed transaction
    const signature = await broadcastWithdrawalTransaction(
      userSignedTransaction
    );

    console.log(`Withdrawal completed for user ${userId}: ${signature}`);

    return {
      signature,
    };
  } catch (error) {
    console.error("Failed to complete withdrawal:", error);
    throw error;
  }
};
