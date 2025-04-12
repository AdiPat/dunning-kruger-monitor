import { describe, it, expect, vi, beforeEach } from "vitest";
import { startChat } from "../chat";
import inquirer from "inquirer";
import ora from "ora";
import chalk from "chalk";
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";

// Mock dependencies
vi.mock("inquirer");
vi.mock("ai");
vi.mock("@ai-sdk/groq");

const mockSpinner = {
  start: vi.fn().mockReturnThis(),
  succeed: vi.fn().mockReturnThis(),
  stop: vi.fn().mockReturnThis(),
};

vi.mock("ora", () => ({
  default: vi.fn(() => mockSpinner),
}));

// Mock chalk to return the input string
vi.mock("chalk", () => ({
  default: {
    cyan: (text: string) => text,
    green: (text: string) => text,
    bold: (text: string) => text,
    red: (text: string) => text,
    yellow: (text: string) => text,
    blue: (text: string) => text,
    gray: (text: string) => text,
  },
}));

describe("startChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods
    console.log = vi.fn();
    // Mock generateText to return a response
    vi.mocked(generateText).mockResolvedValue({
      text: "Mock AI response",
    } as any);
    // Mock groq to return model name
    vi.mocked(groq).mockReturnValue(
      "meta-llama/llama-4-scout-17b-16e-instruct" as any
    );
  });

  it("should start and display welcome messages", async () => {
    // Mock user choosing to exit immediately
    vi.mocked(inquirer.prompt).mockResolvedValueOnce({
      message: "q",
    });

    await startChat("JavaScript");

    // Verify welcome messages
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(
        "Welcome to your Dunning-Kruger assessment session!"
      )
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Let's evaluate your knowledge about: JavaScript")
    );
  });

  it("should show loading spinners with appropriate messages", async () => {
    // Mock user choosing to exit immediately
    vi.mocked(inquirer.prompt).mockResolvedValueOnce({
      message: "q",
    });

    await startChat("Python");

    // Verify spinner creation and messages
    expect(ora).toHaveBeenCalledWith({
      text: "Preparing your assessment...",
      color: "cyan",
    });
    expect(ora().succeed).toHaveBeenCalledWith("Assessment ready!");
  });

  it("should handle user input and show thinking spinner", async () => {
    // Mock user input then exit
    vi.mocked(inquirer.prompt)
      .mockResolvedValueOnce({ message: "Hello" })
      .mockResolvedValueOnce({ message: "q" });

    await startChat("JavaScript");

    // Verify thinking spinner
    expect(ora).toHaveBeenCalledWith({
      text: "Thinking...",
      color: "yellow",
    });
    expect(ora().succeed).toHaveBeenCalledWith("Mock AI response");
  });

  it("should exit on 'q' command", async () => {
    vi.mocked(inquirer.prompt).mockResolvedValueOnce({
      message: "q",
    });

    await startChat("Python");

    expect(console.log).toHaveBeenCalledWith("Goodbye!");
    expect(ora).toHaveBeenCalledWith({
      text: "Saving conversation history...",
      color: "cyan",
    });
  });

  it("should exit on 'quit' command", async () => {
    vi.mocked(inquirer.prompt).mockResolvedValueOnce({
      message: "quit",
    });

    await startChat("Python");

    expect(console.log).toHaveBeenCalledWith("Goodbye!");
    expect(ora).toHaveBeenCalledWith({
      text: "Saving conversation history...",
      color: "cyan",
    });
  });

  it("should exit on 'exit' command", async () => {
    vi.mocked(inquirer.prompt).mockResolvedValueOnce({
      message: "exit",
    });

    await startChat("Python");

    expect(console.log).toHaveBeenCalledWith("Goodbye!");
    expect(ora).toHaveBeenCalledWith({
      text: "Saving conversation history...",
      color: "cyan",
    });
  });

  it("should continue chat loop until exit command", async () => {
    vi.mocked(inquirer.prompt)
      .mockResolvedValueOnce({ message: "Hello" })
      .mockResolvedValueOnce({ message: "How are you?" })
      .mockResolvedValueOnce({ message: "q" });

    await startChat("JavaScript");

    // Verify prompt was called multiple times
    expect(inquirer.prompt).toHaveBeenCalledTimes(3);
  });

  describe("conversation closing", () => {
    it("should properly clean up resources when exiting", async () => {
      vi.mocked(inquirer.prompt).mockResolvedValueOnce({
        message: "q",
      });

      await startChat("JavaScript");

      expect(mockSpinner.stop).toHaveBeenCalled();
      expect(ora).toHaveBeenCalledWith({
        text: "Saving conversation history...",
        color: "cyan",
      });
      expect(console.log).toHaveBeenCalledWith("Goodbye!");
    });

    it("should save conversation state before exiting", async () => {
      vi.mocked(inquirer.prompt)
        .mockResolvedValueOnce({ message: "Hello" })
        .mockResolvedValueOnce({ message: "q" });

      await startChat("Python");

      // Verify final messages
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("Saving your progress...")
      );
      expect(console.log).toHaveBeenCalledWith("Goodbye!");
      expect(mockSpinner.succeed).toHaveBeenCalledWith("Progress saved!");
    });

    it("should handle errors during cleanup gracefully", async () => {
      // Mock spinner to throw error during cleanup
      mockSpinner.stop.mockImplementationOnce(() => {
        throw new Error("Cleanup error");
      });

      vi.mocked(inquirer.prompt).mockResolvedValueOnce({
        message: "exit",
      });

      await startChat("JavaScript");

      // Verify error handling
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("Error during cleanup")
      );
      expect(console.log).toHaveBeenCalledWith("Goodbye!");
    });
  });
});
