import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SearchErrorProps {
  error: Error;
  onRetry?: () => void;
}

export const SearchError = ({ error, onRetry }: SearchErrorProps) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      <Alert className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error.message || "Something went wrong while searching. Please try again."}
        </AlertDescription>
      </Alert>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}; 