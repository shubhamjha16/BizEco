
"use client"; 

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      <AlertTriangle className="h-16 w-16 text-destructive mb-6" />
      <h2 className="text-3xl font-bold text-destructive mb-4">
        Oops! Something went wrong.
      </h2>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        We encountered an unexpected issue. Please try again. If the problem persists, you might want to restart the simulation.
      </p>
      <pre className="mb-6 p-4 bg-muted rounded-md text-sm text-muted-foreground overflow-auto max-w-full text-left">
        {error.message}
        {error.digest && `\nDigest: ${error.digest}`}
      </pre>
      <div className="space-x-4">
        <Button
          onClick={() => reset()}
          variant="outline"
          className="text-lg py-3 px-6"
        >
          Try Again
        </Button>
        <Button
          onClick={() => window.location.href = '/'} // Fallback to home
          className="text-lg py-3 px-6"
        >
          Restart Simulation
        </Button>
      </div>
    </div>
  );
}
