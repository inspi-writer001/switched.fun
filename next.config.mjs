import { createCivicAuthPlugin } from "@civic/auth-web3/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["utfs.io"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bqev70kfmw.ufs.sh"
      }
    ]
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto"
    });
    config.externals["@solana/web3.js"] = "commonjs @solana/web3.js";
    config.externals["@solana/spl-token"] = "commonjs @solana/spl-token";

    return config;
  }
};

const withCivicAuth = createCivicAuthPlugin({
  clientId: process.env.NEXT_PUBLIC_CIVIC_CLIENT_ID ?? ""
});

// Change this line from module.exports to export default
export default withCivicAuth(nextConfig);
