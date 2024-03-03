import { DEFAULTS } from "../config";
import { Command } from "commander";
import { executeGenerate } from "../api/features/generate/generate";
import { validateYmlFileExists } from "./option-validator";
import { initConfig } from "../api/config/config";
import { validateSymlinksEnabled } from "../verify-symlinks-enabled";

export const generateCommand = new Command("generate")
  .description("Generate the folder structure.")
  .option(
    "-f --file <file>",
    `Specify a file to load the folder structure from. Defaults to ${DEFAULTS.fdstructFile}.`,
    DEFAULTS.fdstructFile
  )
  .action(async options => {
    if (!(await validateSymlinksEnabled())) {
      return;
    }

    await initConfig(options.config);
    await validateYmlFileExists(options.file);
    await executeGenerate(options.file);
  });
