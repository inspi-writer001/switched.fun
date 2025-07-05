import { Results } from "../(home)/_components/results";

const ExplorePage = async () => {
  return (
    <div className="h-full p-8 max-w-screen-2xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Explore Streams</h1>
        <Results />
      </div>
    </div>
  );
};

export default ExplorePage;
