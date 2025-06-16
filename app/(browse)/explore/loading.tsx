import { ResultsSkeleton } from "../(home)/_components/results";

const ExploreLoading = () => {
  return (
    <div className="h-full p-8 max-w-screen-2xl mx-auto">
      <div className="space-y-4">
        <div className="h-8 w-[200px] bg-muted animate-pulse rounded" />
        <ResultsSkeleton />
      </div>
    </div>
  );
};

export default ExploreLoading;
