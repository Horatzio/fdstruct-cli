import { FolderStructureInput } from "../../build-folder-structure/folder-structure-input";
import * as path from "path";
import * as fs from "fs-extra";
import * as micromatch from "micromatch";
import { trimQuotes } from "../../util/string-trimmer";
import { readDirRecursive } from "../../util/readdir-recursive";
import { normalizeSlashes } from "../../util/path-sanitization";
import { getLinkParts, isLink } from "../../util/link-parsing";

export async function createFolderStructure(
  rootDir: string,
  folderStructure: FolderStructureInput
) {
  const symLinkQueue = [];
  await processFolderStructure(folderStructure, rootDir);

  for (const link of symLinkQueue) {
    await fs.ensureSymlink(link.target, link.path);
  }

  async function processFolderStructure(folderStructure: FolderStructureInput, currentDir: string) {
    const currentFolder = normalizeSlashes(trimQuotes(Object.keys(folderStructure)[0]));
    if (isLink(currentFolder)) {
      await processLinkFolder(folderStructure, currentDir);
      return;
    }

    const parentFolderDir = path.join(currentDir, currentFolder);
    await fs.ensureDir(parentFolderDir);

    const contents = folderStructure[currentFolder];
    for (const content of contents) {
      if (typeof content === "string") {
        const entry = normalizeSlashes(trimQuotes(content));
        if (isLink(entry)) {
          const linkParts = getLinkParts(entry);
          const entryPath = path.join(parentFolderDir, linkParts.entryName);
          symLinkQueue.push({
            path: entryPath,
            target: path.join(parentFolderDir, linkParts.linkTarget)
          });
        } else {
          const entryPath = path.join(parentFolderDir, entry);
          await fs.ensureFile(entryPath);
        }
      } else {
        await processFolderStructure(content, parentFolderDir);
      }
    }
  }

  function prefixExpression(e: string) {
    if (e.startsWith("**")) {
      return e;
    }
    return `**/${e}`;
  }

  async function processLinkFolder(linkFolderStructure: FolderStructureInput, currentDir: string) {
    const folderKey = Object.keys(linkFolderStructure)[0];
    const folderName = trimQuotes(folderKey);
    const linkParts = getLinkParts(folderName);

    const contents = linkFolderStructure[folderKey];
    if (contents.length == 0) {
      const linkPath = path.join(currentDir, linkParts.entryName);
      symLinkQueue.push({
        path: linkPath,
        target: linkParts.linkTarget
      });
      return;
    } else {
      const folderPath = path.join(currentDir, linkParts.entryName);
      await fs.ensureDir(folderPath);

      const fileExpressions = [];
      for (const entry of contents) {
        if (typeof entry === "string") {
          fileExpressions.push(entry);
        } else {
          await processFolderStructure(entry, folderPath);
        }
      }

      const fileExpression = fileExpressions
        .map(e => prefixExpression(e))
        .map(e => `(${e})`)
        .join("|");
      const linkTarget = path.join(currentDir, linkParts.linkTarget);

      const files = await readDirRecursive(linkTarget);

      const foundFiles = files.filter(f => micromatch.isMatch(f, fileExpression));
      for (const foundFile of foundFiles) {
        const relativeFilePath = path.relative(linkTarget, foundFile);
        const linkPath = path.join(folderPath, relativeFilePath);
        symLinkQueue.push({
          path: linkPath,
          target: foundFile
        });
      }
    }
  }
}
