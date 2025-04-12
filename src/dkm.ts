import { groq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import chalk from "chalk";
import { z } from "zod";

export interface DunningKrugerScoreResult {
  chatIndex: number;
  competency: number; // 0-1 scale
  expertise: number; // 0-100 scale
}

export type DunningKrugerScore = Omit<DunningKrugerScoreResult, "chatIndex">;

const dkScoreSchema = z.object({
  competency: z.number(),
  expertise: z.number(),
});

/**
 * Calculates the Dunning-Kruger score based on chat history
 * @param chatHistory Array of chat messages
 * @param currentIndex Current position in chat history
 * @returns Promise<DunningKrugerScore>
 */
export async function calculateDunningKrugerScore(
  chatHistory: string[],
  currentIndex: number
): Promise<DunningKrugerScoreResult> {
  try {
    const prompt = `
    Analyze the following conversation history and assess the user's Dunning-Kruger metrics.
    Focus on their demonstrated knowledge, confidence level, and awareness of knowledge limitations.
    
    Chat History:
    ${chatHistory.slice(0, currentIndex + 1).join("\n")}
    
    Return your analysis in the following JSON format:
    {
      "competency": <0-1 scale measuring actual demonstrated knowledge>,
      "expertise": <0-100 scale measuring objective expertise level>,
      "reasoning": <brief explanation of the score>
    }
  `;

    const result = await generateObject<DunningKrugerScore>({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
      prompt,
      schema: dkScoreSchema,
    });

    const analysis = result?.object || { competency: 0, expertise: 0 };

    return {
      chatIndex: currentIndex,
      competency: analysis.competency,
      expertise: analysis.expertise,
    };
  } catch (error) {
    console.error(chalk.red("Error generating Dunning-Kruger score:"), error);
    return {
      chatIndex: currentIndex,
      competency: 0,
      expertise: 0,
    };
  }
}

export interface DunningKrugerAnalysis {
  averageScore: number;
  progression: Array<{
    stage: string;
    description: string;
    index: number;
  }>;
  insights: string[];
}

const dkAnalysisSchema = z.object({
  averageScore: z.number(),
  progression: z.array(
    z.object({
      stage: z.string(),
      description: z.string(),
      index: z.number(),
    })
  ),
  insights: z.array(z.string()),
});

/**
 * Generates a comprehensive Dunning-Kruger analysis from the score history
 * @param scores Array of DunningKrugerScore objects
 * @returns Promise<DunningKrugerAnalysis>
 */
export async function analyzeDunningKrugerProgression(
  scores: DunningKrugerScore[]
): Promise<DunningKrugerAnalysis> {
  try {
    const prompt = `
    Analyze this progression of Dunning-Kruger scores and identify key stages and insights.
    
    Score History:
    ${JSON.stringify(scores, null, 2)}
    
    Create an analysis that includes:
    1. The stages the person went through (Peak of Mt. Stupid, Valley of Despair, etc.)
    2. Key insights about their learning progression
    3. Overall evaluation of their Dunning-Kruger journey.
  `;

    const result = await generateObject<DunningKrugerAnalysis>({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
      prompt,
      schema: dkAnalysisSchema,
    });

    const analysis = result?.object || {
      averageScore: 0,
      progression: [],
      insights: []
    };

    return analysis;
  } catch (error) {
    console.error(chalk.red("Error generating Dunning-Kruger analysis:"), error);
    return {
      averageScore: 0,
      progression: [],
      insights: [],
    };
  }
}
