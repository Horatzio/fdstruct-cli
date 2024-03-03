import * as path from "path";
import * as fs from "fs-extra";
import { describe, expect, test, beforeEach } from "vitest";
import { fdstructCli } from "../util/run-cli";

const GENERATED_FOLDER = path.join(__dirname, "test-internal-link-generated");

describe("Link Folder pointing to an internal folder generated by fdstruct", () => {
  beforeEach(() => {
    if (fs.existsSync(GENERATED_FOLDER)) {
      fs.rmSync(GENERATED_FOLDER, {
        recursive: true
      });
    }
  });

  test("generate", async () => {
    await fdstructCli(["generate"], __dirname);

    const expectedFiles = [
      "jsons-simple/file1.json",
      "jsons-simple/file2.json",
      "jsons-all/file1.json",
      "jsons-all/file2.json",
      "jsons-all/dir1/dir1-file1.json"
    ];

    for (const file of expectedFiles) {
      const exists = fs.existsSync(path.join(GENERATED_FOLDER, file));
      if (!exists) {
        expect.fail(`File ${file} was not generated`);
      }
    }

    const unexpectedFiles = [
      "jsons-simple/notfile1.jason",
      "jsons-all/notfile1.jason",
      "jsons-simple/file3.txt",
      "jsons-all/file3.txt",
      "jsons-simple/file4json.config",
      "jsons-all/file4json.config"
    ];

    for (const file of unexpectedFiles) {
      const exists = fs.existsSync(path.join(GENERATED_FOLDER, file));
      if (exists) {
        expect.fail(`File ${file} should not have been generated`);
      }
    }
  });
});