import { NextRequest, NextResponse } from 'next/server';
import { broadcastTransaction, signAndSendTransaction } from '@/lib/server-wallet';
import { Transaction, VersionedTransaction } from '@solana/web3.js';
import { z } from 'zod';

const broadcastSchema = z.object({
  serializedTransaction: z.string().min(1, 'Serialized transaction is required'),
  type: z.enum(['user-signed', 'server-signed']).default('user-signed'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serializedTransaction, type } = broadcastSchema.parse(body);

    let signature: string;

    if (type === 'user-signed') {
      // Broadcast a pre-signed transaction from user
      signature = await broadcastTransaction(serializedTransaction);
    } else {
      // Server signs and sends the transaction
      const transactionBuffer = Buffer.from(serializedTransaction, 'base64');
      
      // Try to deserialize as versioned transaction first
      try {
        const versionedTx = VersionedTransaction.deserialize(transactionBuffer);
        signature = await signAndSendTransaction(versionedTx);
      } catch {
        // Fall back to regular transaction
        const transaction = Transaction.from(transactionBuffer);
        signature = await signAndSendTransaction(transaction);
      }
    }

    return NextResponse.json({
      success: true,
      signature,
      message: 'Transaction broadcasted successfully',
    });

  } catch (error: any) {
    console.error('Transaction broadcast failed:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Transaction broadcast failed',
        message: error.message,
      },
      { status: 500 }
    );
  }
}