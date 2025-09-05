// "use client";
// import { useState } from "react";
import { Suspense } from "react";

import { Navbar } from "./_components/navbar";
import { Container } from "./_components/container";
import { Sidebar, SidebarSkeleton } from "./_components/sidebar";
import { Button } from "@/components/ui/button";
import { useUser } from "@civic/auth-web3/react";
import { getUser } from "@civic/auth-web3/nextjs";
// import { useSelf } from "@/hooks/use-self";

const BrowseLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getUser();
  // const { signIn } = useUser();

  // const [loading, setLoading] = useState(false);

  // const { data: currentUser, isLoading, isError, refetch } = useSelf();

  // async function handleLogin() {
  //   setLoading(true);
  //   try {
  //     await signIn();
  //     refetch();
  //   } catch (error) {
  //     console.error("Error signing in:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }

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
        <div className="fixed bottom-0 w-full py-2 px-4 bg-primary z-50">
          <div className="flex items-center justify-between h-full">
            <p className="text-gray-100">
              Sign in to experience the best of{" "}
              <span className="font-bold text-white">Switched</span>
            </p>

            <Button
              // onClick={handleLogin}
              // disabled={loading}
              variant="secondary"
              className="bg-white text-primary px-8"
            >
              Login
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default BrowseLayout;
