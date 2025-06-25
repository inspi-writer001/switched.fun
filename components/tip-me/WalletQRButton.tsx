"use client";

import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import QRCode from "react-qr-code";
import { userHasWallet } from "@civic/auth-web3";
import { useUser, useWallet } from "@civic/auth-web3/react";
import { Copy } from "lucide-react";
import { toast } from "sonner"; // Import Sonner toast
import { Button } from "../ui/button";
import {
  getOrCreateAssociatedTokenAccountWithProvider,
  getProgram,
  getProvider
} from "@/utils/program";
import { Connection, PublicKey } from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";
import { getMint, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { BN } from "bn.js";
// import { Wallet } from "@coral-xyz/anchor";

interface WalletQRButtonProps {
  tokenMint?: string;
}

const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const supportedTokens = [
  {
    name: "USDC",
    symbol: "usdc",
    contractAddress: "6mWfrWzYf5ot4S8Bti5SCDRnZWA5ABPH1SNkSq4mNN1C"
  },
  {
    name: "USDT",
    symbol: "usdt",
    contractAddress: "6mWfrWzYf5ot4S8Bti5SCDRnZWA5ABPH1SNkSq4mNN1C"
  }
];

export const WalletQRButton: React.FC<WalletQRButtonProps> = ({
  tokenMint
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [statePda, setStatePda] = useState("");
  const [isPDAInit, setIsPDAInit] = useState(false);
  const [selectedToken, setSelectedToken] = useState(supportedTokens[0].symbol);
  const [amount, setAmount] = useState("");
  const userContext = useUser();
  const hasWallet = userHasWallet(userContext);
  const address = hasWallet ? userContext.solana.address : "";
  const { wallet, address: solAddress } = useWallet({ type: "solana" });
  console.log("sol_address", solAddress);
  // const uri = address
  //   ? `${address}${tokenMint ? `?spl-token=${tokenMint}` : ""}`
  //   : "";

  const program = getProgram(connection, wallet as unknown as Wallet);
  const provider = getProvider(connection, wallet as unknown as Wallet);

  const handleInitPDA = async () => {
    console.log("Init PDA with", selectedToken, amount);
    const token_mint = supportedTokens.find(
      (e) => (e.symbol = selectedToken)
    )?.contractAddress;

    if (!token_mint || !address || !solAddress) return;

    const mintInfo = await getMint(connection, new PublicKey(token_mint));
    const decimals = mintInfo.decimals;

    // const amount = 3.3;
    const lamports = Number(amount) * 10 ** decimals;

    const tokenAccount = await getOrCreateAssociatedTokenAccountWithProvider(
      provider,
      new PublicKey(address),
      new PublicKey(token_mint)
    );
    console.log("new_token_account", tokenAccount.address.toBase58());
    const tx = await program.methods
      .tipUser(new BN(lamports))
      .accounts({
        recipient: new PublicKey(address),
        tipper: new PublicKey(solAddress),
        tipperTokenAccount: tokenAccount.address.toBase58(),
        tokenMint: token_mint
      })
      .signers([])
      .rpc();

    console.log(tx);
    // Add blockchain call here
  };

  const fetchUserProgramWallet = async () => {
    if (!solAddress) return;
    console.log("solAddress", solAddress);
    const [recipientStatePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("recipient_state"), new PublicKey(solAddress).toBuffer()],
      program.programId
    );

    setStatePda(recipientStatePDA.toBase58());

    console.log("Recipient State PDA:", recipientStatePDA.toBase58());
    try {
      const recipientStateAccount = await program.account.userAccount.fetch(
        recipientStatePDA
      );
      setIsPDAInit(true);
      console.log("Recipient State Data:", recipientStateAccount);
    } catch (err) {
      setIsPDAInit(false);
    }
  };

  useEffect(() => {
    Modal.setAppElement("body");
    fetchUserProgramWallet();
  }, []);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(statePda)
      .then(() => {
        toast.success("Wallet address copied to clipboard!", {
          position: "top-center",
          duration: 2000,
          style: {
            background: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "calc(var(--radius) - 2px)",
            padding: "8px 16px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
          }
        });
      })
      .catch((err) => {
        toast.error("Failed to copy address", {
          position: "top-center",
          duration: 2000,
          style: {
            background: "hsl(var(--destructive))",
            color: "hsl(var(--destructive-foreground))",
            border: "1px solid hsl(var(--destructive))",
            borderRadius: "calc(var(--radius) - 2px)",
            padding: "8px 16px"
          }
        });
      });
  };

  return (
    <>
      <Button
        onClick={() => {
          setIsOpen(true);
        }}
        disabled={!hasWallet}
        variant="primary"
        size="sm"
        className="min-w-44 max-w-48 px-3 rounded-sm"
      >
        {isPDAInit ? (
          <span className="flex items-center gap-x-1">
            💰 <span>Tip Me</span>
          </span>
        ) : (
          <span className="flex items-center gap-x-1">
            ⚡️ <span>Activate Account</span>
          </span>
        )}
      </Button>

      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        contentLabel="Wallet QR Code or Init PDA"
        style={{
          overlay: {
            backgroundColor: "hsl(var(--background) / 0.9)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          },
          content: {
            position: "relative",
            maxWidth: "440px",
            margin: "0 20px",
            padding: "32px",
            borderRadius: "calc(var(--radius) + 4px)",
            border: "1px solid hsl(var(--border))",
            background: "hsl(var(--card))",
            color: "hsl(var(--card-foreground))",
            boxShadow: "0 12px 24px hsl(var(--background) / 0.25)"
          }
        }}
      >
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl gradient-text mb-2">
              {isPDAInit ? "Wallet Address" : "Initialize Wallet"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isPDAInit
                ? "Scan or copy your wallet QR code"
                : "Choose a token and amount to initialize your wallet"}
            </p>
          </div>

          {hasWallet ? (
            isPDAInit ? (
              <>
                <div className="relative p-4 bg-card rounded-xl border border-border card-hover">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10" />
                  <QRCode
                    value={statePda}
                    size={256}
                    className="relative z-10 mx-auto"
                    bgColor="hsl(var(--card))"
                    fgColor="hsl(var(--card-foreground))"
                  />
                </div>

                <div className="group relative">
                  <div className="block p-3 pr-12 bg-muted rounded-lg text-sm transition-colors truncate font-mono text-muted-foreground">
                    {statePda}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm mb-1 block text-muted-foreground">
                      Select Token
                    </label>
                    <select
                      value={selectedToken}
                      onChange={(e) => setSelectedToken(e.target.value)}
                      className="w-full p-3 rounded-lg border border-border bg-muted text-foreground"
                    >
                      {supportedTokens.map((token) => (
                        <option key={token.symbol} value={token.symbol}>
                          {token.name} ({token.symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm mb-1 block text-muted-foreground">
                      Enter Amount
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.0"
                      className="w-full p-3 rounded-lg border border-border bg-muted text-foreground"
                    />
                  </div>

                  <button
                    onClick={handleInitPDA}
                    className="w-full py-3 px-6 bg-gradient-to-r from-primary to-secondary rounded-lg text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
                  >
                    Send to Initialize
                  </button>
                </div>
              </>
            )
          ) : (
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive text-destructive text-sm">
              Please connect your wallet first
            </div>
          )}

          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-3 px-6 bg-gradient-to-r from-primary to-secondary rounded-lg text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </Modal>
    </>
  );
};

export default WalletQRButton;
