import { Command } from "commander";
import { DEFAULTS } from "./config";
import { commands } from "./commands";
import { version } from "../package.json";

export const program = new Command();
async function main() {
  program
    .name("fdstruct")
    .description("A CLI tool for generating folder structures.")
    .addHelpText("beforeAll", "Display help for commands.")
    .version(version, "-v, --version")
    .option("-c, --config <config>", `Specify a config file to use`, DEFAULTS.configFile);

  for (const command of commands) {
    program.addCommand(command);
  }

  await program.parseAsync(process.argv);
}

console.log();
main();

process.on("unhandledRejection", function(err: Error) {
  console.error(err.stack);
  program.error("", { exitCode: 1 });
});
