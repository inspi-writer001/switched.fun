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
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { truncateBetween } from "@/utils/helpers";
import { allGifts, Gift } from "./gift-items";

interface TipComponentProps {
  hostIdentity: string;
  hostWalletAddress?: string;
  onClose?: () => void;
  onSendTip?: (amount: number) => void;
}

const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const supportedTokens = {
  name: "USDC",
  symbol: "usdc",
  contractAddress: "2o39Cm7hzaXmm9zGGGsa5ZiveJ93oMC2D6U7wfsREcCo",
  decimals: 6,
};

export const TipComponent = ({
  hostIdentity,
  hostWalletAddress,
  onClose,
  onSendTip,
}: TipComponentProps) => {
  const [mode, setMode] = useState<"qr" | "gift">("qr");
  const [selectedAmount, setSelectedAmount] = useState(5);
  const [customAmount, setCustomAmount] = useState(5);
  const [selectedToken, setSelectedToken] = useState(supportedTokens.symbol);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [streamerAtaAddress, setStreamerAtaAddress] = useState<string>("");

  // Gift states
  const [selectedFilter, setSelectedFilter] = useState<"all" | "affordable">(
    "all"
  );
  const [selectedGift, setSelectedGift] = useState<string | null>(null);

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

        const tokenInfo = supportedTokens;
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

  // Gift functions
  const filteredGifts = allGifts.filter(
    (gift) => selectedFilter === "all" || gift.price <= 50
  );

  const handleGiftSelect = (giftId: string) => {
    setSelectedGift(giftId);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}k`;
    }
    return `${price}`;
  };

  const handleSendGift = () => {
    if (!selectedGift) return;

    const gift = allGifts.find((g) => g.id === selectedGift);
    if (!gift) return;

    // For now, just show a toast - you can implement the actual gift sending logic
    toast.success(`Sent ${gift.name} gift!`);
    onClose?.();
  };

  // Calculate streamer's platform wallet ATA address
  useEffect(() => {
    const calculateStreamerAta = async () => {
      if (!hostWalletAddress) return;

      try {
        const program = getProgram(connection, wallet as unknown as Wallet);

        const tokenMint = new PublicKey(supportedTokens.contractAddress);

        // Calculate the streamer PDA (platform wallet)
        const [streamerStatePDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("user"), new PublicKey(hostWalletAddress).toBuffer()],
          program.programId
        );

        // Calculate the streamer's ATA for receiving tips
        const streamerAta = await getAssociatedTokenAddress(
          tokenMint,
          streamerStatePDA,
          true // allowOwnerOffCurve = true for PDA
        );

        setStreamerAtaAddress(streamerAta.toString());
        console.log("Streamer platform wallet ATA:", streamerAta.toString());
      } catch (error) {
        console.error("Failed to calculate streamer ATA:", error);
      }
    };

    calculateStreamerAta();
  }, [hostWalletAddress]);

  // Fetch balance on component mount and token change
  useEffect(() => {
    if (!address || !wallet) return;
    console.log(address);
    console.log(hostWalletAddress);
    console.log(hostIdentity);

    const fetchBalance = async () => {
      setIsLoading(true);
      try {
        const tokenInfo = supportedTokens;
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
    <div className=" text-white w-full max-w-sm mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex space-x-2">
          <button
            onClick={() => setMode("qr")}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
              mode === "qr"
                ? "bg-red-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            Show QR
          </button>
          <button
            onClick={() => setMode("gift")}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
              mode === "gift"
                ? "bg-red-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            Send Gift
          </button>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {mode === "qr" ? (
        <>
          {/* Token Selector & Balance */}
          <div className="p-4 space-y-3">
            <div>
              <div className="__balance_container flex flex-row w-full">
                <div className="__image_container flex place-items-center">
                  <Image
                    src={"/image/pepicons-print_coins.png"}
                    alt="coins icon"
                    width={16}
                    height={16}
                  />
                </div>
                <div className="__balance ml-2">
                  <span className="text-sm">
                    Balance:{" "}
                    <span className="text-green-400">
                      {isLoading ? "Loading..." : `$${balance}`}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* QR Area */}
          <div className="flex-1 mb-o p-4 space-y-6 border-gray-700">
            {/* Platform Wallet QR Code */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="text-sm text-gray-400 text-center">
                Tip host from an external wallet?
              </div>

              {streamerAtaAddress ? (
                <>
                  <div className="bg-white p-4 rounded-lg">
                    <QRCodeSVG
                      value={streamerAtaAddress}
                      size={128}
                      bgColor="#000000"
                      fgColor="#ffffff"
                      level="M"
                      // includeMargin={true}
                      // marginSize={2}
                    />
                  </div>

                  <div className="text-xs text-gray-400 text-center max-w-full break-all px-2">
                    {truncateBetween(streamerAtaAddress)}
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(streamerAtaAddress);
                      toast.success("Address copied to clipboard!");
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Copy Address
                  </button>
                  <div className="text-xs bg-[#FE3C3E40] rounded-sm p-1 px-2 text-center">
                    only send USDC on Solana network to this address
                  </div>
                </>
              ) : (
                <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-center">
                  <div className="text-gray-400 text-sm">
                    Loading wallet address...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="__bottom_component flex flex-col">
            <div className="flex-1 mb-o p-4 space-y-6 border-t border-gray-700">
              {/* Tip Amount Buttons */}
              <div className="flex flex-row overflow-x-scroll gap-2">
                {tipAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleAmountSelect(amount)}
                    className={`
                    h-8 w-10 min-w-20 rounded-sm border font-medium text-xs transition-all
                    ${
                      selectedAmount === amount
                        ? "bg-[#FE3C3E40] border-[#FE3C3E] text-white"
                        : "bg-[#353534] border-[#353534] text-gray-300 hover:border-gray-500"
                    }
                  `}
                  >
                    {amount}
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400">Custom amount:</label>
                <input
                  type="number"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  className="w-full bg-transparent px-3 py-2 text-white focus:outline-none text-center"
                  min="1"
                  max={balance}
                />
              </div>
            </div>
            <div className="flex flex-row p-4 space-y-4 w-full justify-between">
              {/* Send Tip Button */}
              <div className="__balance_container flex flex-row w-[40%] place-items-center">
                <div className="__image_container flex place-items-center">
                  <Image
                    src={"/image/pepicons-print_coins.png"}
                    alt="coins icon"
                    width={18}
                    height={18}
                  />
                </div>
                <div className="__balance ml-2">
                  <span className="text-base">
                    Balance:{" "}
                    <span className="text-green-400">
                      {isLoading ? "Loading..." : `$${balance}`}
                    </span>
                  </span>
                </div>
              </div>
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
                className="md:w-[100px] bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg transition-colors"
              >
                {isPending
                  ? "Sending..."
                  : !address || !wallet
                    ? "Connect Wallet"
                    : "Send Tip"}
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Gift Mode */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-gray-400">
                <div className="w-4 h-4 bg-yellow-400 rounded-full mr-2"></div>
                <span className="text-sm">Balance: ${balance}</span>
              </div>
              <div className="flex bg-gray-800 rounded-full p-1">
                <button
                  onClick={() => setSelectedFilter("all")}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                    selectedFilter === "all"
                      ? "bg-red-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedFilter("affordable")}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                    selectedFilter === "affordable"
                      ? "bg-red-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Affordable
                </button>
              </div>
            </div>

            {/* Scrollable Gift Grid - 2x2 */}
            <div className=" h-full max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 p-2">
                {filteredGifts.map((gift) => (
                  <button
                    key={gift.id}
                    onClick={() => {
                      handleGiftSelect(gift.id);
                      handleAmountSelect(gift.price);
                    }}
                    className={`relative rounded-2xl p-4 flex flex-col items-center justify-center transition-all hover:scale-105 h-32 ${
                      selectedGift === gift.id
                        ? "bg-[#FE3C3E40] border-[#FE3C3E] text-white"
                        : "bg-transparent border-[#353534] text-gray-300 hover:border-gray-500"
                    }`}
                  >
                    {gift.premium && (
                      <div className="absolute top-1 right-1">
                        <div className=" text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                          ⚡
                        </div>
                      </div>
                    )}

                    <div className="mb-1">{gift.icon}</div>

                    <span className="text-white font-medium text-xs mb-1 text-center leading-tight">
                      {gift.name}
                    </span>

                    <div className="flex items-center text-gray-300">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></div>
                      <span className="text-xs">
                        ${formatPrice(gift.price)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-row p-4 space-y-4 w-full justify-between">
              {/* Send Tip Button */}
              <div className="__balance_container flex flex-row w-[40%] place-items-center">
                <div className="__image_container flex place-items-center">
                  <Image
                    src={"/image/pepicons-print_coins.png"}
                    alt="coins icon"
                    width={18}
                    height={18}
                  />
                </div>
                <div className="__balance ml-2">
                  <span className="text-base">
                    Balance:{" "}
                    <span className="text-green-400">
                      {isLoading ? "Loading..." : `$${balance}`}
                    </span>
                  </span>
                </div>
              </div>
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
                className="md:w-[100px] bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg transition-colors"
              >
                {selectedGift && isPending
                  ? "Sending..."
                  : !address || !wallet
                    ? "Connect Wallet"
                    : "Send Gift"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
