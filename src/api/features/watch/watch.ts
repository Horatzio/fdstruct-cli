import * as path from "path";
import { watchFDstructFile } from "./watch-fdstruct-file";

export async function executeWatch(fdstructFile: string) {
  const rootDir = process.cwd();
  const fdstructFilePath = path.join(rootDir, fdstructFile);

  await watchFDstructFile(fdstructFilePath, fdstructFile);
}
