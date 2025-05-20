import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { CivicAuthProvider } from "@civic/auth-web3/nextjs";
import CreateWallet from "@/components/civic/create-wallet";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "switched.fun",
  description: "Livestream And Get Fan Rewards",
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
          <Toaster theme="light" position="bottom-center" />
          <CivicAuthProvider>
            {children}
            <CreateWallet />
          </CivicAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
