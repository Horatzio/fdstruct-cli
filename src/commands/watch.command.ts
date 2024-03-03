import { DEFAULTS } from "../config";
import { Command } from "commander";
import { initConfig } from "../api/config/config";
import { executeWatch } from "../api/features/watch/watch";
import { validateFileExists } from "./option-validator";
import { validateSymlinksEnabled } from "../verify-symlinks-enabled";

export const watchCommand = new Command("watch")
  .description(
    `This command does 2 things:
      1. It watches the folder structure file (${DEFAULTS.fdstructFile}) for changes and automatically updates the generated folder structure.
      2. It watches the link target folder of link folders and updates their contents based on changes in the source.
      `
  )
  .option(
    "-f --file <file>",
    `Specify the folder structure file to watch for changes. Defaults to ${DEFAULTS.fdstructFile}.`,
    DEFAULTS.fdstructFile
  )
  .action(async options => {
    if (!(await validateSymlinksEnabled())) {
      return;
    }

    await initConfig(options.config);
    await validateFileExists(options.file);
    await executeWatch(options.file);
  });
