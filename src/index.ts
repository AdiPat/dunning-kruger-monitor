export interface DunningKrugerScore {
  topic: string;
  confidence: number;
  expertise: number;
}

export function calculateDunningKrugerScore(
  topic: string,
  confidence: number,
  expertise: number
): DunningKrugerScore {
  return {
    topic,
    confidence: Math.max(0, Math.min(100, confidence)),
    expertise: Math.max(0, Math.min(100, expertise)),
  };
}
