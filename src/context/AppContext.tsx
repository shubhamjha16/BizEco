
"use client";

// ScenarioOutput now includes MCQs directly from the AI
import type { ScenarioOutput } from "@/ai/flows/scenario-generator"; 
import React, { createContext, useContext, useState, ReactNode } from "react";

interface CompanyInfo {
  description: string;
  name: string;
  industry: string;
  focus: string;
  challenges: string;
}

interface FlowchartData {
  companyName: string;
  industry: string;
  currentFocus: string;
  challenges: string;
}

export interface MCQ {
  question: string;
  options: string[];
  correctAnswer?: string; // Optional: for scenarios where there's a "best" answer
  id: string; // Unique ID for each MCQ
}

export interface Scenario {
  type: "Most Probable" | "Most Dangerous" | "Best-Case" | "Wildcard";
  title: string;
  description: string; // This is the AI-generated scenario text
  mcqs: MCQ[]; // These are now AI-generated MCQs
  icon: React.ElementType;
}

export interface ScenarioOutcome {
  scenarioType: string;
  userDecisions: Record<string, string>; // MCQ id -> selected answer
  evaluation: string; // AI-generated evaluation for this scenario
}


interface AppContextType {
  companyInfo: CompanyInfo | null;
  setCompanyInfo: (info: CompanyInfo) => void;
  flowchartData: FlowchartData | null;
  setFlowchartData: (data: FlowchartData) => void;
  mcqAnswers: Record<string, string>; // For flowchart validation MCQs: questionId -> answer
  setMcqAnswer: (questionId: string, answer: string) => void;
  clearMcqAnswers: () => void; // To reset flowchart answers
  flowchartValidationMcqs: MCQ[]; // New state for dynamic validation MCQs
  setFlowchartValidationMcqs: (mcqs: MCQ[]) => void; // Setter for dynamic MCQs
  currentScenarioIndex: number;
  setCurrentScenarioIndex: (index: number) => void;
  scenarios: Scenario[]; 
  setScenarios: (scenarios: Scenario[]) => void;
  scenarioDecisions: Record<string, Record<string, string>>; // scenarioType -> { mcqId -> answer }
  setScenarioDecision: (scenarioType: string, mcqId: string, answer: string) => void;
  clearScenarioDecisions: () => void; // To reset scenario decisions
  scenarioOutcomes: ScenarioOutcome[];
  addScenarioOutcome: (outcome: ScenarioOutcome) => void;
  setScenarioOutcomes: (outcomes: ScenarioOutcome[]) => void; // To reset outcomes
  finalReport: string | null;
  setFinalReport: (report: string | null) => void; // Allow null for reset
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  generatedScenariosContent: Record<string, ScenarioOutput>; // Stores the full AI output (scenario text + MCQs)
  setGeneratedScenarioContent: (scenarioType: string, content: ScenarioOutput) => void;
  clearGeneratedScenariosContent: () => void; // To reset generated content
  resetSimulation: () => void; // New comprehensive reset function
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [companyInfo, setCompanyInfoState] = useState<CompanyInfo | null>(null);
  const [flowchartData, setFlowchartDataState] = useState<FlowchartData | null>(null);
  const [mcqAnswers, setMcqAnswersState] = useState<Record<string, string>>({});
  const [flowchartValidationMcqs, setFlowchartValidationMcqsState] = useState<MCQ[]>([]); // Initialize new state
  const [currentScenarioIndex, setCurrentScenarioIndexState] = useState<number>(0);
  const [scenarios, setScenariosState] = useState<Scenario[]>([]);
  const [scenarioDecisions, setScenarioDecisionsState] = useState<Record<string, Record<string, string>>>({});
  const [scenarioOutcomes, setScenarioOutcomesState] = useState<ScenarioOutcome[]>([]);
  const [finalReport, setFinalReportState] = useState<string | null>(null);
  const [isLoading, setIsLoadingState] = useState<boolean>(false);
  const [generatedScenariosContent, setGeneratedScenariosContentState] = useState<Record<string, ScenarioOutput>>({});


  const setCompanyInfo = (info: CompanyInfo) => setCompanyInfoState(info);
  const setFlowchartData = (data: FlowchartData) => setFlowchartDataState(data);
  const setMcqAnswer = (questionId: string, answer: string) => {
    setMcqAnswersState((prev) => ({ ...prev, [questionId]: answer }));
  };
  const clearMcqAnswers = () => setMcqAnswersState({});
  const setFlowchartValidationMcqs = (mcqs: MCQ[]) => setFlowchartValidationMcqsState(mcqs);
  const setCurrentScenarioIndex = (index: number) => setCurrentScenarioIndexState(index);
  const setScenarios = (newScenarios: Scenario[]) => setScenariosState(newScenarios);
  
  const setScenarioDecision = (scenarioType: string, mcqId: string, answer: string) => {
    setScenarioDecisionsState((prev) => ({
      ...prev,
      [scenarioType]: {
        ...(prev[scenarioType] || {}),
        [mcqId]: answer,
      },
    }));
  };
  const clearScenarioDecisions = () => setScenarioDecisionsState({});

  const addScenarioOutcome = (outcome: ScenarioOutcome) => {
    setScenarioOutcomesState((prev) => {
      const existingOutcomeIndex = prev.findIndex(o => o.scenarioType === outcome.scenarioType);
      if (existingOutcomeIndex > -1) {
        const updatedOutcomes = [...prev];
        updatedOutcomes[existingOutcomeIndex] = outcome;
        return updatedOutcomes;
      }
      return [...prev, outcome];
    });
  };
  const setScenarioOutcomes = (outcomes: ScenarioOutcome[]) => setScenarioOutcomesState(outcomes);
  
  const setFinalReport = (report: string | null) => setFinalReportState(report);
  const setIsLoading = (loading: boolean) => setIsLoadingState(loading);

  const setGeneratedScenarioContent = (scenarioType: string, content: ScenarioOutput) => {
    setGeneratedScenariosContentState(prev => ({ ...prev, [scenarioType]: content }));
  };
  const clearGeneratedScenariosContent = () => setGeneratedScenariosContentState({});

  const resetSimulation = () => {
    clearMcqAnswers();
    setFlowchartValidationMcqsState([]); // Reset dynamic MCQs
    setCurrentScenarioIndexState(0);
    setScenariosState([]);
    clearScenarioDecisions();
    setScenarioOutcomesState([]); 
    setFinalReportState(null);
    clearGeneratedScenariosContent();
    setIsLoadingState(false); 
    // Optionally keep companyInfo and flowchartData for quicker reruns, or clear them:
    // setCompanyInfoState(null); 
    // setFlowchartDataState(null);
  };


  return (
    <AppContext.Provider
      value={{
        companyInfo,
        setCompanyInfo,
        flowchartData,
        setFlowchartData,
        mcqAnswers,
        setMcqAnswer,
        clearMcqAnswers,
        flowchartValidationMcqs,
        setFlowchartValidationMcqs,
        currentScenarioIndex,
        setCurrentScenarioIndex,
        scenarios,
        setScenarios,
        scenarioDecisions,
        setScenarioDecision,
        clearScenarioDecisions,
        scenarioOutcomes,
        addScenarioOutcome,
        setScenarioOutcomes,
        finalReport,
        setFinalReport,
        isLoading,
        setIsLoading,
        generatedScenariosContent,
        setGeneratedScenarioContent,
        clearGeneratedScenariosContent,
        resetSimulation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
