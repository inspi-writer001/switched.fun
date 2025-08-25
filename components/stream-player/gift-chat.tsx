"use client";

import { useState, useEffect, useTransition } from "react";
import { X } from "lucide-react";
import { useUser, useWallet } from "@civic/auth-web3/react";
import { toast } from "sonner";
import { getProgram } from "@/utils/program";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  getAccount,
  getMint,
} from "@solana/spl-token";
import { Wallet } from "@coral-xyz/anchor";
import { BN } from "bn.js";

interface TipComponentProps {
  hostIdentity: string;
  hostWalletAddress?: string;
  onClose?: () => void;
  onSendTip?: (amount: number) => void;
}

const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const supportedTokens = [
  {
    name: "USDC",
    symbol: "usdc",
    contractAddress: "2o39Cm7hzaXmm9zGGGsa5ZiveJ93oMC2D6U7wfsREcCo",
    decimals: 6,
  },
  {
    name: "USDT",
    symbol: "usdt",
    contractAddress: "2o39Cm7hzaXmm9zGGGsa5ZiveJ93oMC2D6U7wfsREcCo",
    decimals: 6,
  },
];

export const TipComponent = ({
  hostIdentity,
  hostWalletAddress,
  onClose,
  onSendTip,
}: TipComponentProps) => {
  const [selectedAmount, setSelectedAmount] = useState(5);
  const [customAmount, setCustomAmount] = useState(5);
  const [selectedToken, setSelectedToken] = useState(supportedTokens[0].symbol);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const userContext = useUser();
  const { wallet, address: solAddress } = useWallet({ type: "solana" });
  const address = solAddress || "";

  const tipAmounts = [5, 10, 20, 50, 100, 1000];

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(amount);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setCustomAmount(value);
    setSelectedAmount(value);
  };

  const handleSendTip = () => {
    if (!address || !wallet) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!hostWalletAddress) {
      toast.error("Streamer wallet address not available");
      return;
    }

    if (customAmount <= 0 || customAmount > balance) {
      toast.error("Invalid tip amount");
      return;
    }

    startTransition(async () => {
      try {
        const program = getProgram(connection, wallet as unknown as Wallet);

        const tokenInfo = supportedTokens.find(
          (t) => t.symbol === selectedToken
        );
        if (!tokenInfo) throw new Error("Unsupported token");

        const tokenMint = new PublicKey(tokenInfo.contractAddress);
        const tipAmount = new BN(
          customAmount * Math.pow(10, tokenInfo.decimals)
        );

        const signerAta = await getAssociatedTokenAddress(
          tokenMint,
          new PublicKey(address)
        );

        const [streamerStatePDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("user"), new PublicKey(hostWalletAddress).toBuffer()],
          program.programId
        );

        const streamerAta = await getAssociatedTokenAddress(
          tokenMint,
          streamerStatePDA,
          true
        );

        const [globalStatePDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("global_state")],
          program.programId
        );

        const tx = await program.methods
          .tipUser({
            amount: tipAmount,
            streamerAccount: new PublicKey(hostWalletAddress),
          })
          .accounts({
            signer: address,
            signerAta: signerAta,
            streamerAta: streamerAta,
            tokenMint: tokenMint,
            // streamerState: streamerStatePDA,
            // globalState: globalStatePDA,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .rpc();

        toast.success(
          `Tip sent! ${customAmount} ${tokenInfo.symbol.toUpperCase()}`
        );
        onSendTip?.(customAmount);
        onClose?.();
      } catch (error: any) {
        console.error("Tip error:", error);
        toast.error(`Failed to send tip: ${error.message}`);
      }
    });
  };

  // Update user's Solana wallet in database when wallet connects
  useEffect(() => {
    const updateUserWallet = async () => {
      if (!address) return;
      
      try {
        const response = await fetch('/api/user/me', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ solanaWallet: address }),
        });
        
        if (!response.ok) {
          console.error('Failed to update user wallet');
        }
      } catch (error) {
        console.error('Error updating user wallet:', error);
      }
    };

    updateUserWallet();
  }, [address]);

  // Fetch balance on component mount and token change
  useEffect(() => {
    if (!address || !wallet) return;
    console.log(address);
    console.log(hostWalletAddress);
    console.log(hostIdentity);

    const fetchBalance = async () => {
      setIsLoading(true);
      try {
        const tokenInfo = supportedTokens.find(
          (t) => t.symbol === selectedToken
        );
        if (!tokenInfo) return;

        const tokenMint = new PublicKey(tokenInfo.contractAddress);
        const ata = await getAssociatedTokenAddress(
          tokenMint,
          new PublicKey(address)
        );

        try {
          const account = await getAccount(connection, ata);
          const mintInfo = await getMint(connection, tokenMint);
          const balance =
            Number(account.amount) / Math.pow(10, mintInfo.decimals);
          setBalance(balance);
        } catch {
          setBalance(0);
        }
      } catch (error) {
        console.error("Failed to fetch balance:", error);
        setBalance(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [address, wallet, selectedToken]);

  return (
    <div className="bg-gray-900 text-white w-full max-w-sm mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-lg font-medium">Send Tip</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Token Selector & Balance */}
      <div className="p-4 space-y-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            Select Token
          </label>
          <select
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white"
          >
            {supportedTokens.map((token) => (
              <option key={token.symbol} value={token.symbol}>
                {token.name} ({token.symbol.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-green-400">
          <div className="w-4 h-4 rounded-full bg-green-400 flex items-center justify-center">
            <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
          </div>
          <span className="text-sm">
            Balance:{" "}
            {isLoading
              ? "Loading..."
              : `${balance} ${selectedToken.toUpperCase()}`}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 space-y-6">
        {/* Tip Amount Buttons */}
        <div className="grid grid-cols-3 gap-3">
          {tipAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => handleAmountSelect(amount)}
              className={`
                h-12 rounded-lg border font-medium text-sm transition-all
                ${
                  selectedAmount === amount
                    ? "bg-red-600 border-red-600 text-white"
                    : "bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500"
                }
              `}
            >
              {amount} {selectedToken.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Custom amount:</label>
          <input
            type="number"
            value={customAmount}
            onChange={handleCustomAmountChange}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-gray-500 focus:outline-none"
            min="1"
            max={balance}
          />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 space-y-4 border-t border-gray-700">
        {/* Send Tip Button */}
        <button
          onClick={handleSendTip}
          disabled={
            customAmount <= 0 ||
            customAmount > balance ||
            isPending ||
            isLoading ||
            !address ||
            !wallet
          }
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
        >
          {isPending
            ? "Sending..."
            : !address || !wallet
              ? "Connect Wallet"
              : "Send Tip"}
        </button>
      </div>
    </div>
  );
};
