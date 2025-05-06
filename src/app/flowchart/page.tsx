
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

const scenarioDetails: Record<string, { title: string; icon: React.ElementType; mcqs: MCQ[] }> = {
  "Most Probable": { 
    title: "Navigating the Expected", 
    icon: TrendingUp, 
    mcqs: [
      {id: "prob_q1", question: "How would you allocate resources to address this probable challenge?", options: ["Invest heavily in mitigation", "Monitor closely, allocate if worsens", "Accept the risk, focus elsewhere"]},
      {id: "prob_q2", question: "What is your primary communication strategy regarding this challenge?", options: ["Transparent internal and external communication", "Internal communication only", "Minimal communication to avoid panic"]},
      {id: "prob_q3", question: "Which department will lead the response to this challenge?", options: ["Dedicated task force", "Existing operational team", "Senior leadership direct involvement"]},
      {id: "prob_q4", question: "What is an acceptable timeframe to see initial results from your mitigation efforts?", options: ["Within 1 month", "1-3 months", "3-6 months"]},
      {id: "prob_q5", question: "How will you measure the success of your response?", options: ["Key Performance Indicators (KPIs)", "Qualitative feedback", "Market share stability"]},
      {id: "prob_q6", question: "What level of risk are you willing to take with new initiatives to counter this challenge?", options: ["Low risk, proven methods only", "Moderate risk, some innovation", "High risk, potentially disruptive solutions"]},
      {id: "prob_q7", question: "How will you involve your employees in addressing this challenge?", options: ["Top-down directives", "Cross-functional brainstorming sessions", "Suggestion boxes and surveys"]},
      {id: "prob_q8", question: "What is your contingency plan if initial mitigation efforts fail?", options: ["Escalate resource allocation", "Pivot to an alternative strategy", "Seek external consultation"]},
      {id: "prob_q9", question: "How will you leverage existing company strengths to tackle this?", options: ["Focus on core competencies", "Adapt existing products/services", "Utilize strong customer relationships"]},
      {id: "prob_q10", question: "What potential long-term impact does this challenge pose if not addressed effectively?", options: ["Minor operational disruption", "Significant market share loss", "Existential threat to the business"]},
    ]
  },
  "Most Dangerous": { 
    title: "Crisis Averted?", 
    icon: ShieldAlert, 
    mcqs: [
      {id: "danger_q1", question: "What is your immediate priority in this dangerous scenario?", options: ["Contain the damage", "Communicate with stakeholders", "Assess long-term impact"]},
      {id: "danger_q2", question: "Who is authorized to make critical decisions during this crisis?", options: ["CEO only", "Pre-defined crisis management team", "Any senior manager on duty"]},
      {id: "danger_q3", question: "What is your public relations strategy?", options: ["Full transparency immediately", "Controlled information release", "No comment until fully assessed"]},
      {id: "danger_q4", question: "How will you ensure business continuity?", options: ["Activate disaster recovery plan", "Shift operations to alternative sites/methods", "Temporarily halt non-essential operations"]},
      {id: "danger_q5", question: "What resources are immediately available for crisis response?", options: ["Dedicated emergency fund", "Re-allocate existing budget", "Seek emergency funding/loans"]},
      {id: "danger_q6", question: "How will you support affected employees/customers?", options: ["Provide direct assistance and counseling", "Offer compensation/refunds", "Direct them to external support agencies"]},
      {id: "danger_q7", question: "What is the protocol for internal communication during the crisis?", options: ["Regular updates via multiple channels", "Centralized information hub", "Need-to-know basis only"]},
      {id: "danger_q8", question: "How will you learn from this crisis to prevent future occurrences?", options: ["Conduct a thorough post-mortem analysis", "Implement new preventative measures immediately", "Update training and protocols"]},
      {id: "danger_q9", question: "What legal considerations are paramount in this scenario?", options: ["Minimizing liability", "Compliance with regulations", "Protecting intellectual property"]},
      {id: "danger_q10", question: "How do you plan to restore stakeholder confidence post-crisis?", options: ["Demonstrate corrective actions taken", "Launch a reassurance marketing campaign", "Offer incentives for continued loyalty"]},
    ]
  },
  "Best-Case": { 
    title: "Sustaining Success", 
    icon: Award, 
    mcqs: [
      {id: "best_q1", question: "How do you plan to capitalize on this best-case scenario for long-term growth?", options: ["Reinvest profits into R&D", "Expand market reach aggressively", "Strengthen operational efficiencies"]},
      {id: "best_q2", question: "How will you reward the team responsible for this success?", options: ["Monetary bonuses", "Public recognition and awards", "Increased responsibilities and promotions"]},
      {id: "best_q3", question: "What steps will you take to prevent complacency?", options: ["Set new ambitious goals", "Encourage continuous improvement culture", "Introduce controlled disruptions/internal competition"]},
      {id: "best_q4", question: "How will you communicate this success to the market?", options: ["Major PR campaign", "Subtle showcasing in marketing materials", "Focus on customer testimonials"]},
      {id: "best_q5", question: "What is your strategy for talent retention during this growth phase?", options: ["Competitive salaries and benefits", "Enhanced career development opportunities", "Strong company culture and work-life balance"]},
      {id: "best_q6", question: "How will you scale operations to meet increased demand/opportunity?", options: ["Invest in new technology/infrastructure", "Hire and train new staff", "Outsource non-core activities"]},
      {id: "best_q7", question: "What potential new risks emerge from this success (e.g., new competitors)?", options: ["Increased competition", "Overstretching resources", "Loss of focus on core business"]},
      {id: "best_q8", question: "How will you ensure the quality of products/services is maintained or improved?", options: ["Implement stricter quality control processes", "Invest in employee training", "Gather and act on customer feedback"]},
      {id: "best_q9", question: "Do you diversify or double-down on what made this success possible?", options: ["Double-down on core success factors", "Explore related diversification opportunities", "Maintain current strategy, focus on optimization"]},
      {id: "best_q10", question: "What is the long-term vision for the company following this success?", options: ["Market leadership in current niche", "Expansion into new markets/product lines", "Becoming an industry innovator"]},
    ]
  },
  "Wildcard": { 
    title: "The Unexpected Twist", 
    icon: Lightbulb, 
    mcqs: [
      {id: "wild_q1", question: "How does your company adapt to this unforeseen wildcard event?", options: ["Form a task force to analyze", "Pivot strategy quickly", "Seek external expertise"]},
      {id: "wild_q2", question: "What is the first step in understanding the implications of this event?", options: ["Gather all available information", "Brainstorm potential impacts with key team members", "Consult with industry experts"]},
      {id: "wild_q3", question: "How do you assess the opportunities versus threats presented by this event?", options: ["SWOT analysis focused on the new event", "Scenario planning for different outcomes", "Intuitive decision-making by leadership"]},
      {id: "wild_q4", question: "What changes to your business model might be necessary?", options: ["Minor adjustments to current model", "Significant pivot or new revenue streams", "No immediate change, monitor situation"]},
      {id: "wild_q5", question: "How do you communicate this unexpected event and your response to employees?", options: ["Transparently and promptly, explaining the situation", "Gradually, as more information becomes clear", "Only to relevant departments initially"]},
      {id: "wild_q6", question: "What resources (financial, human, technological) can be reallocated to address this?", options: ["Dedicated budget for unforeseen events", "Re-prioritize existing projects and resources", "Explore new funding if necessary"]},
      {id: "wild_q7", question: "How do you maintain morale and focus during a period of uncertainty?", options: ["Strong leadership communication and vision", "Empower employees to contribute to solutions", "Offer flexibility and support"]},
      {id: "wild_q8", question: "What is your timeframe for developing an initial response strategy?", options: ["Within 48 hours", "Within one week", "Within one month"]},
      {id: "wild_q9", question: "How can this wildcard event be turned into a competitive advantage, if at all?", options: ["Identify unique opportunities it creates", "Leverage agility to respond faster than competitors", "Focus on mitigating negative impacts primarily"]},
      {id: "wild_q10", question: "What lessons can be learned to improve resilience against future wildcard events?", options: ["Develop more flexible strategic planning processes", "Invest in horizon scanning and trend analysis", "Build a more adaptable organizational culture"]},
    ]
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
          const scenarioContent: ScenarioOutput = await generateScenario({
            companyDescription: companyInfo.description,
            scenarioType: type,
          });
          setGeneratedScenarioContent(type, scenarioContent); 
          
          const baseScenarioMcqs = scenarioDetails[type].mcqs.map(mcq => ({
            ...mcq,
            // Optionally, add more dynamic elements to MCQs here if needed
            question: `${mcq.question} (Context: ${scenarioContent.scenario.substring(0,100)}...)` 
          }));

          return {
            type,
            title: scenarioDetails[type].title,
            description: scenarioContent.scenario, 
            icon: scenarioDetails[type].icon,
            mcqs: baseScenarioMcqs,
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

