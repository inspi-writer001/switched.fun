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
  console.log("✅ Airdropped 2 SOL to payer:", payer.publicKey.toBase58());

  // ── 3️⃣ Create or reuse the USDT-like mint ────────────────────
  // We store the mint address in .env so we can reuse it
  let mintPubkey: PublicKey;
  if (process.env.DEVNET_USDT_MINT) {
    mintPubkey = new PublicKey(process.env.DEVNET_USDT_MINT);
    console.log("🔄 Reusing existing mint:", mintPubkey.toBase58());
  } else {
    const decimals = 6;
    mintPubkey = await createMint(
      connection,
      payer,
      payer.publicKey,
      null,
      decimals
    );
    console.log("✅ Created new USDT-like mint:", mintPubkey.toBase58());
    console.log("   ▶️  Add this to your .env as DEVNET_USDT_MINT");
  }

  // ── 4️⃣ Ensure payer ATA exists ───────────────────────────────
  const payerAta = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mintPubkey,
    payer.publicKey
  );
  console.log("👉 Payer ATA:", payerAta.address.toBase58());

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
  console.log(`✅ Minted ${amount} USDT to payer ATA`);

  // ── 6️⃣ Transfer tokens to recipient ─────────────────────────
  // Create recipient ATA if missing
  const recipientAta = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mintPubkey,
    recipientPubkey
  );
  console.log("👉 Recipient ATA:", recipientAta.address.toBase58());

  const tx = await transfer(
    connection,
    payer,
    payerAta.address,
    recipientAta.address,
    payer.publicKey,
    mintAmount
  );
  console.log(`✅ Transferred ${amount} USDT to ${recipientPubkey.toBase58()}`);
  console.log("   Tx signature:", tx);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
