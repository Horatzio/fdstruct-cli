import * as chokidar from "chokidar";
import { buildFolderStructure } from "../../build-folder-structure/build-folder-structure";
import {
  FDStructNode,
  FolderNode,
  TopLevelFolderStructure,
  VirtualFolderNode
} from "../../model/folder-structure-graph";
import { DeleteVisitor } from "../../visitors/delete-visitor";
import { createGenerateVisitor } from "../../visitors/create/create-generate-visitor";
import { createVirtualFolderWatcher } from "./virtual-folder-watcher";

export async function watchFDstructFile(fdstructFilePath: string, fdstructFile: string) {
  const virtualFolderWatcher = await createVirtualFolderWatcher();
  const {
    addVirtualFolderVisitor,
    removeVirtualFolderVisitor
  } = virtualFolderWatcher.getVisitors();

  const folderStructure = await buildFolderStructure(fdstructFilePath);
  await updateFolderStructure({ folders: [] } as TopLevelFolderStructure, folderStructure);

  const watcher = chokidar.watch(fdstructFile, {
    ignoreInitial: true,
    followSymlinks: false
  });

  // TODO: Make super cool console logging
  console.log(`Watching ${fdstructFile} for changes...`);
  watcher.on("unlink", () => {
    console.log("ERROR: File deleted. Exiting...");
    watcher.close();
  });

  watcher.on("change", () => {
    async function onChange() {
      try {
        const newFolderStructure = await buildFolderStructure(fdstructFilePath);
        await updateFolderStructure(folderStructure, newFolderStructure);
      } catch (e) {
        console.log(e);
      }
    }
    onChange();
  });

  async function updateFolderStructure(
    oldFolderStructure: TopLevelFolderStructure,
    newFolderStructure: TopLevelFolderStructure
  ) {
    const oldFolders = oldFolderStructure.folders;
    const newFolders = newFolderStructure.folders;

    const { addedNodes, deletedNodes, commonNodes } = await findDifferences(oldFolders, newFolders);
    const addedFolders = addedNodes.filter(node => FolderNode.isFolder(node)) as FolderNode[];
    const deletedFolders = deletedNodes.filter(node => FolderNode.isFolder(node)) as FolderNode[];
    const commonFolders = commonNodes.filter(
      ([oldNode, newNode]) => FolderNode.isFolder(oldNode) && FolderNode.isFolder(newNode)
    ) as [FolderNode, FolderNode][];

    const generateVisitor = createGenerateVisitor();
    const deleteVisitor = new DeleteVisitor();

    for (const folder of addedFolders) {
      folder.accept(generateVisitor);
      folder.accept(addVirtualFolderVisitor);
    }

    for (const folder of deletedFolders) {
      folder.accept(deleteVisitor);
      folder.accept(removeVirtualFolderVisitor);
    }

    for (const folderPair of commonFolders) {
      const [oldFolder, newFolder] = folderPair;
      await updateFolder(oldFolder, newFolder);
    }

    await generateVisitor.finishVisiting();
    return;

    async function updateFolder(oldFolder: FolderNode, newFolder: FolderNode) {
      // compare if same type of folder
      const oldFolderIsVirtual = oldFolder instanceof VirtualFolderNode;
      const oldFolderIsNormal = oldFolder instanceof FolderNode;
      const newFolderIsVirtual = newFolder instanceof VirtualFolderNode;
      const newFolderIsNormal = newFolder instanceof FolderNode;

      if ((oldFolderIsVirtual && newFolderIsNormal) || (oldFolderIsNormal && newFolderIsVirtual)) {
        oldFolder.accept(deleteVisitor);
        oldFolder.accept(removeVirtualFolderVisitor);

        newFolder.accept(generateVisitor);
        newFolder.accept(addVirtualFolderVisitor);
        return;
      }

      if (oldFolderIsVirtual && newFolderIsVirtual) {
        if (oldFolder.target !== newFolder.target) {
          oldFolder.accept(deleteVisitor);
          oldFolder.accept(removeVirtualFolderVisitor);

          newFolder.accept(generateVisitor);
          newFolder.accept(addVirtualFolderVisitor);
          return;
        }
      }

      const { addedNodes, deletedNodes, commonNodes } = await findDifferences(
        oldFolder.children,
        newFolder.children
      );

      for (const node of addedNodes) {
        node.accept(generateVisitor);
        node.accept(addVirtualFolderVisitor);
      }

      for (const node of deletedNodes) {
        node.accept(deleteVisitor);
        node.accept(removeVirtualFolderVisitor);
      }

      for (const node of commonNodes) {
        if (FolderNode.isFolder(node[0])) {
          await updateFolder(node[0] as FolderNode, node[1] as FolderNode);
        }
        // otherwise, file is of the same type. Doesn't need updating
      }
    }
  }
}

async function findDifferences(oldNodes: FDStructNode[], newNodes: FDStructNode[]) {
  const addedNodes = newNodes.filter(node => !oldNodes.find(otherNode => otherNode.isEqual(node)));
  const deletedNodes = oldNodes.filter(
    node => !newNodes.find(otherNode => otherNode.isEqual(node))
  );
  const commonNodes = newNodes
    .map(node => [oldNodes.find(otherNode => otherNode.isEqual(node)), node])
    .filter(([oldNode, newNode]) => oldNode !== undefined && newNode !== undefined) as [
      FDStructNode,
      FDStructNode
    ][];

  return {
    addedNodes,
    deletedNodes,
    commonNodes
  };
}
