import * as fs from "fs-extra";
import { BaseVisitor } from "../model/node-visitor";
import {
  FileNode,
  LinkNode,
  FolderNode,
  VirtualFolderNode,
  VirtualLinkNode
} from "../model/folder-structure-graph";

export class DeleteVisitor extends BaseVisitor {
  async visitFile(file: FileNode): Promise<void> {
    await fs.remove(file.path);
  }
  async visitLinkEntry(link: LinkNode): Promise<void> {
    await fs.remove(link.path);
  }
  async visitFolder(folder: FolderNode): Promise<void> {
    await fs.remove(folder.path);
  }
  async visitVirtualFolder(folder: VirtualFolderNode): Promise<void> {
    await fs.remove(folder.path);
  }
  async visitVirtualLink(link: VirtualLinkNode): Promise<void> {
    await fs.remove(link.path);
  }
}
