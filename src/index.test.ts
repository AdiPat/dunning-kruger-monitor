import { describe, it, expect } from "vitest";
import { calculateDunningKrugerScore } from "./index";

describe("calculateDunningKrugerScore", () => {
  it("should return a valid score object", () => {
    const result = calculateDunningKrugerScore("JavaScript", 80, 60);
    expect(result).toEqual({
      topic: "JavaScript",
      confidence: 80,
      expertise: 60,
    });
  });

  it("should clamp values between 0 and 100", () => {
    const result = calculateDunningKrugerScore("Python", 120, -20);
    expect(result).toEqual({
      topic: "Python",
      confidence: 100,
      expertise: 0,
    });
  });
});
