import { FDstructException } from "../../exception/exceptions";
import { readConfigFile } from "./config-file-reader";
import { FDStructConfig } from "./fdstruct-config";

export let config: FDStructConfig;
export async function initConfig(configFile: string) {
  config = await readConfigFile(configFile);
}

export function getConfig(): FDStructConfig {
  if (!config) {
    throw new FDstructException("Config not initialized");
  }

  return config;
}
