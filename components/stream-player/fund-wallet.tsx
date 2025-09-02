import { truncateBetween } from "@/utils/helpers";
import { QRCodeSVG } from "qrcode.react";
import React from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

interface FundWalletProps {
  walletAddress: string;
  title: string;
}

export const FundWallet = ({ walletAddress, title }: FundWalletProps) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="text-sm text-gray-400 text-center">
        {title}
      </div>

      {walletAddress ? (
        <>
          <div className="bg-white p-4 rounded-lg">
            <QRCodeSVG
              value={walletAddress}
              size={128}
              bgColor="#000000"
              fgColor="#ffffff"
              level="M"
            />
          </div>

          <div className="text-xs text-gray-400 text-center max-w-full break-all px-2">
            {truncateBetween(walletAddress)}
          </div>

          <Button
            onClick={() => {
              navigator.clipboard.writeText(walletAddress);
              toast.success("Address copied to clipboard!");
            }}
            variant="secondary"
            size="sm"
          >
            Copy Address
          </Button>
          <div className="text-xs bg-primary/10 border border-primary/20 text-gray-200 capitalize rounded-sm p-1 px-2 text-center">
            only send USDC on Solana network to this address
          </div>
        </>
      ) : (
        <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading wallet address...</div>
        </div>
      )}
    </div>
  );
};
