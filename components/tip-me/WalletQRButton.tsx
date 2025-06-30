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
  getProvider,
} from "@/utils/program";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";
import {
  getMint,
  getOrCreateAssociatedTokenAccount,
  getAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
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
    contractAddress: "6mWfrWzYf5ot4S8Bti5SCDRnZWA5ABPH1SNkSq4mNN1C",
  },
  {
    name: "USDT",
    symbol: "usdt",
    contractAddress: "6mWfrWzYf5ot4S8Bti5SCDRnZWA5ABPH1SNkSq4mNN1C",
  },
];

export const WalletQRButton: React.FC<WalletQRButtonProps> = ({
  tokenMint,
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
  const [depositAddress, setDepositAddress] = useState<string>("");
  const [initLoading, setInitLoading] = useState(false);

  // SPL balance state
  const [balLoading, setBalLoading] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [balError, setBalError] = useState<string | null>(null);

  const program = getProgram(connection, wallet as unknown as Wallet);
  const provider = getProvider(connection, wallet as unknown as Wallet);

  // 4️⃣ Build Solana Pay URI
  const uri = address
    ? `solana:${address}`
    : ""; /* :contentReference[oaicite:14]{index=14} */

  // Function to handle copy with toast notification
  const handleCopyAddress = () => {
    if (!address) return;

    navigator.clipboard
      .writeText(address)
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

  const handleInitPDA = async () => {
    console.log("Init PDA with", selectedToken, amount);
    setInitLoading(true);

    try {
      // 1️⃣ Resolve token mint
      const token_mint = supportedTokens.find(
        (e) => (e.symbol = selectedToken)
      )?.contractAddress;

      if (!token_mint || !address || !solAddress) {
        throw new Error("Wallet not connected");
      }

      // 2️⃣ Fetch mint decimals
      const mintInfo = await getMint(connection, new PublicKey(token_mint));
      const decimals = mintInfo.decimals;

      // const amount = 3.3;
      // 3️⃣ Compute lamports
      const lamports = Number(amount) * 10 ** decimals;
      if (lamports <= 0) {
        throw new Error("Amount must be greater than zero");
      }

      // 4️⃣ Ensure associated token account
      const tokenAccount = await getOrCreateAssociatedTokenAccountWithProvider(
        provider,
        new PublicKey(address),
        new PublicKey(token_mint)
      );
      console.log("new_token_account", tokenAccount.address.toBase58());

      // 5️⃣ Send the tipUser transaction
      const tx = await program.methods
        .tipUser(new BN(lamports))
        .accounts({
          recipient: new PublicKey(address),
          tipper: new PublicKey(solAddress),
          tipperTokenAccount: tokenAccount.address.toBase58(),
          tokenMint: token_mint,
        })
        .signers([])
        .rpc();

      console.log("Transaction signature", tx);
      toast.success(`Tip sent! Tx: ${tx}`, { duration: 5000 });
    } catch (err: any) {
      console.error("handleInitPDA error", err);
      toast.error(`Failed to send tip: ${err.message}`, { duration: 5000 });
    } finally {
      setInitLoading(false);
    }
  };

  // fetch SPL token balance (derivation only—no ATA creation/signing)
  useEffect(() => {
    if (!hasWallet || !solAddress) return;

    const fetchSplBalance = async () => {
      setBalLoading(true);
      setBalError(null);

      try {
        // 1️⃣ Fetch SOL balance
        const solLamports = await connection.getBalance(
          new PublicKey(solAddress)
        );
        console.log("SOL Balance:", solLamports / LAMPORTS_PER_SOL);

        // 2️⃣ Find the mint & derive the ATA address (no on-chain Tx)
        const info = supportedTokens.find((t) => t.symbol === selectedToken);
        if (!info) throw new Error("Unsupported token");
        const mintPk = new PublicKey(info.contractAddress);

        // derive the ATA address only:
        const ataAddress = await getAssociatedTokenAddress(
          mintPk,
          new PublicKey(solAddress)
        );
        setDepositAddress(ataAddress.toBase58());

        // 3️⃣ Try to fetch its balance if the account exists
        let uiAmt = 0;
        try {
          const acct = await getAccount(connection, ataAddress);
          const mintInfo = await getMint(connection, mintPk);
          uiAmt = Number(acct.amount) / 10 ** mintInfo.decimals;
          console.log(
            `${info.symbol.toUpperCase()} Balance:`,
            uiAmt,
            `(decimals: ${mintInfo.decimals})`
          );
        } catch {
          // account doesn't exist ⇒ zero balance
          console.log(`${info.symbol} ATA not found, balance = 0`);
        }

        setTokenBalance(uiAmt);
      } catch (err: any) {
        console.error("Failed to fetch SPL balance", err);
        setBalError("Unable to load balance");
        setTokenBalance(0);
      } finally {
        setBalLoading(false);
      }
    };

    fetchSplBalance();
  }, []);

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
      const recipientStateAccount =
        await program.account.userAccount.fetch(recipientStatePDA);
      setIsPDAInit(true);
      console.log("Recipient State Data:", recipientStateAccount);
    } catch (err) {
      setIsPDAInit(false);
    }
  };

  let buttonLabel = "Connect Wallet";
  if (hasWallet) {
    if (balLoading || tokenBalance === null) {
      buttonLabel = "Loading…";
    } else if (tokenBalance <= 0) {
      buttonLabel = "Fund Wallet";
    } else {
      // user has tokens
      buttonLabel = isPDAInit ? "💰Tip Me" : "Initialize Wallet";
    }
  }

  useEffect(() => {
    Modal.setAppElement("body");
    fetchUserProgramWallet();
  }, []);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        disabled={!hasWallet || balLoading}
        variant="primary"
        size="sm"
      >
        {buttonLabel}
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
            <h2 className="text-2xl font-semibold">
              {buttonLabel === "Fund Wallet"
                ? `Fund ${selectedToken.toUpperCase()} Wallet`
                : isPDAInit
                  ? "Your Wallet Address"
                  : "Initialize Wallet"}
            </h2>
            <p className="text-sm text-gray-500">
              {buttonLabel === "Fund Wallet"
                ? `Scan to deposit ${selectedToken.toUpperCase()}`
                : isPDAInit
                  ? "Scan or copy your PDA QR code"
                  : "Select token & amount to initialize"}
            </p>
          </div>

          {/* Fund Wallet UI */}
          {/* Tip Me / PDA flow */}
          {hasWallet && !isPDAInit && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 rounded flex justify-center items-center border">
                <QRCode
                  value={uri}
                  size={256}
                  className="relative z-10 mx-auto"
                  bgColor="hsl(var(--card))"
                  fgColor="hsl(var(--card-foreground))"
                />
              </div>
              <div className="relative">
                <div className="p-3 bg-slate-900 text-white rounded font-mono truncate">
                  {address}
                </div>
                <button
                  onClick={handleCopyAddress} // Updated to use the new handler
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Initialize flow */}
          {hasWallet && isPDAInit && (
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
                disabled={balLoading || tokenBalance <= 0 || initLoading}
                className="w-full py-3 px-6 bg-slate-900 text-white rounded-lg text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                {initLoading ? "Initializing…" : "Send to Initialize"}
              </button>
            </div>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-3 px-6 bg-slate-900 text-white rounded-lg text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </Modal>
    </>
  );
};

export default WalletQRButton;
