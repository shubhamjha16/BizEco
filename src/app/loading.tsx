
import { Skeleton } from "@/components/ui/skeleton";
import { BrainCircuit } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="flex items-center space-x-4 mb-8">
        <BrainCircuit className="h-12 w-12 text-primary animate-pulse" />
        <h1 className="text-3xl font-bold text-primary">BizEco</h1>
      </div>
      <div className="w-full max-w-md space-y-6">
        <Skeleton className="h-24 w-full rounded-lg" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-3/4 rounded-md" />
          <Skeleton className="h-6 w-full rounded-md" />
          <Skeleton className="h-6 w-5/6 rounded-md" />
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
      <p className="mt-8 text-muted-foreground">Loading your business simulation...</p>
    </div>
  );
}
