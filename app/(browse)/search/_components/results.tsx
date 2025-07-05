'use client';

import { useSearch } from "@/hooks/use-search";
import { ResultCard, ResultCardSkeleton } from "./result-card";
import { SearchError } from "./search-error";
import { SearchEmpty } from "./search-empty";

interface ResultsProps {
  term?: string;
}

export const Results = ({ term }: ResultsProps) => {
  const { data, isLoading, error, refetch } = useSearch(term || '');

  if (!term) {
    return null;
  }

  if (isLoading) {
    return (
      <div>
        <div className="h-8 w-[290px] mb-4 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {[...Array(4)].map((_, i) => (
            <ResultCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <SearchError error={error as Error} onRetry={() => refetch()} />;
  }

  if (!data || data.length === 0) {
    return <SearchEmpty term={term} />;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 font-sans">
        Results for &quot;{term}&quot; ({data.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {data.map((result) => (
          <ResultCard key={result.id} data={result} />
        ))}
      </div>
    </div>
  );
};

export const ResultsSkeleton = () => {
  return (
    <div>
      <div className="h-8 w-[290px] mb-4 bg-muted animate-pulse rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {[...Array(4)].map((_, i) => (
          <ResultCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};
