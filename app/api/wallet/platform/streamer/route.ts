import { NextRequest, NextResponse } from 'next/server';
import { getSelf } from '@/lib/auth-service';
import { createStreamerForUser } from '@/lib/platform-wallet';
import { z } from 'zod';

const createStreamerSchema = z.object({
  tokenMint: z.string().min(1, 'Token mint address is required'),
});

// POST: Create streamer profile for user with platform wallet
export async function POST(request: NextRequest) {
  try {
    const user = await getSelf();
    const body = await request.json();
    const { tokenMint } = createStreamerSchema.parse(body);
    
    // For now, we'll create the streamer without the program
    // You can pass the program instance when you have it available
    const result = await createStreamerForUser(user.id, tokenMint);
    
    return NextResponse.json({
      success: true,
      platformWallet: result.platformWallet,
      signature: result.signature,
      message: result.signature 
        ? 'Streamer profile created successfully'
        : 'Platform wallet created, streamer profile will be created when program is available',
    });
  } catch (error: any) {
    console.error('Failed to create streamer profile:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create streamer profile', message: error.message },
      { status: 500 }
    );
  }
}