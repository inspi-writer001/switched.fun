import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

// import idl from '../../anchor/target/idl/satoshi_arena.json'
// @ts-ignore
import idl from "../target/idl/switched_fun.json";
// @ts-ignore
import type { SwitchedFun } from "../target/types/switched_fun";
import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

const programId = new PublicKey(idl.address);

let treasury = new PublicKey("4ST8rbRTA9HpJhHgegJwmdM5dCE3KzavXkpPGztmJKwZ"); // TODO treasury for saving fees

// export const getProvider = () => {
//   const connection = new Connection(
//     "https://api.devnet.solana.com",
//     "confirmed"
//   );

//   console.log(window);

//   const wallet = window.solana;
//   if (!wallet) throw new Error("Solana wallet not found");

//   //   const wallet = window.solana as Wallet
//   return new AnchorProvider(connection, wallet, {
//     preflightCommitment: "processed"
//   });
// };

export const getProvider = (
  connection: Connection,
  civicWallet: Wallet | undefined
): AnchorProvider => {
  if (civicWallet == undefined) throw "Invalid Wallet Specified";
  return new AnchorProvider(connection, civicWallet, {
    preflightCommitment: "processed",
  });
};

export const getProgram = (
  connection: Connection,
  civicWallet: Wallet | undefined
) => {
  const provider = getProvider(connection, civicWallet);
  return new Program<SwitchedFun>(idl as any, provider);
};

export async function getOrCreateAssociatedTokenAccountWithProvider(
  provider: AnchorProvider,
  owner: PublicKey,
  mintAddress: PublicKey
) {
  const associatedTokenAddress = await getAssociatedTokenAddress(
    mintAddress,
    owner
  );

  try {
    return await getAccount(provider.connection, associatedTokenAddress);
  } catch {
    const transaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        owner, // payer
        associatedTokenAddress,
        owner,
        mintAddress
      )
    );
    transaction.feePayer = owner;

    await provider.sendAndConfirm(transaction);
    return await getAccount(provider.connection, associatedTokenAddress);
  }
}

export { programId, treasury };
