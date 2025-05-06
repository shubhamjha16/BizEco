"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext, MCQ } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, BarChart3, TrendingUp, Zap, ShieldAlert, Award, Lightbulb, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { generateScenario } from "@/ai/flows/scenario-generator";
import type { ScenarioOutput } from "@/ai/flows/scenario-generator";

const flowchartMCQs: MCQ[] = [
  {
    id: "focus_validation",
    question: "Does the 'Current Focus' accurately reflect your company's primary strategic goal at this moment?",
    options: ["Yes, perfectly", "Mostly, with minor nuances", "No, it needs adjustment"],
  },
  {
    id: "challenge_validation",
    question: "Are the 'Key Challenges' listed the most critical ones your company is facing right now?",
    options: ["Yes, these are the top priorities", "Partially, there are other significant challenges", "No, the main challenges are different"],
  },
  {
    id: "industry_validation",
    question: "Is the 'Industry' classification appropriate for your company's core business?",
    options: ["Yes, it's accurate", "It's broadly correct, but we operate in a niche", "No, we identify with a different industry"],
  },
];

const scenarioTypes: Array<"Most Probable" | "Most Dangerous" | "Best-Case" | "Wildcard"> = [
  "Most Probable",
  "Most Dangerous",
  "Best-Case",
  "Wildcard",
];

// scenarioDetails will now only store title and icon, MCQs will come from AI
const scenarioUIDetails: Record<string, { title: string; icon: React.ElementType }> = {
  "Most Probable": { 
    title: "Navigating the Expected", 
    icon: TrendingUp, 
  },
  "Most Dangerous": { 
    title: "Crisis Averted?", 
    icon: ShieldAlert, 
  },
  "Best-Case": { 
    title: "Sustaining Success", 
    icon: Award, 
  },
  "Wildcard": { 
    title: "The Unexpected Twist", 
    icon: Lightbulb, 
  },
};


export default function FlowchartPage() {
  const router = useRouter();
  const {
    companyInfo,
    flowchartData,
    mcqAnswers,
    setMcqAnswer,
    setScenarios,
    setIsLoading,
    isLoading,
    setGeneratedScenarioContent,
  } = useAppContext();
  const [validationProgress, setValidationProgress] = useState(0);

  useEffect(() => {
    if (!companyInfo || !flowchartData) {
      router.push("/"); // Redirect if no company info
    }
  }, [companyInfo, flowchartData, router]);

  useEffect(() => {
    const answeredCount = flowchartMCQs.reduce((count, mcq) => mcqAnswers[mcq.id] ? count + 1 : count, 0);
    setValidationProgress((answeredCount / flowchartMCQs.length) * 100);
  }, [mcqAnswers]);

  if (!companyInfo || !flowchartData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading company data or redirecting...</p>
      </div>
    );
  }

  const handleMcqChange = (questionId: string, value: string) => {
    setMcqAnswer(questionId, value);
  };

  const handleSubmit = async () => {
    const answeredRequiredMcqs = flowchartMCQs.every(mcq => mcqAnswers[mcq.id]);
    if (!answeredRequiredMcqs) {
      alert("Please answer all validation questions.");
      return;
    }
    setIsLoading(true);

    try {
      const generatedScenarios = await Promise.all(
        scenarioTypes.map(async (type) => {
          const scenarioOutput: ScenarioOutput = await generateScenario({
            companyDescription: companyInfo.description,
            scenarioType: type,
          });
          setGeneratedScenarioContent(type, scenarioOutput); 
          
          // MCQs are now part of scenarioOutput
          const scenarioMcqs: MCQ[] = scenarioOutput.mcqs.map(mcq => ({
            id: mcq.id,
            question: mcq.question,
            options: mcq.options,
          }));

          return {
            type,
            title: scenarioUIDetails[type].title,
            description: scenarioOutput.scenario, 
            icon: scenarioUIDetails[type].icon,
            mcqs: scenarioMcqs, // Use AI-generated MCQs
          };
        })
      );
      setScenarios(generatedScenarios);
      router.push("/scenarios/0"); 
    } catch (error) {
      console.error("Error generating scenarios:", error);
      alert("Failed to generate scenarios. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const allValidationQuestionsAnswered = flowchartMCQs.every(mcq => mcqAnswers[mcq.id]);

  return (
    <div className="container mx-auto min-h-screen p-4 sm:p-8 flex flex-col items-center">
      <Card className="w-full max-w-4xl shadow-2xl rounded-xl mb-8">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center items-center mb-3">
            <BarChart3 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            Business Profile Overview
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Verify your company's profile. This information will shape your simulation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-secondary/10 rounded-lg shadow-inner">
            <div>
              <h3 className="font-semibold text-lg text-primary mb-1">Company Name</h3>
              <p className="text-foreground">{flowchartData.companyName}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-primary mb-1">Industry</h3>
              <p className="text-foreground">{flowchartData.industry}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-primary mb-1">Current Focus</h3>
              <p className="text-foreground">{flowchartData.currentFocus}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-primary mb-1">Key Challenges</h3>
              <p className="text-foreground">{flowchartData.challenges}</p>
            </div>
          </div>
          
          <Separator className="my-6" />

          <div>
            <h3 className="text-2xl font-semibold mb-4 text-center text-primary">Validate Your Profile</h3>
            <p className="text-muted-foreground text-center mb-6">
              Your answers help tailor the simulation scenarios.
            </p>
            <Progress value={validationProgress} className="w-full mb-6 h-3 rounded-full" />
            <div className="space-y-8">
              {flowchartMCQs.map((mcq) => (
                <Card key={mcq.id} className="shadow-lg rounded-lg">
                  <CardContent className="p-6">
                    <p className="font-medium text-lg mb-4">{mcq.question}</p>
                    <RadioGroup
                      onValueChange={(value) => handleMcqChange(mcq.id, value)}
                      value={mcqAnswers[mcq.id]}
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
                    {mcqAnswers[mcq.id] && (
                       mcqAnswers[mcq.id].includes("No,") || mcqAnswers[mcq.id].includes("different") || mcqAnswers[mcq.id].includes("adjustment") ? (
                        <p className="mt-3 text-sm text-destructive flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" /> This may impact scenario generation. Ensure your initial description is accurate.
                        </p>
                      ) : (
                        <p className="mt-3 text-sm text-green-600 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" /> Confirmed.
                        </p>
                      )
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleSubmit} 
            className="w-full mt-8 text-lg py-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            disabled={!allValidationQuestionsAnswered || isLoading}
          >
            {isLoading ? "Generating Scenarios..." : (
              <>
                Proceed to Scenarios <ChevronRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
           {isLoading && (
            <p className="text-center text-muted-foreground mt-4">
              This may take a moment as we tailor your business simulation...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
