import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
} from "@solana/spl-token";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  // ── Parse args ─────────────────────────────────────────────
  const [, , recipientArg, amountArg] = process.argv;
  if (!recipientArg || !amountArg) {
    console.error("Usage: ts-node airdrop-usdt.ts <RECIPIENT_PUBKEY> <AMOUNT>");
    process.exit(1);
  }
  const recipientPubkey = new PublicKey(recipientArg);
  const amount = parseFloat(amountArg);
  if (isNaN(amount) || amount <= 0) {
    console.error("Amount must be a positive number");
    process.exit(1);
  }

  // ── 1️⃣ Connect to Devnet ─────────────────────────────────────
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // ── 2️⃣ Load or generate payer ────────────────────────────────
  // You can supply your own keypair via LOCAL_KEYPAIR env, e.g. SOLANA_KEYPAIR
  const payer = process.env.SOLANA_KEYPAIR
    ? Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(process.env.SOLANA_KEYPAIR))
      )
    : Keypair.generate();

  // Airdrop 2 SOL to cover fees (Devnet only)
  const sig = await connection.requestAirdrop(payer.publicKey, 2 * 1e9);
  await connection.confirmTransaction(sig);

  // ── 3️⃣ Create or reuse the USDT-like mint ────────────────────
  // We store the mint address in .env so we can reuse it
  let mintPubkey: PublicKey;
  if (process.env.DEVNET_USDT_MINT) {
    mintPubkey = new PublicKey(process.env.DEVNET_USDT_MINT);
  } else {
    const decimals = 6;
    mintPubkey = await createMint(
      connection,
      payer,
      payer.publicKey,
      null,
      decimals
    );
  }

  // ── 4️⃣ Ensure payer ATA exists ───────────────────────────────
  const payerAta = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mintPubkey,
    payer.publicKey
  );

  // ── 5️⃣ Mint tokens to payer ATA ─────────────────────────────
  const mintAmount = amount * 10 ** 6; // convert to smallest units
  await mintTo(
    connection,
    payer,
    mintPubkey,
    payerAta.address,
    payer.publicKey,
    mintAmount
  );

  // ── 6️⃣ Transfer tokens to recipient ─────────────────────────
  // Create recipient ATA if missing
  const recipientAta = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mintPubkey,
    recipientPubkey
  );

  const tx = await transfer(
    connection,
    payer,
    payerAta.address,
    recipientAta.address,
    payer.publicKey,
    mintAmount
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
