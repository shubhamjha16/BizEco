
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DollarSign, BarChart2, Briefcase, ClipboardList, FileText, Lightbulb, TrendingUp, ShieldAlert } from "lucide-react"; // Changed Award to DollarSign
import Image from 'next/image';

const scenarioIconsMap: { [key: string]: React.ElementType } = {
  "Most Probable": TrendingUp,
  "Most Dangerous": ShieldAlert,
  "Best-Case": DollarSign, // Changed Award to DollarSign
  "Wildcard": Lightbulb,
};


export default function ReportPage() {
  const router = useRouter();
  const { companyInfo, finalReport, scenarioOutcomes, isLoading, setIsLoading, resetSimulation } = useAppContext();

  useEffect(() => {
    if (!companyInfo) {
      router.push("/"); 
    }
    if (!finalReport && !isLoading) {
        console.warn("Report page accessed without a generated report.");
    }
  }, [companyInfo, finalReport, router, isLoading]);

  const handleRestart = () => {
    setIsLoading(true);
    resetSimulation(); 
    router.push("/");
    // setIsLoading(false); // setLoading(false) is handled in resetSimulation or can be set here if needed after navigation
  };

  if (isLoading && !finalReport) { // Show loading only if report is being generated
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <FileText className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-xl text-muted-foreground">Generating your comprehensive report...</p>
        </div>
      </div>
    );
  }

  if (!finalReport) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 flex-col">
         <Image src="https://picsum.photos/400/300?grayscale" alt="No report available" width={400} height={300} className="rounded-lg mb-6 shadow-lg" data-ai-hint="empty report"/>
        <p className="text-xl text-muted-foreground mb-6">No report data available. Please complete the simulation.</p>
        <Button onClick={handleRestart} className="text-lg py-3 px-6">
          Start New Simulation
        </Button>
      </div>
    );
  }


  return (
    <div className="container mx-auto min-h-screen p-4 sm:p-8">
      <Card className="w-full max-w-4xl mx-auto shadow-2xl rounded-xl">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center items-center mb-4">
            <ClipboardList className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            BizEco Final Report
          </CardTitle>
          {companyInfo && (
            <CardDescription className="text-lg text-muted-foreground mt-2">
              Analysis for: <span className="font-semibold text-primary">{companyInfo.name}</span>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-8">
          <Card className="bg-secondary/10 p-6 rounded-lg shadow-inner">
            <h3 className="text-2xl font-semibold text-primary mb-3 flex items-center">
              <FileText className="h-7 w-7 mr-3" /> Executive Summary
            </h3>
            <ScrollArea className="h-[200px] pr-4">
              <p className="text-foreground whitespace-pre-line leading-relaxed text-justify">
                {finalReport}
              </p>
            </ScrollArea>
          </Card>

          <Separator />

          <div>
            <h3 className="text-2xl font-semibold text-primary mb-6 text-center flex items-center justify-center">
              <BarChart2 className="h-7 w-7 mr-3" /> Scenario Breakdown & Insights
            </h3>
            <div className="space-y-6">
              {scenarioOutcomes.map((outcome, index) => {
                const IconComponent = scenarioIconsMap[outcome.scenarioType] || Briefcase;
                return (
                  <Card key={index} className="shadow-lg rounded-lg overflow-hidden">
                    <CardHeader className="bg-muted/50 p-4">
                      <CardTitle className="text-xl flex items-center">
                        <IconComponent className="h-6 w-6 mr-3 text-accent" />
                        {outcome.scenarioType} Scenario
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <h4 className="font-semibold text-md text-foreground mb-1">Your Decisions:</h4>
                        <ScrollArea className="h-auto max-h-32 pr-2"> {/* Added ScrollArea for decisions */}
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-2">
                            {Object.entries(outcome.userDecisions).map(([mcqId, decision]) => (
                              <li key={mcqId}>
                                <span className="font-medium">{mcqId.replace(/_(q\d+)$/, '')}:</span> {decision}
                              </li>
                            ))}
                          </ul>
                        </ScrollArea>
                      </div>
                      <div>
                        <h4 className="font-semibold text-md text-foreground mb-1">Evaluation & Insights:</h4>
                         <ScrollArea className="h-auto max-h-48 pr-2"> {/* Added ScrollArea for evaluation */}
                          <p className="text-sm text-muted-foreground whitespace-pre-line leading-normal">
                            {outcome.evaluation}
                          </p>
                        </ScrollArea>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
          
          <Separator className="my-8" />

          <div className="text-center">
            <Button onClick={handleRestart} className="text-lg py-4 px-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-accent hover:bg-accent/90 text-accent-foreground">
              Start New Simulation
            </Button>
          </div>
        </CardContent>
      </Card>
       <footer className="text-center mt-12 mb-6">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} BizEco. All rights reserved.</p>
      </footer>
    </div>
  );
}
