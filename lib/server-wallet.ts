import { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction, 
  sendAndConfirmTransaction,
  VersionedTransaction,
  TransactionSignature,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import bs58 from 'bs58';

// Global wallet instance
let serverWallet: Keypair | null = null;
let connection: Connection | null = null;

// Initialize the server wallet
export const initializeServerWallet = (): Keypair => {
  if (serverWallet) {
    return serverWallet;
  }

  const privateKeyString = process.env.SERVER_WALLET_PRIVATE_KEY;
  if (!privateKeyString) {
    throw new Error('SERVER_WALLET_PRIVATE_KEY environment variable is required');
  }

  try {
    // Support both base58 and JSON array formats
    let privateKeyBytes: Uint8Array;
    
    if (privateKeyString.startsWith('[') && privateKeyString.endsWith(']')) {
      // JSON array format [1,2,3...]
      const keyArray = JSON.parse(privateKeyString);
      privateKeyBytes = new Uint8Array(keyArray);
    } else {
      // Base58 format
      privateKeyBytes = bs58.decode(privateKeyString);
    }

    serverWallet = Keypair.fromSecretKey(privateKeyBytes);
    console.log(`Server wallet initialized: ${serverWallet.publicKey.toString()}`);
    return serverWallet;
  } catch (error) {
    throw new Error(`Failed to initialize server wallet: ${error}`);
  }
};

// Get connection instance
export const getConnection = (): Connection => {
  if (!connection) {
    const rpcEndpoint = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    connection = new Connection(rpcEndpoint, 'confirmed');
  }
  return connection;
};

// Get server wallet instance
export const getServerWallet = (): Keypair => {
  if (!serverWallet) {
    return initializeServerWallet();
  }
  return serverWallet;
};

// Get wallet public key
export const getServerWalletPublicKey = (): PublicKey => {
  const wallet = getServerWallet();
  return wallet.publicKey;
};

// Get wallet balance
export const getServerWalletBalance = async (): Promise<number> => {
  const wallet = getServerWallet();
  const conn = getConnection();
  const balance = await conn.getBalance(wallet.publicKey);
  return balance / LAMPORTS_PER_SOL;
};

// Sign and broadcast a transaction
export const signAndSendTransaction = async (
  transaction: Transaction | VersionedTransaction
): Promise<TransactionSignature> => {
  try {
    const wallet = getServerWallet();
    const conn = getConnection();

    // For regular transactions
    if (transaction instanceof Transaction) {
      transaction.feePayer = wallet.publicKey;
      
      // Get recent blockhash if not set
      if (!transaction.recentBlockhash) {
        const { blockhash } = await conn.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
      }

      // Sign and send
      const signature = await sendAndConfirmTransaction(
        conn,
        transaction,
        [wallet],
        {
          commitment: 'confirmed',
          skipPreflight: false,
        }
      );

      console.log(`Transaction sent: ${signature}`);
      return signature;
    }

    // For versioned transactions
    if (transaction instanceof VersionedTransaction) {
      // Sign the transaction
      transaction.sign([wallet]);

      // Send the transaction
      const signature = await conn.sendTransaction(transaction, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      // Confirm the transaction
      const confirmation = await conn.confirmTransaction(
        signature,
        'confirmed'
      );

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }

      console.log(`Versioned transaction sent: ${signature}`);
      return signature;
    }

    throw new Error('Unsupported transaction type');
  } catch (error) {
    console.error('Failed to sign and send transaction:', error);
    throw error;
  }
};

// Broadcast a pre-signed transaction (user already signed)
export const broadcastTransaction = async (
  serializedTransaction: string
): Promise<TransactionSignature> => {
  try {
    const conn = getConnection();
    
    // Deserialize the transaction
    const transactionBuffer = Buffer.from(serializedTransaction, 'base64');
    const transaction = VersionedTransaction.deserialize(transactionBuffer);

    // Send the pre-signed transaction
    const signature = await conn.sendTransaction(transaction, {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });

    // Wait for confirmation
    const confirmation = await conn.confirmTransaction(
      signature,
      'confirmed'
    );

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err}`);
    }

    console.log(`Pre-signed transaction broadcasted: ${signature}`);
    return signature;
  } catch (error) {
    console.error('Failed to broadcast transaction:', error);
    throw error;
  }
};

// Create a transaction template that users can sign
export const createTransactionTemplate = async (
  instructions: any[],
  payer?: PublicKey
): Promise<Transaction> => {
  const wallet = getServerWallet();
  const conn = getConnection();
  const transaction = new Transaction();
  
  // Set fee payer (default to server wallet)
  transaction.feePayer = payer || wallet.publicKey;
  
  // Add instructions
  transaction.add(...instructions);
  
  // Get recent blockhash
  const { blockhash } = await conn.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  
  return transaction;
};

// Health check for wallet
export const checkServerWalletHealth = async (): Promise<{
  publicKey: string;
  balance: number;
  network: string;
  isReady: boolean;
}> => {
  try {
    const wallet = getServerWallet();
    const conn = getConnection();
    const balance = await getServerWalletBalance();
    
    return {
      publicKey: wallet.publicKey.toString(),
      balance,
      network: conn.rpcEndpoint,
      isReady: true,
    };
  } catch (error) {
    const wallet = getServerWallet();
    const conn = getConnection();
    
    return {
      publicKey: wallet.publicKey.toString(),
      balance: 0,
      network: conn.rpcEndpoint,
      isReady: false,
    };
  }
};