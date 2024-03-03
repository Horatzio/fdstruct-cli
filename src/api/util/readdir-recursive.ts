import * as fs from "fs-extra";
import * as path from "path";

export async function readDirRecursive(dirPath: string) {
  let files = [];

  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      files = files.concat(await readDirRecursive(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}
