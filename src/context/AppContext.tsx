
"use client";

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
  description: string;
  mcqs: MCQ[];
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
  currentScenarioIndex: number;
  setCurrentScenarioIndex: (index: number) => void;
  scenarios: Scenario[]; // This will be populated dynamically
  setScenarios: (scenarios: Scenario[]) => void;
  scenarioDecisions: Record<string, Record<string, string>>; // scenarioType -> { mcqId -> answer }
  setScenarioDecision: (scenarioType: string, mcqId: string, answer: string) => void;
  scenarioOutcomes: ScenarioOutcome[];
  addScenarioOutcome: (outcome: ScenarioOutcome) => void;
  finalReport: string | null;
  setFinalReport: (report: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  generatedScenariosContent: Record<string, ScenarioOutput>;
  setGeneratedScenarioContent: (scenarioType: string, content: ScenarioOutput) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [companyInfo, setCompanyInfoState] = useState<CompanyInfo | null>(null);
  const [flowchartData, setFlowchartDataState] = useState<FlowchartData | null>(null);
  const [mcqAnswers, setMcqAnswersState] = useState<Record<string, string>>({});
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

  const addScenarioOutcome = (outcome: ScenarioOutcome) => {
    setScenarioOutcomesState((prev) => [...prev, outcome]);
  };
  
  const setFinalReport = (report: string) => setFinalReportState(report);
  const setIsLoading = (loading: boolean) => setIsLoadingState(loading);

  const setGeneratedScenarioContent = (scenarioType: string, content: ScenarioOutput) => {
    setGeneratedScenariosContentState(prev => ({ ...prev, [scenarioType]: content }));
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
        currentScenarioIndex,
        setCurrentScenarioIndex,
        scenarios,
        setScenarios,
        scenarioDecisions,
        setScenarioDecision,
        scenarioOutcomes,
        addScenarioOutcome,
        finalReport,
        setFinalReport,
        isLoading,
        setIsLoading,
        generatedScenariosContent,
        setGeneratedScenarioContent,
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
