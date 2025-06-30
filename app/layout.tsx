import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { CivicAuthProvider } from "@civic/auth-web3/nextjs";
import CreateWallet from "@/components/civic/create-wallet";
import { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

interface CreatorLayoutProps {
  params: { username: string };
  children: ReactNode;
}

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
            {children}
            <CreateWallet />
          </CivicAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
