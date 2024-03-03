import * as fs from "fs-extra";
import * as path from "path";
import { TestError } from "./test-error";

export async function VerifyExpectedFiles(cwd: string, expectedFiles: string[]) {
  for (const file of expectedFiles) {
    const exists = fs.existsSync(path.join(cwd, file));
    if (!exists) {
      throw new TestError(`File ${file} was not generated`);
    }
  }
}
export async function Wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
