import { NextRequest, NextResponse } from 'next/server';
import { getSelf } from '@/lib/auth-service';
import { 
  createUserPlatformWalletTransaction, 
  completePlatformWalletCreation,
  createStreamerForUser, 
  getUserPlatformWallet,
  userHasPlatformWallet 
} from '@/lib/platform-wallet';
import { z } from 'zod';

const createStreamerSchema = z.object({
  tokenMint: z.string().min(1, 'Token mint address is required'),
  userPublicKey: z.string().min(1, 'User public key is required'),
});

// GET: Get user's platform wallet
export async function GET() {
  try {
    const user = await getSelf();
    
    const platformWallet = await getUserPlatformWallet(user.id);
    const hasPlatformWallet = await userHasPlatformWallet(user.id);
    
    return NextResponse.json({
      platformWallet,
      hasPlatformWallet,
      userId: user.id,
      username: user.username,
    });
  } catch (error: any) {
    console.error('Failed to get platform wallet:', error);
    return NextResponse.json(
      { error: 'Failed to get platform wallet', message: error.message },
      { status: 500 }
    );
  }
}

const completeCreationSchema = z.object({
  userSignedTransaction: z.string().min(1, 'Signed transaction is required'),
  userPublicKey: z.string().min(1, 'User public key is required'),
});

// POST: Create platform wallet transaction for user to sign
export async function POST(request: NextRequest) {
  try {
    const user = await getSelf();
    const body = await request.json();
    const { tokenMint, userPublicKey } = createStreamerSchema.parse(body);
    
    // Initialize the Anchor program for server-side use
    const { getConnection, getServerWalletAsAnchorWallet } = await import('@/lib/server-wallet');
    const { getProgram } = await import('@/utils/program');
    
    const connection = getConnection();
    const serverWallet = getServerWalletAsAnchorWallet();
    const program = getProgram(connection, serverWallet);
    
    const result = await createUserPlatformWalletTransaction(
      user.id, 
      userPublicKey, 
      tokenMint,
      program
    );
    
    return NextResponse.json({
      success: true,
      serializedTransaction: result.serializedTransaction,
      message: result.message,
    });
  } catch (error: any) {
    console.error('Failed to create platform wallet transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create platform wallet transaction', message: error.message },
      { status: 500 }
    );
  }
}

// PATCH: Complete platform wallet creation after user signs transaction
export async function PATCH(request: NextRequest) {
  try {
    const user = await getSelf();
    const body = await request.json();
    const { userSignedTransaction, userPublicKey } = completeCreationSchema.parse(body);
    
    const result = await completePlatformWalletCreation(
      user.id,
      userPublicKey,
      userSignedTransaction
    );
    
    return NextResponse.json({
      success: true,
      platformWallet: result.platformWallet,
      signature: result.signature,
      message: 'Platform wallet created and registered successfully',
    });
  } catch (error: any) {
    console.error('Failed to complete platform wallet creation:', error);
    return NextResponse.json(
      { error: 'Failed to complete platform wallet creation', message: error.message },
      { status: 500 }
    );
  }
}