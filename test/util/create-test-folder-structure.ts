import * as fs from "fs-extra";
import * as path from "path";

export type Entry = StructureEntry | LinkStructureEntry;
export type EntryType = "File" | "Directory" | "LinkFile" | "LinkDirectory";

interface StructureEntry {
  path: string;
  type: "File" | "Directory";
}

interface LinkStructureEntry extends Omit<StructureEntry, "type"> {
  type: "LinkFile" | "LinkDirectory";
  linkPath: string;
}

const typeTagRegEx = /^\[(F|D|FL|DL)\]/;

function getTypeTag(entry: string): string {
  return entry.match(typeTagRegEx)?.[0] || "";
}

function removeTypeTag(entry: string): string {
  return entry.replace(typeTagRegEx, "");
}

/*
    file: "[F]folder1.json"
    directory: "[D]folder2"
    link file: "[FL]folder3.json->folder1.json"
    link directory: "[DL]folder4->folder2"
*/
async function createEntry(entry: string): Promise<Entry> {
  const typeTag = getTypeTag(entry);
  switch (typeTag) {
    case "[F]":
      return {
        path: removeTypeTag(entry),
        type: "File"
      };
    case "[D]":
      return {
        path: removeTypeTag(entry),
        type: "Directory"
      };
    case "[FL]": {
      const [path, linkPath] = removeTypeTag(entry).split("->");
      return {
        path,
        linkPath,
        type: "LinkFile"
      };
    }
    case "[DL]": {
      const [path, linkPath] = removeTypeTag(entry).split("->");
      return {
        path,
        linkPath,
        type: "LinkDirectory"
      };
    }
  }
  throw new Error("Invalid entry type");
}

export async function createFilesAndFolders(baseDir: string, entries: string[]): Promise<void> {
  for (const entry of entries) {
    const entryObj = await createEntry(entry);
    switch (entryObj.type) {
      case "File":
        fs.ensureFileSync(path.join(baseDir, entryObj.path));
        break;
      case "Directory":
        fs.ensureDirSync(path.join(baseDir, entryObj.path));
        break;
      case "LinkFile":
      case "LinkDirectory":
        fs.ensureSymlinkSync(
          path.join(baseDir, entryObj.linkPath),
          path.join(baseDir, entryObj.path),
          entryObj.type === "LinkDirectory" ? "dir" : undefined
        );
        break;
    }
  }
}
