"use client";

import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import QRCode from "react-qr-code";
import { userHasWallet } from "@civic/auth-web3";
import { useUser } from "@civic/auth-web3/react";
import { Copy, Wallet } from "lucide-react";
import { toast } from "sonner"; // Import Sonner toast
import { Button } from "../ui/button";

interface WalletQRButtonProps {
  tokenMint?: string;
}

export const WalletQRButton: React.FC<WalletQRButtonProps> = ({
  tokenMint,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const userContext = useUser();
  const hasWallet = userHasWallet(userContext);
  const address = hasWallet ? userContext.solana.address : "";
  const uri = address
    ? `${address}${tokenMint ? `?spl-token=${tokenMint}` : ""}`
    : "";

  useEffect(() => {
    Modal.setAppElement("body");
  }, []);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(uri)
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
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          },
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
            padding: "8px 16px",
          },
        });
      });
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        disabled={!hasWallet}
        variant="primary"
        size="sm"
      >
        <span className="flex items-center gap-x-1">
          💰 <span>Tip Me</span>
        </span>
      </Button>

      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        contentLabel="Wallet QR Code"
        style={{
          overlay: {
            backgroundColor: "hsl(var(--background) / 0.9)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
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
            boxShadow: "0 12px 24px hsl(var(--background) / 0.25)",
          },
        }}
      >
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl gradient-text mb-2">Wallet Address</h2>
            <p className="text-muted-foreground text-sm">
              Scan or copy your wallet QR code
            </p>
          </div>

          {hasWallet ? (
            <>
              <div className="relative p-4 bg-card rounded-xl border border-border card-hover">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10" />
                <QRCode
                  value={uri}
                  size={256}
                  className="relative z-10 mx-auto"
                  bgColor="hsl(var(--card))"
                  fgColor="hsl(var(--card-foreground))"
                />
              </div>

              <div className="group relative">
                <div className="block p-3 pr-12 bg-muted rounded-lg text-sm transition-colors truncate font-mono text-muted-foreground">
                  {uri}
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
