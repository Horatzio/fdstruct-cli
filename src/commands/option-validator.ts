import * as fs from "fs-extra";
import * as path from "path";
import { FDstructArgumentException } from "../exception/exceptions";

export async function validateFolderExists(folder: string) {
  if (!(await fs.exists(folder))) {
    throw new FDstructArgumentException(`Folder ${folder} does not exist.`);
  }
}

const ymlExtensions = [".yml", ".yaml"];

export async function validateYmlFileExists(file: string) {
  await validateFileExists(file);

  const extension = path.extname(file);
  if (!ymlExtensions.includes(extension)) {
    throw new FDstructArgumentException(
      `Invalid file extension. Must be [${ymlExtensions.join(", ")}]`
    );
  }
}

export async function validateFileExists(file: string) {
  if (!(await fs.exists(file))) {
    throw new FDstructArgumentException(`File ${file} does not exist.`);
  }
}
