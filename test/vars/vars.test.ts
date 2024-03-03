import * as path from "path";
import * as fs from "fs-extra";
import { describe, expect, test, beforeEach } from "vitest";
import { fdstructCli } from "../util/run-cli";
import { Wait } from "../util/watch-util";

const GENERATED_FOLDER = path.join(__dirname, "test-root-folder");

describe("Inline Variables", () => {
  beforeEach(async () => {
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
      "file1-link.txt",
      "fileOne.txt",
      "test-fileOne.txt",

      "sub-folder-1/fileOne.json",

      "sub-folder-link-1/fileOne.json",
      "sub-folder-link-1/test-file3.json",

      "sub-folder-link-2/test-file1.yaml",
      "sub-folder-link-2/test-file2.yml",
      "sub-folder-link-2/test-file3.json",
      "sub-folder-link-2/test-file4.txt"
    ];

    for (const file of expectedFiles) {
      const exists = fs.existsSync(path.join(GENERATED_FOLDER, file));
      if (!exists) {
        expect.fail(`File ${file} was not generated`);
      }
    }
  });
});
