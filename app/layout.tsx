import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { CivicAuthProvider } from "@civic/auth-web3/nextjs";
import CreateWallet from "@/components/civic/create-wallet";
import Providers from "@/provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Switched",
  description: "Be rewarded for streaming",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} id="root">
        <ThemeProvider
          attribute="class"
          forcedTheme="dark"
          storageKey="gamehub-theme"
        >
          <Toaster theme="light" position="top-right" />
          <CivicAuthProvider>
            <Providers>
              {children}
            </Providers>
            <CreateWallet />
          </CivicAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
