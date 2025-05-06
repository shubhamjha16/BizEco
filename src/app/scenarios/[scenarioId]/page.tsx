
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppContext, MCQ as McqType } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { generateReport } from '@/ai/flows/report-generation'; // Assuming this is the correct path

export default function ScenarioPage() {
  const router = useRouter();
  const params = useParams();
  const scenarioId = Array.isArray(params.scenarioId) ? params.scenarioId[0] : params.scenarioId;
  
  const {
    companyInfo,
    scenarios,
    currentScenarioIndex,
    setCurrentScenarioIndex,
    scenarioDecisions,
    setScenarioDecision,
    addScenarioOutcome,
    scenarioOutcomes,
    setFinalReport,
    setIsLoading,
    isLoading,
    generatedScenariosContent
  } = useAppContext();

  const [currentMcqAnswers, setCurrentMcqAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!companyInfo) {
      router.push("/"); // Redirect if no company info
      return;
    }
    if (scenarios.length === 0) {
      router.push("/flowchart"); // Redirect if scenarios not loaded
      return;
    }
    const id = parseInt(scenarioId, 10);
    if (isNaN(id) || id < 0 || id >= scenarios.length) {
      router.push("/scenarios/0"); // redirect to first scenario if ID is invalid
      return;
    }
    if(id !== currentScenarioIndex) {
      setCurrentScenarioIndex(id);
    }
  }, [companyInfo, scenarios, router, scenarioId, currentScenarioIndex, setCurrentScenarioIndex]);


  const currentScenario = scenarios[currentScenarioIndex];

  useEffect(() => {
    if (currentScenario) {
      setCurrentMcqAnswers(scenarioDecisions[currentScenario.type] || {});
    }
  }, [currentScenario, scenarioDecisions]);


  if (!currentScenario || !companyInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading scenario...</p>
      </div>
    );
  }

  const handleMcqChange = (mcqId: string, value: string) => {
    setCurrentMcqAnswers((prev) => ({ ...prev, [mcqId]: value }));
    setScenarioDecision(currentScenario.type, mcqId, value);
  };

  const allMcqsAnswered = currentScenario.mcqs.every(mcq => currentMcqAnswers[mcq.id]);
  const progressPercentage = ((currentScenarioIndex + 1) / scenarios.length) * 100;

  // Dummy evaluation logic, replace with AI call
  const getEvaluationForScenario = (scenarioType: string, decisions: Record<string, string>): string => {
    // In a real app, this would call an AI model
    // For now, a simple placeholder
    const decisionSummary = Object.entries(decisions)
      .map(([key, value]) => `For ${key}, you chose: ${value}.`)
      .join(' ');
    return `Based on your decisions for the ${scenarioType} scenario (${decisionSummary}), your approach shows potential. Consider refining your risk assessment for future challenges. More detailed feedback would typically be AI-generated.`;
  };

  const handleNext = async () => {
    if (!allMcqsAnswered) {
      alert("Please answer all questions for this scenario.");
      return;
    }

    setIsLoading(true);
    // Simulate AI evaluation for the current scenario's decisions
    const evaluation = getEvaluationForScenario(currentScenario.type, currentMcqAnswers);

    addScenarioOutcome({
      scenarioType: currentScenario.type,
      userDecisions: currentMcqAnswers,
      evaluation: evaluation, // This would be AI-generated
    });
    
    if (currentScenarioIndex < scenarios.length - 1) {
      router.push(`/scenarios/${currentScenarioIndex + 1}`);
    } else {
      // All scenarios completed, generate final report
      try {
        const reportInput = {
          companyDescription: companyInfo.description,
          scenarioOutcomes: [...scenarioOutcomes, { // Add the last outcome
            scenarioType: currentScenario.type,
            userDecisions: currentMcqAnswers,
            evaluation: evaluation,
          }],
        };
        const reportData = await generateReport(reportInput);
        setFinalReport(reportData.report);
        router.push("/report");
      } catch (error) {
        console.error("Error generating final report:", error);
        alert("Failed to generate the final report. Please try again.");
      }
    }
    setIsLoading(false);
  };

  const handlePrevious = () => {
    if (currentScenarioIndex > 0) {
      router.push(`/scenarios/${currentScenarioIndex - 1}`);
    }
  };
  
  const ScenarioIcon = currentScenario.icon;

  return (
    <div className="container mx-auto min-h-screen p-4 sm:p-8 flex flex-col items-center">
      <Card className="w-full max-w-3xl shadow-2xl rounded-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center items-center mb-3">
            <ScenarioIcon className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">{currentScenario.title}
            <span className="ml-2 text-sm font-normal text-muted-foreground">(Scenario {currentScenarioIndex + 1} of {scenarios.length})</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-1">
            {currentScenario.type} Scenario
          </CardDescription>
          <Progress value={progressPercentage} className="w-full mt-4 h-3 rounded-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-secondary/10 p-6 rounded-lg shadow-inner">
            <h3 className="text-xl font-semibold text-primary mb-2">Scenario Details</h3>
            <p className="text-foreground whitespace-pre-line leading-relaxed">
              {generatedScenariosContent[currentScenario.type]?.scenario || currentScenario.description}
            </p>
          </Card>

          <div>
            <h3 className="text-2xl font-semibold mb-4 text-center text-primary">Your Decisions</h3>
            <div className="space-y-8">
              {currentScenario.mcqs.map((mcq) => (
                <Card key={mcq.id} className="shadow-lg rounded-lg">
                  <CardContent className="p-6">
                    <Label className="font-medium text-lg mb-4 flex items-center">
                      {mcq.question}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Consider the implications of each choice on your company's profile.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <RadioGroup
                      onValueChange={(value) => handleMcqChange(mcq.id, value)}
                      value={currentMcqAnswers[mcq.id]}
                      className="space-y-2"
                    >
                      {mcq.options.map((option, idx) => (
                        <div key={idx} className="flex items-center space-x-3 p-3 bg-background hover:bg-muted rounded-md transition-colors">
                          <RadioGroupItem value={option} id={`${mcq.id}-option-${idx}`} />
                          <Label htmlFor={`${mcq.id}-option-${idx}`} className="text-base cursor-pointer flex-1">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {currentMcqAnswers[mcq.id] && (
                      <p className="mt-3 text-sm text-green-600 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" /> Your choice: {currentMcqAnswers[mcq.id]}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <Button 
              onClick={handlePrevious} 
              variant="outline" 
              className="text-lg py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              disabled={currentScenarioIndex === 0 || isLoading}
            >
              <ChevronLeft className="mr-2 h-5 w-5" /> Previous
            </Button>
            <Button 
              onClick={handleNext} 
              className="text-lg py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              disabled={!allMcqsAnswered || isLoading}
            >
              {isLoading ? (currentScenarioIndex < scenarios.length - 1 ? "Processing..." : "Generating Report...") : 
                (currentScenarioIndex < scenarios.length - 1 ? "Next Scenario" : "Finish & View Report")} 
              { !isLoading && <ChevronRight className="ml-2 h-5 w-5" />}
            </Button>
          </div>
          {isLoading && (
            <p className="text-center text-muted-foreground mt-4">
              {currentScenarioIndex < scenarios.length - 1 ? "Analyzing your decisions and preparing the next scenario..." : "Compiling your final report..."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
