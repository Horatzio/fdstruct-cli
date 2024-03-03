import {
  FileNode,
  FolderNode,
  LinkNode,
  VirtualFolderNode,
  VirtualLinkNode
} from "../model/folder-structure-graph";
import { BaseVisitor } from "../model/node-visitor";

export class AggregateVisitor extends BaseVisitor {
  private visitors: BaseVisitor[];
  public constructor(visitors: BaseVisitor[] = []) {
    super();
    this.visitors = visitors;
  }

  public async visitFile(file: FileNode): Promise<void> {
    await Promise.all(this.visitors.map(visitor => visitor.visitFile(file)));
  }

  public async visitFolder(folder: FolderNode): Promise<void> {
    await Promise.all(this.visitors.map(visitor => visitor.visitFolder(folder)));
  }

  public async visitVirtualFolder(folder: VirtualFolderNode): Promise<void> {
    await Promise.all(this.visitors.map(visitor => visitor.visitVirtualFolder(folder)));
  }

  public async visitLinkEntry(link: LinkNode): Promise<void> {
    await Promise.all(this.visitors.map(visitor => visitor.visitLinkEntry(link)));
  }

  public async visitVirtualLink(link: VirtualLinkNode): Promise<void> {
    await Promise.all(this.visitors.map(visitor => visitor.visitVirtualLink(link)));
  }

  public async finishVisiting(): Promise<void> {
    await Promise.all(this.visitors.map(visitor => visitor.finishVisiting()));
  }
}
