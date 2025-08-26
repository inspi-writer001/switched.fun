import { Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { 
  getConnection, 
  getServerWallet, 
  signAndSendTransaction,
  createTransactionTemplate 
} from './server-wallet';
import { db } from './db';

// Generate a new platform wallet for user
export const generatePlatformWallet = (): Keypair => {
  return Keypair.generate();
};

// Create streamer profile on-chain using the program
export const createStreamerProfile = async (
  userWallet: PublicKey,
  tokenMint: PublicKey,
  program: any // Anchor program instance
): Promise<string> => {
  try {
    const serverWallet = getServerWallet();
    
    // Create the transaction using the program
    const tx = await program.methods
      .createStreamer()
      .accounts({
        signer: userWallet, // User's platform wallet
        tokenMint: tokenMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .transaction();

    // Set fee payer to server wallet (we pay gas)
    tx.feePayer = serverWallet.publicKey;
    
    // Get recent blockhash
    const connection = getConnection();
    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;

    // Sign and send transaction
    const signature = await signAndSendTransaction(tx);
    
    console.log(`Streamer profile created: ${signature}`);
    return signature;
  } catch (error) {
    console.error('Failed to create streamer profile:', error);
    throw error;
  }
};

// Create platform wallet and update database
export const createUserPlatformWallet = async (userId: string): Promise<{
  platformWallet: string;
  signature?: string;
}> => {
  try {
    // Check if user already has platform wallet
    const existingUser = await db.user.findUnique({
      where: { id: userId },
      select: { 
        isSolanaPlatformWallet: true, 
        platformWallet: true,
        username: true 
      },
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    if (existingUser.isSolanaPlatformWallet && existingUser.platformWallet) {
      return {
        platformWallet: existingUser.platformWallet,
      };
    }

    // Generate new platform wallet
    const platformWallet = generatePlatformWallet();
    const platformWalletAddress = platformWallet.publicKey.toString();

    // Update database with platform wallet
    await db.user.update({
      where: { id: userId },
      data: {
        platformWallet: platformWalletAddress,
        isSolanaPlatformWallet: true,
      },
    });

    console.log(`Platform wallet created for user ${existingUser.username}: ${platformWalletAddress}`);
    
    return {
      platformWallet: platformWalletAddress,
    };
  } catch (error) {
    console.error('Failed to create platform wallet:', error);
    throw error;
  }
};

// Create streamer profile for user (combines wallet creation + on-chain profile)
export const createStreamerForUser = async (
  userId: string, 
  tokenMint: string,
  program?: any
): Promise<{
  platformWallet: string;
  signature?: string;
}> => {
  try {
    // First ensure user has platform wallet
    const { platformWallet } = await createUserPlatformWallet(userId);
    
    // If program is provided, create on-chain streamer profile
    let signature: string | undefined;
    if (program) {
      const tokenMintPubkey = new PublicKey(tokenMint);
      const userWalletPubkey = new PublicKey(platformWallet);
      
      signature = await createStreamerProfile(
        userWalletPubkey,
        tokenMintPubkey,
        program
      );
    }

    return {
      platformWallet,
      signature,
    };
  } catch (error) {
    console.error('Failed to create streamer for user:', error);
    throw error;
  }
};

// Get user's platform wallet
export const getUserPlatformWallet = async (userId: string): Promise<string | null> => {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { 
        platformWallet: true, 
        isSolanaPlatformWallet: true 
      },
    });

    if (!user || !user.isSolanaPlatformWallet) {
      return null;
    }

    return user.platformWallet;
  } catch (error) {
    console.error('Failed to get user platform wallet:', error);
    return null;
  }
};

// Check if user has platform wallet
export const userHasPlatformWallet = async (userId: string): Promise<boolean> => {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { isSolanaPlatformWallet: true },
    });

    return user?.isSolanaPlatformWallet ?? false;
  } catch (error) {
    console.error('Failed to check user platform wallet:', error);
    return false;
  }
};