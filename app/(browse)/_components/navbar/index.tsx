import { Logo } from "./logo";
import { Search } from "./search";
import { Actions } from "./actions";
import { getSelf } from "@/lib/auth-service";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

export const Navbar = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["currentUser"],
    queryFn: () => getSelf(),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <nav className="fixed top-0 w-full h-20 z-[49] bg-background px-2 lg:px-4 flex justify-between items-center border-b border-b-gray-900">
        <Logo />
        <Search />
        <div className="flex items-center gap-2">
          <Actions />
        </div>
      </nav>
    </HydrationBoundary>
  );
};
