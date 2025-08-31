import { NextResponse } from 'next/server';
import { checkServerWalletHealth } from '@/lib/server-wallet';

export async function GET() {
  try {
    const health = await checkServerWalletHealth();
    return NextResponse.json(health);
  } catch (error: any) {
    console.error('Wallet health check failed:', error);
    return NextResponse.json(
      { 
        error: 'Wallet health check failed',
        message: error.message,
        isReady: false 
      }, 
      { status: 500 }
    );
  }
}