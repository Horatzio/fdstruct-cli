import * as fs from "fs-extra";
import * as path from "path";
import * as yaml from "yaml";
import * as micromatch from "micromatch";
import * as pg from "parse-gitignore";
import { FolderStructureInput } from "../../build-folder-structure/folder-structure-input";

export async function executeScan(targetFolder: string, fdstructFile: string) {
  const folder = path.resolve(targetFolder);
  const ignorePatterns = await loadIgnorePatterns(folder);
  const folderStructure = await scanFolder(folder, ignorePatterns);
  const yamlContent = yaml.stringify(folderStructure);

  const fdstructFilePath = path.join(folder, fdstructFile);
  await fs.writeFile(fdstructFilePath, yamlContent);
}

async function scanFolder(folder: string, ignorePatterns: string[]): Promise<FolderStructureInput> {
  const folderName = path.basename(folder);
  const files = await fs.readdir(folder);
  const contents: (FolderStructureInput | string)[] = [];

  for (const file of files) {
    const filePath = path.join(folder, file);
    const stats = await fs.lstat(filePath);
    if (
      ignorePatterns.some(pattern =>
        micromatch.isMatch(path.normalize(filePath).replace(/\\/g, "/"), pattern)
      )
    ) {
      continue;
    }

    if (stats.isSymbolicLink()) {
      const linkPath = await fs.readlink(filePath);
      if (stats.isDirectory()) {
        contents.push({
          [`${file}->"${linkPath}"`]: []
        });
      } else {
        contents.push(`${file}->"${linkPath}"`);
      }
    } else if (stats.isDirectory()) {
      contents.push(await scanFolder(filePath, ignorePatterns));
    } else {
      contents.push(file);
    }
  }

  return {
    [folderName]: contents
  };
}

const DEFAULT_IGNORE_PATTERNS = ["**/.git"];

function toGlobPattern(pattern: string): string {
  if (pattern.startsWith("**")) {
    return pattern;
  }

  if (pattern.startsWith("/")) {
    return `**${pattern}`;
  }

  return `**/${pattern}`;
}

async function loadIgnorePatterns(targetFolder: string): Promise<string[]> {
  // read .gitignore file and return lines as array
  const gitIgnorePath = path.join(targetFolder, ".gitignore");
  if (!(await fs.exists(gitIgnorePath))) {
    return [];
  }
  const gitIgnore = await fs.readFile(gitIgnorePath, "utf-8");
  if (gitIgnore === "") {
    return [];
  }

  const gitIgnorePatterns: string[] = await pg
    .parse(gitIgnore)
    .patterns.filter(p => !p.startsWith("!"));
  return [...gitIgnorePatterns, ...DEFAULT_IGNORE_PATTERNS].map(p => toGlobPattern(p));
}
