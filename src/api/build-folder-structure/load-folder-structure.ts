import * as fs from "fs-extra";
import * as yaml from "yaml";
import { FolderStructureInput } from "./folder-structure-input";

export async function loadFolderStructure(filePath: string) {
  const fileContent = await fs.readFile(filePath, "utf-8");
  const folderStruture = yaml.parse(fileContent) as FolderStructureInput;

  // parse variables
  const globalVariables = await parseVariables(folderStruture);
  expandVariables(folderStruture, globalVariables);

  // TODO: Validate Folder Structure
  // TODO: Sanitize Folder Structure
  return folderStruture;
}

type FDstructVariables = Record<string, string>;

async function parseVariables(folderStructure: FolderStructureInput): Promise<FDstructVariables> {
  // ${SomeRootFolder}
  const variables = {};
  for (const key in folderStructure) {
    if (key.match(/^\${(\w*)}/)) {
      const variable = key.match(/^\${(\w*)}/)[1];
      variables[variable] = `${folderStructure[key]}`;
      delete folderStructure[key];
    }
  }
  return variables;
}

async function expandVariables(
  folderStructure: FolderStructureInput,
  variables: FDstructVariables
) {
  for (const folder in folderStructure) {
    const contents = folderStructure[folder];

    // content is an array, iterate over each element
    for (const entry of contents.entries()) {
      const [i, content] = entry;
      if (typeof content === "string") {
        if (content.match(/\${(\w*)}/)) {
          const expandedContent = content.replace(/\${(.*?)}/g, (match, variable) => {
            return variables[variable] || match;
          });
          contents[i] = expandedContent;
        }
      } else {
        expandVariables(content, variables);
      }
    }
  }
}
