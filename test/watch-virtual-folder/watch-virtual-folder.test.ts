import * as path from "path";
import * as fs from "fs-extra";
import { describe, expect, test, beforeEach } from "vitest";
import { fdstructCliForWatch } from "../util/run-cli";
import { VerifyExpectedFiles, Wait } from "../util/watch-util";
import { createFilesAndFolders } from "../util/create-test-folder-structure";

const GENERATED_FOLDERS = {
  TEST_FOLDER: path.join(__dirname, "test-virtual-folder"),
  TEST_FOLDER_2: path.join(__dirname, "test-virtual-folder-2"),
  TEST_FOLDER_3: path.join(__dirname, "test-sample-folder")
};

describe("Watch Virtual Folder Dynamic Symlinks", () => {
  beforeEach(() => {
    for (const folder of Object.values(GENERATED_FOLDERS)) {
      if (fs.existsSync(folder)) {
        fs.rmSync(folder, {
          recursive: true
        });
      }
    }
  });

  test("watch", async () => {
    await createFilesAndFolders(__dirname, [
      "[F]test-sample-folder/file1.txt",
      "[F]test-sample-folder/file2.yml",
      "[F]test-sample-folder/file3.yml",
      "[F]test-sample-folder/file4.yml"
    ]);

    const { cliExit, killCli } = fdstructCliForWatch(["watch"], __dirname);

    await Wait(250);
    await VerifyExpectedFiles(__dirname, [
      "test-virtual-folder/file2.yml",
      "test-virtual-folder/file3.yml",
      "test-virtual-folder/file4.yml",
      "test-virtual-folder-2/file1.txt"
    ]);

    await Wait(250);
    await createFilesAndFolders(__dirname, [
      "[F]test-sample-folder/newfile1.yml",
      "[F]test-sample-folder/newfile2.yml",
      "[F]test-sample-folder/newfile3.txt",
      "[F]test-sample-folder/test-subfolder-1/newfile4.txt"
    ]);

    await Wait(250);
    await VerifyExpectedFiles(__dirname, [
      "test-virtual-folder/newfile1.yml",
      "test-virtual-folder/newfile2.yml",
      "test-virtual-folder-2/newfile3.txt",
      "test-virtual-folder-2/test-subfolder-1/newfile4.txt"
    ]);

    killCli();
    try {
      const { stderr, stdout } = await cliExit;
      console.log(stderr, stdout);
    } catch (e) {
      expect.fail(e);
    }
  });
});
