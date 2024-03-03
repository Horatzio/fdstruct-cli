import { readDirRecursive } from "../../util/readdir-recursive";
import { VirtualFolderNode, VirtualLinkNode } from "../../model/folder-structure-graph";
import * as fs from "fs-extra";
import * as micromatch from "micromatch";
import * as path from "path";
import { SymLinkPair } from "./create-visitor";
import { BaseVisitor } from "../../model/node-visitor";

export class VirtualFolderVisitor extends BaseVisitor {
  private foldersToVisit: VirtualFolderNode[] = [];
  private symLinkQueue: SymLinkPair[] = [];

  async visitVirtualFolder(folder: VirtualFolderNode): Promise<void> {
    this.foldersToVisit.push(folder);
    await super.visitVirtualFolder(folder);
  }

  async executeVisitVirtualFolder(folder: VirtualFolderNode): Promise<void> {
    const expressions = [];
    for (const child of folder.children) {
      if (child instanceof VirtualLinkNode) {
        expressions.push(child.name);
      }
    }

    const linkTarget = path.isAbsolute(folder.target)
      ? folder.target
      : path.join(folder.parentPath, folder.target);
    const linkTargetSanitized = linkTarget.replace(/\\/g, "/");
    const aggregateExpression = expressions.map(e => `(${linkTargetSanitized}/${e})`).join("|");

    const allFilesInTarget = await readDirRecursive(linkTarget);
    const foundFiles = allFilesInTarget.filter(f => micromatch.isMatch(f, aggregateExpression));
    for (const foundFile of foundFiles) {
      const relativeFilePath = path.relative(linkTarget, foundFile);
      const linkPath = path.join(folder.path, relativeFilePath);
      this.symLinkQueue.push({
        path: linkPath,
        linkTarget: foundFile
      });
    }
  }

  async finishVisiting(): Promise<void> {
    await Promise.all(this.foldersToVisit.map(folder => this.executeVisitVirtualFolder(folder)));
    await Promise.all(
      this.symLinkQueue.map(symLink => {
        if (!fs.existsSync(symLink.path)) {
          fs.ensureSymlinkSync(symLink.linkTarget, symLink.path);
        }
      })
    );
  }
}

function prefixExpression(e: string) {
  if (e.startsWith("**")) {
    return e;
  }
  return `**/${e}`;
}
