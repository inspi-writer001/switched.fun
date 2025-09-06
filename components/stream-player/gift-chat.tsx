"use client";

import { useState, useEffect, useTransition } from "react";
import { useUser, useWallet } from "@civic/auth-web3/react";
import { toast } from "sonner";
import { getProgram } from "@/utils/program";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { Wallet } from "@coral-xyz/anchor";
import { BN } from "bn.js";
import Image from "next/image";
import { allGifts } from "./gift-items";
import { GiftMode, useChatSidebar } from "@/store/use-chat-sidebar";
import { connection, supportedTokens } from "@/config/wallet";
import { fetchStreamerAta, fetchBalance } from "@/utils/wallet";
import { FundWallet } from "./fund-wallet";
import { useBalance, useCurrentUserAta } from "@/hooks/use-balance";
import { getServerWallet } from "@/lib/server-wallet";
import { withdraw } from "@/app/(dashboard)/u/[username]/profile/_components/withdrawalService";
import { userHasWallet } from "@civic/auth-web3";
import { fetchSolanaPrice, fetchSolanaPriceCached } from "@/utils/solana-price";
import { Button } from "../ui/button";
import { createTip } from "@/actions/tip";
import { useTipBroadcast } from "@/hooks/use-tip-broadcast";
import { useRoomContext } from "@livekit/components-react";

interface TipComponentProps {
  hostIdentity: string;
  hostWalletAddress?: string;
  streamerId?: string;
  streamId?: string;
  onClose?: () => void;
  onSendTip?: (amount: number) => void;
}

export const TipComponent = ({
  hostIdentity,
  hostWalletAddress,
  streamerId,
  streamId,
  onClose,
  onSendTip,
}: TipComponentProps) => {
  const { giftMode } = useChatSidebar((state) => state);
  const [selectedAmount, setSelectedAmount] = useState(5);
  const [customAmount, setCustomAmount] = useState(5);
  // const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [streamerAtaAddress, setStreamerAtaAddress] = useState<string>("");
  const userContext = useUser();
  const hasWallet = userHasWallet(userContext);
  const userAddress = hasWallet ? userContext.solana.address : "";

  const { data: currentUserAta } = useCurrentUserAta();

  // Gift states
  const [selectedFilter, setSelectedFilter] = useState<"all" | "affordable">(
    "all"
  );
  const [selectedGift, setSelectedGift] = useState<string | null>(null);

  const { wallet, address: solAddress } = useWallet({ type: "solana" });
  const address = solAddress || "";

  const { data: balance, isLoading } = useBalance(
    currentUserAta?.streamerAta
  );

  const room = useRoomContext();
  const { broadcastTip } = useTipBroadcast(room);

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

    if (customAmount <= 0 || customAmount > (balance || 0)) {
      toast.error("Invalid tip amount");
      return;
    }

    startTransition(async () => {
      try {
        const program = getProgram(connection, wallet as unknown as Wallet);

        const tokenInfo = supportedTokens;
        if (!tokenInfo) throw new Error("Unsupported token");

        const tokenMint = new PublicKey(tokenInfo.contractAddress);
        const tipAmount = customAmount;

        const [streamerStatePDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("user"), new PublicKey(hostWalletAddress).toBuffer()],
          program.programId
        );

        const streamerAta = await getAssociatedTokenAddress(
          tokenMint,
          streamerStatePDA,
          true
        );
        let withdrawalParams: any = {
          amount: tipAmount,
          destinationAddress: streamerAta,
          walletType: "platform",
          userAddress: userAddress ?? '',
          connection,
        };

        withdrawalParams.userContext = userContext;

        try {
          const solPriceData = await fetchSolanaPrice();
          const signature = await withdraw(withdrawalParams, solPriceData.price);

          // Save tip to database after successful transaction
          if (streamerId) {
            try {
              const tipResult = await createTip({
                amount: customAmount,
                tokenType: "USDC", // Assuming USDC for now
                streamerId: streamerId,
                streamId: streamId,
                transactionHash: signature,
              });

              // Broadcast tip notification to all viewers
              if (tipResult.success && tipResult.data) {
                await broadcastTip(tipResult.data);
              }
            } catch (dbError) {
              console.error("Failed to save tip to database:", dbError);
              // Don't fail the entire transaction if DB save fails
              // The blockchain transaction was successful
            }
          }

          toast.success(`Tip sent! $${customAmount}`);
        } catch (error: any) {
          console.error("Tip error:", error?.message);
          toast.error(`Failed to send tip: ${error.message}`);
        }

        onSendTip?.(customAmount);
        // onClose?.();
      } catch (error: any) {
        console.error("Tip error:", error?.message);
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

  // TODO: Move this section to a hook and use useQuery - Calculate streamer's platform wallet ATA address
  useEffect(() => {
    async function fetchStreamerAtaAddress() {
      if (!hostWalletAddress || !wallet) return;

      const streamerAtaAddress = await fetchStreamerAta(
        hostWalletAddress,
        wallet
      );
      if (streamerAtaAddress) {
        setStreamerAtaAddress(streamerAtaAddress);
      }
    }

    fetchStreamerAtaAddress();
  }, [hostWalletAddress, wallet]);

  return (
    <div className=" text-white w-full max-w-sm mx-auto h-full flex flex-col">
      {giftMode === GiftMode.TIP ? (
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
            <FundWallet
              walletAddress={streamerAtaAddress}
              title="Tip host from an external wallet?"
            />
          </div>

          {/* Bottom Section */}
          <div className="__bottom_component flex flex-col">
            <div className="flex-1 mb-o p-0 pt-4 md:p-4 space-y-6 border-t border-border/30">
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
                  className="w-full bg-transparent border border-border/30 rounded-full px-3 py-2 text-white focus:outline-none text-center"
                  min="1"
                  max={balance}
                />
              </div>
            </div>
            <div className="flex flex-row md:p-4 space-y-4 w-full items-center justify-between">
              {/* Send Tip Button */}
              <div className="__balance_container flex flex-row place-items-center">
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
              <Button
                onClick={handleSendTip}
                disabled={
                  customAmount <= 0 ||
                  customAmount > (balance || 0) ||
                  isPending ||
                  !address ||
                  !wallet
                }
                size="sm"
                className="px-4"
              >
                {isPending
                  ? "Sending..."
                  : !address || !wallet
                    ? "Connect Wallet"
                    : "Send Tip"}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Gift Mode */}
          <div className="w-full md:p-4 mt-4 md:mt-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-gray-400">
                <div className="w-4 h-4 bg-yellow-400 rounded-full mr-2"></div>
                <span className="text-sm">Balance: ${balance}</span>
              </div>
              <div className="flex bg-border/30 rounded-full p-1">
                <Button
                  onClick={() => setSelectedFilter("all")}
                  variant="ghost"
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                    selectedFilter === "all"
                      ? "bg-red-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  onClick={() => setSelectedFilter("affordable")}
                  variant="ghost"
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                    selectedFilter === "affordable"
                      ? "bg-red-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                  size="sm"
                >
                  Affordable
                </Button>
              </div>
            </div>

            {/* Scrollable Gift Grid - 2x2 */}
            <div className=" h-full max-h-[calc(100dvh-230px)] w-full overflow-y-auto">
              <div className="w-full grid grid-cols-2 gap-3">
                {filteredGifts.map((gift) => (
                  <Button
                    key={gift.id}
                    onClick={() => {
                      handleGiftSelect(gift.id);
                      handleAmountSelect(gift.price);
                    }}
                    className={`relative rounded-2xl p-4 flex flex-col items-center justify-center transition-all hover:scale-105 h-32 ${
                      selectedGift === gift.id
                        ? "bg-[#FE3C3E40] border-[#FE3C3E] text-white"
                        : "bg-secondary text-gray-300 hover:border-gray-500"
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
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center p-0 md:p-4 space-y-4 w-full justify-between">
              {/* Send Tip Button */}
              <div className="__balance_container flex flex-row place-items-center">
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
              <Button
                onClick={handleSendTip}
                disabled={
                  customAmount <= 0 ||
                  customAmount > (balance || 0) ||
                  isPending ||
                  isLoading ||
                  !address ||
                  !wallet || !selectedGift
                }
                size="sm"
                className="px-4"
                // className="md:w-[100px] bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg transition-colors"
              >
                {selectedGift && isPending
                  ? "Sending..."
                  : !address || !wallet
                    ? "Connect Wallet"
                    : "Send Gift"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
