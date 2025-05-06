
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Briefcase, Target, AlertTriangle } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";

const companyInfoSchema = z.object({
  companyDescription: z.string().min(50, {
    message: "Company description must be at least 50 characters.",
  }).max(1000, {
    message: "Company description must not exceed 1000 characters.",
  }),
});

type CompanyInfoFormValues = z.infer<typeof companyInfoSchema>;

export default function CompanyInfoInputPage() {
  const { setCompanyInfo, setFlowchartData } = useAppContext();
  const router = useRouter();

  const form = useForm<CompanyInfoFormValues>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: {
      companyDescription: "",
    },
  });

  async function onSubmit(data: CompanyInfoFormValues) {
    // Basic parsing for flowchart data - can be enhanced by AI in a real app
    const desc = data.companyDescription.toLowerCase();
    const companyNameMatch = desc.match(/company name is (.*?)(,|\.|$)/i) || desc.match(/company (.*?)( is|,|\.|$)/i);
    const industryMatch = desc.match(/industry is (.*?)(,|\.|$)/i);
    const focusMatch = desc.match(/focus is (.*?)(,|\.|$)/i) || desc.match(/current focus is (.*?)(,|\.|$)/i);
    const challengesMatch = desc.match(/challenges are (.*?)(,|\.|$)/i) || desc.match(/challenges include (.*?)(,|\.|$)/i);

    const companyName = companyNameMatch ? companyNameMatch[1].trim().replace(/\.$/, '') : "Your Company";
    const industry = industryMatch ? industryMatch[1].trim().replace(/\.$/, '') : "General Business";
    const currentFocus = focusMatch ? focusMatch[1].trim().replace(/\.$/, '') : "Growth";
    const challenges = challengesMatch ? challengesMatch[1].trim().replace(/\.$/, '') : "Competition";
    
    setCompanyInfo({
      description: data.companyDescription,
      name: companyName,
      industry: industry,
      focus: currentFocus,
      challenges: challenges,
    });

    setFlowchartData({
      companyName,
      industry,
      currentFocus,
      challenges,
    });

    router.push("/flowchart");
  }

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      <Card className="w-full max-w-2xl shadow-2xl rounded-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <BrainCircuit className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            Welcome to BizSim Navigator
          </CardTitle>
          <p className="text-muted-foreground">
            Let's start by understanding your business.
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="companyDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">
                      Company Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Innovatech Solutions is a SaaS company in the AI industry, focusing on product innovation. Our main challenges are scaling operations and fierce market competition..."
                        className="min-h-[150px] resize-none text-base p-4 rounded-lg shadow-inner"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-muted-foreground">
                      Please describe your company’s name, industry, current focus (e.g., growth, profitability, innovation), challenges (e.g., cash flow, competition, product development), and any other relevant details that may influence the scenario.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full text-lg py-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                Generate Flowchart
              </Button>
            </form>
          </Form>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="flex items-start space-x-3 p-4 bg-secondary/20 rounded-lg shadow">
              <Briefcase className="h-6 w-6 text-primary mt-1 shrink-0" />
              <div>
                <h4 className="font-semibold">Industry & Focus</h4>
                <p className="text-muted-foreground">Clearly state your industry and what your company is currently prioritizing.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-secondary/20 rounded-lg shadow">
              <AlertTriangle className="h-6 w-6 text-destructive mt-1 shrink-0" />
              <div>
                <h4 className="font-semibold">Challenges</h4>
                <p className="text-muted-foreground">Highlight the key obstacles or difficulties your company faces.</p>
              </div>
            </div>
             <div className="flex items-start space-x-3 p-4 bg-secondary/20 rounded-lg shadow col-span-1 md:col-span-2">
              <Target className="h-6 w-6 text-accent mt-1 shrink-0" />
              <div>
                <h4 className="font-semibold">Relevant Details</h4>
                <p className="text-muted-foreground">Include any specifics that might shape potential business scenarios, like market position, unique resources, or recent significant events.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
