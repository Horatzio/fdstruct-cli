import { generateCommand } from "./generate.command";
import { scanCommand } from "./scan.command";
// import { validateCommand } from "./validate.command";
import { watchCommand } from "./watch.command";

const commands = [
  generateCommand,
  watchCommand,
  scanCommand
  // validateCommand
];

export { commands };
