import { describe, it, expect } from "vitest";
import { validateTopic } from "../validator.js";

describe("validateTopic", () => {
  it("should validate a valid topic", () => {
    const result = validateTopic("JavaScript");
    expect(result.isValid).toBe(true);
  });

  it("should reject an empty topic", () => {
    const result = validateTopic("   ");
    expect(result.isValid).toBe(false);
    expect(result.message).toBe("Topic cannot be empty");
  });

  it("should reject a topic that is too short", () => {
    const result = validateTopic("JS");
    expect(result.isValid).toBe(false);
    expect(result.message).toBe("Topic must be at least 3 characters long");
  });

  it("should reject a topic that is too long", () => {
    const result = validateTopic("a".repeat(101));
    expect(result.isValid).toBe(false);
    expect(result.message).toBe("Topic must not exceed 100 characters");
  });
});
