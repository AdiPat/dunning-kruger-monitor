#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import figlet from "figlet";
import gradient from "gradient-string";
import { startChat } from "./chat.js";
import { validateTopic } from "./validator.js";

const program = new Command();

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

program
  .name("dunning-kruger-monitor")
  .description("Measure and monitor your Dunning-Kruger effect on any topic")
  .version("1.0.0")
  .option("-t, --topic <topic>", "Topic to analyze")
  .action(async (options) => {
    displayBanner();

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
