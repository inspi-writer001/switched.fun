import { Connection } from "@solana/web3.js";

export const supportedTokens = {
  name: "USDC",
  symbol: "usdc",
  contractAddress: "2o39Cm7hzaXmm9zGGGsa5ZiveJ93oMC2D6U7wfsREcCo",
  decimals: 6,
};

export const connection = new Connection(process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com", "confirmed");