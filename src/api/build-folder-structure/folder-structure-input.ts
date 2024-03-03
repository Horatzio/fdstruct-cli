export type FolderStructureInput = {
  [folderName: string]: (FolderStructureInput | string)[];
};
