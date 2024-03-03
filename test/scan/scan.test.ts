import { expect, test, describe, beforeEach } from "vitest";
import * as path from "path";
import { createFilesAndFolders } from "../util/create-test-folder-structure";
import { fdstructCli } from "../util/run-cli";
import * as fs from "fs-extra";

const TEST_FOLDER = path.join(__dirname, "test-folder");

describe("Scan Command", () => {
  beforeEach(async () => {
    if (fs.existsSync(TEST_FOLDER)) {
      fs.rmSync(TEST_FOLDER, {
        recursive: true
      });
    }
  });

  test("scan", async t => {
    await createFilesAndFolders(TEST_FOLDER, [
      "[F]testfile1.json",
      "[F]testfile2.txt",
      "[F]test-subdir/testfile3.yml",
      "[D]test-subdir-empty",
      "[FL]testfile1-link.json->testfile1.json",
      "[FL]test-subdir2/testfile2-link.txt->testfile2.txt",
      "[DL]test-subdir-link->test-subdir"
    ]);

    const cwd = path.join(__dirname);
    let output: any;

    try {
      output = await fdstructCli(["scan", "-D", "./test-folder"], cwd);
    } catch (e) {
      expect.fail(JSON.stringify(e));
    }

    const { stdout, stderr } = output;
    expect(stdout).toEqual("");
    // expect(stderr).toEqual("");

    const fdstructFileExists = await fs.exists(path.join(cwd, "./test-folder/fdstruct.yml"));
    expect(fdstructFileExists).toBeTruthy();

    const fileStructure = await fs.readFile(path.join(cwd, "./test-folder/fdstruct.yml"), "utf-8");
    const expectedFileStructure = ``;
    // t.is(fileStructure, expectedFileStructure);
  });
});
