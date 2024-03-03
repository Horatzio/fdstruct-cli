import {
  FileNode,
  LinkNode,
  FolderNode,
  VirtualFolderNode,
  VirtualLinkNode
} from "./folder-structure-graph";

export interface NodeVisitor {
  visitFile(file: FileNode): Promise<void>;
  visitLinkEntry(link: LinkNode): Promise<void>;
  visitFolder(folder: FolderNode): Promise<void>;
  visitVirtualFolder(folder: VirtualFolderNode): Promise<void>;
  visitVirtualLink(link: VirtualLinkNode): Promise<void>;
  finishVisiting(): Promise<void>;
}

export class BaseVisitor implements NodeVisitor {
  async visitFile(file: FileNode): Promise<void> {}
  async visitLinkEntry(link: LinkNode): Promise<void> {}
  async visitFolder(folder: FolderNode): Promise<void> {
    await Promise.all(folder.children.map(child => child.accept(this)));
  }
  async visitVirtualFolder(folder: VirtualFolderNode): Promise<void> {
    await Promise.all(folder.children.map(child => child.accept(this)));
  }
  async visitVirtualLink(link: VirtualLinkNode): Promise<void> {}
  async finishVisiting(): Promise<void> {}
}
