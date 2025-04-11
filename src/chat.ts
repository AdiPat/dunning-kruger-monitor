import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

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

  const chatHistory = [currentSystemMessage];

  while (true) {
    const { message } = await inquirer.prompt<ChatResponses>({
      type: "input",
      name: "message",
      message: "Your message:",
    });

    const loadingSpinner = ora({
      text: "Thinking...",
      color: "yellow",
    }).start();

    const { text: agentMessage } = await generateText({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
      system: `You are a conversational agent responsible for assessing the user's knowledge about a specific topic. The topic is ${topic}.

        Chat History:
        ${chatHistory.join("\n")}
        User: ${message}
      `,
      prompt:
        "Respond to the last message from the user, maintaining continuity in the conversation. Your response should be concise and relevant to the topic.",
    });

    chatHistory.push(`User: '''${message}'''`);
    chatHistory.push(`Agent: '''${agentMessage}'''`);

    loadingSpinner.succeed(agentMessage);

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
