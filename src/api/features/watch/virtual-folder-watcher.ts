import { VirtualFolderNode, VirtualLinkNode } from "../../model/folder-structure-graph";
import * as chokidar from "chokidar";
import { LambdaVirtualFolderVisitor } from "../../visitors/lambda-virtual-folder-visitor";
import * as path from "path";
import * as fs from "fs-extra";

export class VirtualFolderWatcher {
  private watchers: Map<string, chokidar.FSWatcher> = new Map();
  private addVisitor: LambdaVirtualFolderVisitor;
  private removeVisitor: LambdaVirtualFolderVisitor;

  private async createWatcher(folder: VirtualFolderNode) {
    const expressions = [];
    for (const child of folder.children) {
      if (child instanceof VirtualLinkNode) {
        expressions.push(child.name);
      }
    }
    const patterns = expressions;
    const watcher = chokidar.watch(patterns, { cwd: folder.target, followSymlinks: false });

    watcher.on("add", onNewFileAdded);
    watcher.on("unlink", onFileDeleted);

    return watcher;

    async function onNewFileAdded(filePath: string) {
      const srcPath = path.join(folder.target, filePath);
      const linkPath = path.join(folder.path, filePath);

      if (!fs.existsSync(linkPath)) {
        await fs.ensureSymlink(srcPath, linkPath);
      }
    }

    async function onFileDeleted(filePath: string) {
      const linkPath = path.join(folder.path, filePath);
      await fs.unlink(linkPath);
    }
  }

  public constructor() {
    const addVisitor = new LambdaVirtualFolderVisitor(async (folder: VirtualFolderNode) => {
      const watcher = this.watchers.get(folder.path);
      if (!watcher) {
        const watcher = await this.createWatcher(folder);
        this.watchers.set(folder.path, watcher);
      }
    });
    const removeVisitor = new LambdaVirtualFolderVisitor(async (folder: VirtualFolderNode) => {
      const watcher = this.watchers.get(folder.path);
      if (watcher) {
        watcher.close();
        this.watchers.delete(folder.path);
      }
    });
    this.addVisitor = addVisitor;
    this.removeVisitor = removeVisitor;
  }

  public getVisitors() {
    return {
      addVirtualFolderVisitor: this.addVisitor,
      removeVirtualFolderVisitor: this.removeVisitor
    };
  }
}

export async function createVirtualFolderWatcher() {
  return new VirtualFolderWatcher();
}
