import { FDStructConfig, fdstructVariableRegex } from "./fdstruct-config";
import * as path from "path";
import * as fs from "fs-extra";
import * as yaml from "yaml";
import { isValidPathString } from "../util/path-sanitization";
import { validateYmlFileExists } from "../../commands/option-validator";

const DEFAULTS: FDStructConfig = {
  debug: false,
  variables: {}
};

function validateConfig(configContents: any): Partial<FDStructConfig> {
  const config: Partial<FDStructConfig> = {};

  if (typeof configContents !== "object") {
    return config;
  }

  if (typeof configContents.debug === "boolean") {
    config.debug = configContents.debug;
  }

  if (typeof configContents.variables === "object") {
    const variables = configContents.variables;
    config.variables = Object.keys(variables).reduce((acc, key) => {
      if (
        typeof variables[key] === "string" &&
        fdstructVariableRegex.test(key) &&
        isValidPathString(variables[key])
      ) {
        acc[key] = variables[key];
      }
      return acc;
    }, {});
  }

  return config;
}

export async function readConfigFile(configFile: string): Promise<FDStructConfig> {
  if (!configFile) {
    return DEFAULTS;
  }

  const rootDir = process.cwd();
  const filePath = path.join(rootDir, configFile);
  if (!(await fs.exists(filePath))) {
    return DEFAULTS;
  }

  await validateYmlFileExists(filePath);

  const fileContent = await fs.readFile(filePath, "utf-8");
  const config = validateConfig(yaml.parse(fileContent));

  return {
    ...DEFAULTS,
    ...config
  };
}
