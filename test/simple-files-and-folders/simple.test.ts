import * as path from "path";
import * as fs from "fs-extra";
import { describe, expect, test, beforeEach } from "vitest";
import { fdstructCli } from "../util/run-cli";
import { Wait } from "../util/watch-util";

const GENERATED_FOLDER = path.join(__dirname, "test-folder");

describe("Simples Files and Folders", () => {
  beforeEach(() => {
    if (fs.existsSync(GENERATED_FOLDER)) {
      fs.rmSync(GENERATED_FOLDER, {
        recursive: true
      });
    }
  });

  test("generate", async () => {
    await fdstructCli(["generate"], __dirname);
    await Wait(250);

    const expectedFiles = [
      "test-subdir/testfile3.yml",
      "test-subdir2/file1.txt",
      "test-subdir2/file2.json",
      "test-subdir2/file3.md",
      "test-subdir3/file4.md"
    ];

    for (const file of expectedFiles) {
      const exists = fs.existsSync(path.join(GENERATED_FOLDER, file));
      if (!exists) {
        expect.fail(`File ${file} was not generated`);
      }
    }
  });
});
