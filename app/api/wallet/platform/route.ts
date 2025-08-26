import { NextRequest, NextResponse } from 'next/server';
import { getSelf } from '@/lib/auth-service';
import { 
  createUserPlatformWallet, 
  createStreamerForUser, 
  getUserPlatformWallet,
  userHasPlatformWallet 
} from '@/lib/platform-wallet';
import { z } from 'zod';

const createStreamerSchema = z.object({
  tokenMint: z.string().min(1, 'Token mint address is required'),
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

// POST: Create platform wallet for user
export async function POST() {
  try {
    const user = await getSelf();
    
    const result = await createUserPlatformWallet(user.id);
    
    return NextResponse.json({
      success: true,
      platformWallet: result.platformWallet,
      message: 'Platform wallet created successfully',
    });
  } catch (error: any) {
    console.error('Failed to create platform wallet:', error);
    return NextResponse.json(
      { error: 'Failed to create platform wallet', message: error.message },
      { status: 500 }
    );
  }
}