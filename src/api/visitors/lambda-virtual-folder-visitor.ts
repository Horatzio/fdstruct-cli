import { VirtualFolderNode } from "../model/folder-structure-graph";
import { BaseVisitor } from "../model/node-visitor";

export class LambdaVirtualFolderVisitor extends BaseVisitor {
  public constructor(private action: (folder: VirtualFolderNode) => Promise<void>) {
    super();
  }

  async visitVirtualFolder(folder: VirtualFolderNode): Promise<void> {
    await this.action(folder);
  }
}
