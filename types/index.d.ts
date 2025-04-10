export interface DunningKrugerScore {
    topic: string;
    confidence: number;
    expertise: number;
}
export declare function calculateDunningKrugerScore(topic: string, confidence: number, expertise: number): DunningKrugerScore;
