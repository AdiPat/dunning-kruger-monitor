import { describe, it, expect, vi, beforeEach } from "vitest";
import { startChat } from "../chat";
import inquirer from "inquirer";
import ora from "ora";

// Mock dependencies
vi.mock("inquirer");
vi.mock("ora", () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
  })),
}));

describe("startChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods
    console.log = vi.fn();
  });

  it("should start and complete a chat session", async () => {
    // Mock user input to exit after one assessment
    vi.mocked(inquirer.prompt)
      .mockResolvedValueOnce({ confidence: 80 })
      .mockResolvedValueOnce({ continueChat: false });

    await startChat("JavaScript");

    // Verify that ora spinner was created
    expect(ora).toHaveBeenCalledWith(expect.any(Object));

    // Verify that user was prompted
    expect(inquirer.prompt).toHaveBeenCalledTimes(2);

    // Verify that results were displayed
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Assessment Results")
    );
  });

  it("should continue chat loop when user chooses to continue", async () => {
    // Mock user choosing to continue once then exit
    vi.mocked(inquirer.prompt)
      .mockResolvedValueOnce({ confidence: 70 })
      .mockResolvedValueOnce({ continueChat: true })
      .mockResolvedValueOnce({ confidence: 60 })
      .mockResolvedValueOnce({ continueChat: false });

    await startChat("Python");

    // Verify that user was prompted multiple times
    expect(inquirer.prompt).toHaveBeenCalledTimes(4);
  });
});
