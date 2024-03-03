import { LinkNode } from "../../model/folder-structure-graph";
import { BaseVisitor } from "../../model/node-visitor";
import * as fs from "fs-extra";
import { SymLinkPair } from "./create-visitor";
import path from "path";

export class LinkVisitor extends BaseVisitor {
  private symLinkQueue: SymLinkPair[] = [];

  async visitLinkEntry(link: LinkNode): Promise<void> {
    const linkTarget = path.isAbsolute(link.target)
      ? link.target
      : path.join(link.parentPath, link.target);
    this.symLinkQueue.push({ path: link.path, linkTarget: linkTarget });
  }

  async finishVisiting(): Promise<void> {
    await Promise.all(
      this.symLinkQueue.map(async symLink => fs.ensureSymlinkSync(symLink.linkTarget, symLink.path))
    );
  }
}
