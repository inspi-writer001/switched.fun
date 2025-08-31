import { NextRequest, NextResponse } from 'next/server';
import { getSelf } from '@/lib/auth-service';
import { z } from 'zod';
import { 
  createWithdrawalTransaction, 
  completeWithdrawal 
} from '@/lib/platform-wallet-withdrawal';

const createWithdrawalSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  destinationAddress: z.string().min(1, 'Destination address is required'),
  userPublicKey: z.string().min(1, 'User public key is required'),
  gasInUsdc: z.number().nonnegative('Gas fee must be non-negative'),
});

const completeWithdrawalSchema = z.object({
  userSignedTransaction: z.string().min(1, 'Signed transaction is required'),
  userPublicKey: z.string().min(1, 'User public key is required'),
});

// POST: Create withdrawal transaction for user to sign
export async function POST(request: NextRequest) {
  try {
    const user = await getSelf();
    const body = await request.json();
    const { amount, destinationAddress, userPublicKey, gasInUsdc } = createWithdrawalSchema.parse(body);
    
    // Initialize the Anchor program for server-side use
    const { getConnection, getServerWalletAsAnchorWallet } = await import('@/lib/server-wallet');
    const { getProgram } = await import('@/utils/program');
    
    const connection = getConnection();
    const serverWallet = getServerWalletAsAnchorWallet();
    const program = getProgram(connection, serverWallet);
    
    const result = await createWithdrawalTransaction(
      user.id,
      userPublicKey,
      amount,
      destinationAddress,
      gasInUsdc,
      program
    );
    
    return NextResponse.json({
      success: true,
      serializedTransaction: result.serializedTransaction,
      message: result.message,
    });
  } catch (error: any) {
    console.error('Failed to create withdrawal transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create withdrawal transaction', message: error.message },
      { status: 500 }
    );
  }
}

// PATCH: Complete withdrawal after user signs transaction
export async function PATCH(request: NextRequest) {
  try {
    const user = await getSelf();
    const body = await request.json();
    const { userSignedTransaction, userPublicKey } = completeWithdrawalSchema.parse(body);
    
    const result = await completeWithdrawal(
      user.id,
      userPublicKey,
      userSignedTransaction
    );
    
    return NextResponse.json({
      success: true,
      signature: result.signature,
      message: 'Withdrawal completed successfully',
    });
  } catch (error: any) {
    console.error('Failed to complete withdrawal:', error);
    return NextResponse.json(
      { error: 'Failed to complete withdrawal', message: error.message },
      { status: 500 }
    );
  }
}