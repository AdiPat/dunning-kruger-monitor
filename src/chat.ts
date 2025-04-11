import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";

interface ChatResponses {
  message: string;
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

  let currentSystemMessage =
    "Hello! I am your Dunning-Kruger Monitor. Are you ready to assess your knowledge?";

  await new Promise((resolve) => setTimeout(resolve, 1500));
  spinner.succeed("Assessment ready!");

  while (true) {
    const { message } = await inquirer.prompt<ChatResponses>({
      type: "input",
      name: "message",
      message: currentSystemMessage,
    });

    const loadingSpinner = ora({
      text: "Thinking...",
      color: "yellow",
    }).start();

    await new Promise((resolve) => setTimeout(resolve, 1000));

    loadingSpinner.succeed("Okay, I'm ready with my response now.");

    if (
      message.toLowerCase() === "exit" ||
      message.toLowerCase() === "quit" ||
      message.toLowerCase() === "q"
    ) {
      console.log(chalk.green("Goodbye!"));
      break;
    }
  }
}
