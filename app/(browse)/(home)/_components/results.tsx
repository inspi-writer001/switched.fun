"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { ResultCard, ResultCardSkeleton } from "./result-card";
import { useStreamsInfinite } from "@/hooks/use-streams";
import { useRef, useCallback } from "react";

export const Results = () => {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useStreamsInfinite(12);

  const observerRef = useRef<IntersectionObserver | null>(null);

  // Flatten all pages into a single array
  const allStreams = data?.pages.flat() || [];

  // Intersection Observer for infinite scroll
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading || isFetchingNextPage) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

  if (isLoading && allStreams.length === 0) {
    return <ResultsSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load streams. Please try again.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-sm md:text-lg font-semibold mb-4 font-sans">
        Streams we think you&apos;ll like
      </h2>
      
      {allStreams.length === 0 && !isLoading && (
        <div className="text-muted-foreground text-sm">
          No streams found.
        </div>
      )}

      {allStreams.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {allStreams.map((stream, index) => {
            // Add ref to last element for intersection observer
            if (allStreams.length === index + 1) {
              return (
                <div key={stream.id} ref={lastElementRef}>
                  <ResultCard data={stream} />
                </div>
              );
            }
            return <ResultCard key={stream.id} data={stream} />;
          })}
        </div>
      )}

      {/* Loading indicator for next page */}
      {isFetchingNextPage && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {[...Array(6)].map((_, i) => (
            <ResultCardSkeleton key={`loading-${i}`} />
          ))}
        </div>
      )}
    </div>
  );
};

export const ResultsSkeleton = () => {
  return (
    <div>
      <Skeleton className="h-8 w-[290px] mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {[...Array(8)].map((_, i) => (
          <ResultCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};
