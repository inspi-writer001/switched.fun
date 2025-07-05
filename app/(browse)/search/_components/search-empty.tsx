import { Search } from "lucide-react";

interface SearchEmptyProps {
  term: string;
}

export const SearchEmpty = ({ term }: SearchEmptyProps) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">No results found</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          We couldn't find any users matching &quot;{term}&quot;. Try searching with different keywords or check your spelling.
        </p>
      </div>
    </div>
  );
}; 