import { getLinkParts, isLink } from "../util/link-parsing";
import {
  FileNode,
  FolderNode,
  LinkNode,
  TopLevelFolderStructure,
  VirtualFolderNode,
  VirtualLinkNode
} from "../model/folder-structure-graph";
import { FolderStructureInput } from "./folder-structure-input";
import { loadFolderStructure } from "./load-folder-structure";

export async function buildFolderStructure(filePath: string): Promise<TopLevelFolderStructure> {
  const folderStructureInput = await loadFolderStructure(filePath);

  const rootDir = process.cwd();
  const folderInputs = Object.entries(folderStructureInput).filter(([_, value]) =>
    Array.isArray(value)
  );
  const folders = await Promise.all(
    folderInputs.map(async ([name, children]) => buildFolder(rootDir, { [name]: children }))
  );

  return {
    folders
  };
}

async function buildFolder(
  parentPath: string,
  folderStructureInput: FolderStructureInput
): Promise<FolderNode> {
  const folderName = Object.keys(folderStructureInput)[0];
  if (isLink(folderName)) {
    return buildVirtualFolder(parentPath, folderStructureInput);
  }

  const folder = new FolderNode(folderName, parentPath);

  const entries = folderStructureInput[folderName];
  const children = [];
  for (const entry of entries) {
    if (typeof entry === "string") {
      if (isLink(entry)) {
        const { entryName, linkTarget } = getLinkParts(entry);
        children.push(new LinkNode(entryName, folder.path, linkTarget));
      } else {
        // file
        children.push(new FileNode(entry, folder.path));
      }
    } else {
      children.push(await buildFolder(folder.path, entry));
    }
  }
  folder.children = children;
  return folder;
}

async function buildVirtualFolder(
  parentPath: string,
  folderStructureInput: FolderStructureInput
): Promise<FolderNode> {
  const folderName = Object.keys(folderStructureInput)[0];
  const { entryName, linkTarget } = getLinkParts(folderName);

  const folder = new VirtualFolderNode(entryName, parentPath, linkTarget);

  const entries = folderStructureInput[folderName];
  const children = [];
  for (const entry of entries) {
    if (typeof entry === "string") {
      if (isLink(entry)) {
        const { entryName, linkTarget } = getLinkParts(entry);
        children.push(new LinkNode(entryName, folder.path, linkTarget));
      } else {
        // file
        children.push(new VirtualLinkNode(entry, folder.path, folder));
      }
    } else {
      children.push(await buildFolder(folder.path, entry));
    }
  }
  folder.children = children;
  return folder;
}
