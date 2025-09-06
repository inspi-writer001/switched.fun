// "use client";
// import { useState } from "react";
import { Suspense } from "react";

import { Navbar } from "./_components/navbar";
import { Container } from "./_components/container";
import { Sidebar, SidebarSkeleton } from "./_components/sidebar";
import { Button } from "@/components/ui/button";
// import { useUser } from "@civic/auth-web3/react";
import { getUser } from "@civic/auth-web3/nextjs";
import { BottomAuthPrompt } from "./_components/bottom-auth-prompt";
// import { useSelf } from "@/hooks/use-self";

const BrowseLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getUser();

  return (
    <>
      <Navbar />

      <div className="flex h-full pt-20">
        <Suspense fallback={<SidebarSkeleton />}>
          <Sidebar />
        </Suspense>

        <Container>{children}</Container>
      </div>

      {!user && (
        <BottomAuthPrompt />
      )}
    </>
  );
};

export default BrowseLayout;
