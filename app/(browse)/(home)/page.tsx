import { Suspense } from "react";

import { Results, ResultsSkeleton } from "./_components/results";
import Landing from "../Landing/page";

export default function Page() {
  return (
    <>
      <Landing />
      <div className="h-full p-8 max-w-screen-2xl mx-auto">
        <Suspense fallback={<ResultsSkeleton />}>
          <Results />
        </Suspense>
      </div>
    </>
  );
};
