import { FundWallet } from '@/components/stream-player/fund-wallet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import React from 'react'

interface FundWalletModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  walletAddress: string;
}

export const FundWalletModal = ({ open, setOpen, walletAddress }: FundWalletModalProps) => {
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className='text-center font-sans'>Fund Wallet</DialogTitle>
        </DialogHeader>

        <FundWallet walletAddress={walletAddress} title="Fund your platform wallet from an external wallet?" />
      </DialogContent>
    </Dialog>
  )
}
