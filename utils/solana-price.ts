interface JupiterPriceResponse {
  [mintAddress: string]: {
    priceChange24h: number;
    decimals: number;
    blockId: number;
    usdPrice: number;
  };
}

interface SolanaPriceData {
  price: number;
  lastUpdated: Date;
}

/**
 * Fetch current Solana price from Jupiter API
 * @returns Promise<SolanaPriceData>
 */
export async function fetchSolanaPrice(): Promise<SolanaPriceData> {
  try {
    // SOL mint address and USDC mint address
    const SOL_MINT = "So11111111111111111111111111111111111111112";
    const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

    const response = await await fetch(
      `https://lite-api.jup.ag/price/v3?ids=${SOL_MINT},${USDC_MINT}`
    );

    if (!response.ok) {
      throw new Error(`Jupiter API error: ${response.status}`);
    }

    const data: JupiterPriceResponse = await response.json();

    console.log("data", data);

    if (!data[SOL_MINT]) {
      throw new Error("Invalid response from Jupiter API");
    }

    return {
      price: data[SOL_MINT].usdPrice,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error("[fetchSolanaPrice] error:", error);

    // Return a fallback price if API fails
    return {
      price: 100, // Fallback price
      lastUpdated: new Date(),
    };
  }
}

/**
 * Fetch Solana price with caching
 * @param cacheTime - Cache time in milliseconds (default: 30 seconds)
 * @returns Promise<SolanaPriceData>
 */
export async function fetchSolanaPriceCached(
  cacheTime: number = 30 * 1000
): Promise<SolanaPriceData> {
  const cacheKey = "solana-price";
  const cached = sessionStorage.getItem(cacheKey);

  if (cached) {
    const parsed = JSON.parse(cached);
    const lastUpdated = new Date(parsed.lastUpdated);

    // Check if cache is still valid
    if (Date.now() - lastUpdated.getTime() < cacheTime) {
      return {
        ...parsed,
        lastUpdated,
      };
    }
  }

  // Fetch fresh data
  const priceData = await fetchSolanaPrice();

  // Cache the result
  sessionStorage.setItem(cacheKey, JSON.stringify(priceData));

  return priceData;
}

/**
 * Convert USDC amount to USD using current Solana price
 * @param usdcAmount - Amount in USDC (assuming 1 USDC = 1 USD)
 * @returns Promise<number> - USD equivalent
 */
export async function convertUsdcToUsd(usdcAmount: number): Promise<number> {
  // USDC is pegged to USD, so 1 USDC = 1 USD
  return usdcAmount;
}

/**
 * Convert SOL amount to USD using current Solana price
 * @param solAmount - Amount in SOL
 * @returns Promise<number> - USD equivalent
 */
export async function convertSolToUsd(solAmount: number): Promise<number> {
  const solPrice = await fetchSolanaPriceCached();
  return solAmount * solPrice.price;
}

/**
 * Convert USD amount to SOL using current Solana price
 * @param usdAmount - Amount in USD
 * @returns Promise<number> - SOL equivalent
 */
export async function convertUsdToSol(usdAmount: number): Promise<number> {
  const solPrice = await fetchSolanaPriceCached();
  return usdAmount / solPrice.price;
}
