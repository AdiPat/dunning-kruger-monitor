import inquirer from "inquirer";
import chalk from "chalk";
import ora, { Ora } from "ora";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import {
  calculateDunningKrugerScore,
  analyzeDunningKrugerProgression,
  DunningKrugerScore,
} from "./dkm.js";

const MAX_MESSAGES = 10;
const TERMINATION_WARNING_THRESHOLD = 8;

interface ChatResponses {
  message: string;
  dkScore: DunningKrugerScore;
}

async function generateResponse(input: string, topic: string): Promise<string> {
  const response = await generateText({
    model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
    prompt: `You are evaluating a user's knowledge about ${topic}. Respond to their message: ${input}`,
  });
  return response.text;
}

export async function startChat(topic: string): Promise<void> {
  console.log(
    chalk.cyan("\n🤔 Welcome to your Dunning-Kruger assessment session!")
  );
  console.log(
    chalk.cyan("Let's evaluate your knowledge about:") +
      " " +
      chalk.bold(topic) +
      "\n"
  );

  const spinner = ora({
    text: "Preparing your assessment...",
    color: "cyan",
  }).start();

  let currentSystemMessage =
    "Hello! I am your Dunning-Kruger Monitor. Are you ready to assess your knowledge?";

  await new Promise((resolve) => setTimeout(resolve, 1500));
  spinner.succeed("Assessment ready!");

  const chatHistory = [currentSystemMessage];
  const dkScores: DunningKrugerScore[] = [];
  let messageCount = 1;
  let isWrappingUp = false;
  let loadingSpinner: Ora;

  try {
    while (true) {
      const response = await inquirer.prompt<ChatResponses>([
        {
          type: "input",
          name: "message",
          message: "You:",
        },
      ]);

      const userInput = response.message.trim().toLowerCase();
      if (userInput === "q" || userInput === "quit" || userInput === "exit") {
        console.log(chalk.cyan("Saving your progress..."));
        const savingSpinner = ora({
          text: "Saving conversation history...",
          color: "cyan",
        }).start();
        console.log("Goodbye!");
        savingSpinner.succeed("Progress saved!");
        break;
      }

      loadingSpinner = ora({
        text: "Thinking...",
        color: "yellow",
      }).start();

      // Process message and get AI response
      const agentMessage = await generateResponse(userInput, topic);

      loadingSpinner.succeed(agentMessage);
      chatHistory.push(agentMessage);

      // Update score after every few messages
      if (messageCount % 3 === 0 && !isWrappingUp) {
        const dkScore = await calculateDunningKrugerScore(
          chatHistory,
          messageCount
        );
        dkScores.push(dkScore);

        // Check if we've reached sufficient interactions
        if (messageCount >= MAX_MESSAGES) {
          isWrappingUp = true;
        }
      }

      messageCount++;
    }
  } finally {
    try {
      spinner.stop();
      await displayFinalAnalysis(dkScores);
    } catch (error: any) {
      console.log(chalk.red("Error during cleanup: ") + error?.message);
    }
  }
}

async function displayFinalAnalysis(scores: DunningKrugerScore[]) {
  const analysisSpinner = ora({
    text: "Generating your Dunning-Kruger analysis...",
    color: "green",
  }).start();

  const analysis = await analyzeDunningKrugerProgression(scores);

  analysisSpinner.succeed("Analysis complete!\n");

  // Display the analysis in a pretty format
  console.log(chalk.cyan("\n📊 Your Dunning-Kruger Journey Analysis\n"));

  // Display progression stages
  console.log(chalk.bold("🔄 Learning Progression:"));
  analysis.progression.forEach((stage, index) => {
    console.log(chalk.yellow(`\n${index + 1}. ${stage.stage}`));
    console.log(chalk.gray(`   ${stage.description}`));
  });

  // Display insights
  console.log(chalk.bold("\n💡 Key Insights:"));
  analysis.insights.forEach((insight, index) => {
    console.log(chalk.green(`\n• ${insight}`));
  });

  // Display average score
  console.log(chalk.bold("\n📈 Overall Score:"));
  console.log(
    chalk.blue(
      `   ${(analysis.averageScore * 100).toFixed(1)}% mastery level\n`
    )
  );

  // Visual graph of progression (simple ASCII art)
  console.log(chalk.bold("📉 Confidence vs. Competence Progression:"));
  const graph = createProgressionGraph(scores);
  console.log(graph);
}

function createProgressionGraph(scores: DunningKrugerScore[]): string {
  const height = 10;
  const width = scores.length * 3;
  const graph: string[][] = Array(height)
    .fill(0)
    .map(() => Array(width).fill(" "));

  // Normalize scores for graph height
  const normalizedScores = scores.map((score) => ({
    competence: Math.floor((score.expertise / 100) * (height - 1)),
    confidence: Math.floor(score.competency * (height - 1)),
  }));

  // Plot the points
  normalizedScores.forEach((score, i) => {
    const x = i * 3;
    graph[height - 1 - score.competence][x] = "◆"; // competence
    graph[height - 1 - score.confidence][x + 1] = "●"; // confidence
  });

  // Build the graph string
  let result = "\n";
  graph.forEach((row, i) => {
    result +=
      chalk.gray(String(100 - (i * 100) / height).padStart(3) + "% |") +
      row.join("") +
      "\n";
  });
  result += chalk.gray("     " + "─".repeat(width) + "\n");
  result += chalk.gray("     Time →") + "\n\n";
  result +=
    chalk.blue("◆ Actual Competence  ") +
    chalk.yellow("● Perceived Confidence") +
    "\n";

  return result;
}
