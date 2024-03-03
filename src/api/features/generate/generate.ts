import * as path from "path";
import { buildFolderStructure } from "../../build-folder-structure/build-folder-structure";
import { createGenerateVisitor } from "../../visitors/create/create-generate-visitor";

export async function executeGenerate(file: string) {
  const rootDir = process.cwd();
  const filePath = path.isAbsolute(file) ? file : path.join(rootDir, file);

  const folderStructure = await buildFolderStructure(filePath);
  const generateVisitor = createGenerateVisitor();

  for (const folder of folderStructure.folders) {
    await folder.accept(generateVisitor);
  }

  await generateVisitor.finishVisiting();
}
