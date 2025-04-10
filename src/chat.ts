import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import { calculateDunningKrugerScore } from "./index.js";

interface ChatResponses {
  confidence: number;
  continueChat: boolean;
}

export async function startChat(topic: string): Promise<void> {
  console.log(
    chalk.cyan("\n🤔 Welcome to your Dunning-Kruger assessment session!")
  );
  console.log(
    chalk.cyan(`Let's evaluate your knowledge about: ${chalk.bold(topic)}\n`)
  );

  const spinner = ora({
    text: "Preparing your assessment...",
    color: "cyan",
  }).start();

  await new Promise((resolve) => setTimeout(resolve, 1500));
  spinner.succeed("Assessment ready!");

  while (true) {
    const { confidence } = await inquirer.prompt<ChatResponses>({
      type: "number",
      name: "confidence",
      message:
        "On a scale of 0-100, how confident are you about your knowledge in this topic?",
      validate: (input: number | undefined) => {
        if (input === undefined || isNaN(input) || input < 0 || input > 100) {
          return "Please enter a number between 0 and 100";
        }
        return true;
      },
    });

    const loadingSpinner = ora({
      text: "Analyzing your response...",
      color: "yellow",
    }).start();

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const expertise = Math.floor(Math.random() * 101);
    const score = calculateDunningKrugerScore(topic, confidence, expertise);

    loadingSpinner.succeed("Analysis complete!");

    console.log("\n" + chalk.yellow("=== Assessment Results ==="));
    console.log(chalk.blue(`Topic: ${score.topic}`));
    console.log(chalk.green(`Your Confidence: ${score.confidence}%`));
    console.log(chalk.red(`Actual Expertise: ${score.expertise}%`));

    const gap = Math.abs(score.confidence - score.expertise);
    if (gap > 30) {
      console.log(
        chalk.yellow("\n⚠️ Potential Dunning-Kruger effect detected!")
      );
    }

    const { continueChat } = await inquirer.prompt<ChatResponses>({
      type: "confirm",
      name: "continueChat",
      message: "Would you like to reassess your confidence?",
      default: false,
    });

    if (!continueChat) {
      console.log(
        chalk.cyan("\n👋 Thank you for using the Dunning-Kruger Monitor!")
      );
      break;
    }
  }
}
