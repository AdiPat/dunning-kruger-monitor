export interface DunningKrugerScoreResult {
    chatIndex: number;
    competency: number;
    expertise: number;
}
export type DunningKrugerScore = Omit<DunningKrugerScoreResult, "chatIndex">;
/**
 * Calculates the Dunning-Kruger score based on chat history
 * @param chatHistory Array of chat messages
 * @param currentIndex Current position in chat history
 * @returns Promise<DunningKrugerScore>
 */
export declare function calculateDunningKrugerScore(chatHistory: string[], currentIndex: number): Promise<DunningKrugerScoreResult>;
export interface DunningKrugerAnalysis {
    averageScore: number;
    progression: Array<{
        stage: string;
        description: string;
        index: number;
    }>;
    insights: string[];
}
/**
 * Generates a comprehensive Dunning-Kruger analysis from the score history
 * @param scores Array of DunningKrugerScore objects
 * @returns Promise<DunningKrugerAnalysis>
 */
export declare function analyzeDunningKrugerProgression(scores: DunningKrugerScore[]): Promise<DunningKrugerAnalysis>;
