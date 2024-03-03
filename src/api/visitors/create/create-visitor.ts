import { FileNode, FolderNode, VirtualFolderNode } from "../../model/folder-structure-graph";
import { BaseVisitor } from "../../model/node-visitor";
import * as fs from "fs-extra";

export interface SymLinkPair {
  path: string;
  linkTarget: string;
}

export class CreateVisitor extends BaseVisitor {
  async visitFile(file: FileNode): Promise<void> {
    fs.ensureFileSync(file.path);
  }
  async visitFolder(folder: FolderNode): Promise<void> {
    fs.ensureDirSync(folder.path);
    await super.visitFolder(folder);
  }
  async visitVirtualFolder(folder: VirtualFolderNode): Promise<void> {
    fs.ensureDirSync(folder.path);
    await super.visitVirtualFolder(folder);
  }
}
