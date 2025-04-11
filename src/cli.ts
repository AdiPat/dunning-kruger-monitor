#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import figlet from "figlet";
import gradient from "gradient-string";
import { startChat } from "./chat.js";
import { validateTopic } from "./validator.js";
import fs from "fs";
import path from "path";
import os from "os";
import inquirer from "inquirer";

const CONFIG_DIR = path.join(os.homedir(), ".thp");
const CONFIG_FILE = path.join(CONFIG_DIR, "dkm-config.json");

interface CliOptions {
  topic?: string;
  reconfigure?: boolean;
}

async function ensureConfigExists(): Promise<boolean> {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }

    if (!fs.existsSync(CONFIG_FILE)) {
      const { apiKey } = await inquirer.prompt([
        {
          type: "password",
          name: "apiKey",
          message: "Please enter your GROQ API key:",
          validate: (input) =>
            input.length > 0 ? true : "API key cannot be empty",
        },
      ]);

      fs.writeFileSync(
        CONFIG_FILE,
        JSON.stringify({ groqApiKey: apiKey }, null, 2)
      );
      return true;
    }

    console.log(chalk.green("✓ GROQ LLM configured!"));
    return true;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        chalk.red("Error configuring GROQ API key:", error.message)
      );
    } else {
      console.error(chalk.red("Error configuring GROQ API key"));
    }
    return false;
  }
}

async function reconfigureApiKey(): Promise<boolean> {
  try {
    const { apiKey } = await inquirer.prompt([
      {
        type: "password",
        name: "apiKey",
        message: "Please enter your new GROQ API key:",
        validate: (input) =>
          input.length > 0 ? true : "API key cannot be empty",
      },
    ]);

    fs.writeFileSync(
      CONFIG_FILE,
      JSON.stringify({ groqApiKey: apiKey }, null, 2)
    );
    console.log(chalk.green("✓ GROQ API key updated successfully!"));
    return true;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(chalk.red("Error updating GROQ API key:", error.message));
    } else {
      console.error(chalk.red("Error updating GROQ API key"));
    }
    return false;
  }
}

// Create a beautiful banner
const banner = figlet.textSync("Dunning Kruger\n   Monitor", {
  font: "Standard",
  horizontalLayout: "default",
  verticalLayout: "default",
});

const displayBanner = () => {
  console.log(gradient.pastel.multiline(banner));
  console.log(chalk.dim("\nDeveloped by The Hackers Playbook™ © 2025\n"));
};

const program = new Command();

program
  .name("dunning-kruger-monitor")
  .description("Measure and monitor your Dunning-Kruger effect on any topic")
  .version("1.0.0")
  .option("-t, --topic <topic>", "Topic to analyze")
  .option("-r, --reconfigure", "Reconfigure GROQ API key")
  .action(async (options: CliOptions) => {
    displayBanner();

    if (options.reconfigure) {
      await reconfigureApiKey();
      return;
    }

    const configValid = await ensureConfigExists();
    if (!configValid) {
      return;
    }

    if (!options.topic) {
      console.log(chalk.red("Error: Topic is required"));
      program.help();
      return;
    }

    const validationResult = validateTopic(options.topic);
    if (!validationResult.isValid) {
      console.log(chalk.red(`Error: ${validationResult.message}`));
      return;
    }

    await startChat(options.topic);
  });

program.parse();
