// truncate wallet address
export const truncateWalletAddress = (address: string) => {
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
};

// format balance
export const formatBalance = (balance: number) => {
  return balance.toFixed(2);
};