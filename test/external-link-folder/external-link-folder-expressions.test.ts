import * as path from "path";
import * as fs from "fs-extra";
import { describe, expect, test, beforeEach } from "vitest";
import { createFilesAndFolders } from "../util/create-test-folder-structure";
import { fdstructCli } from "../util/run-cli";

const ORIGINAL_FOLDER = path.join(__dirname, "test-external-link-original");
const GENERATED_FOLDER = path.join(__dirname, "test-external-link-generated");

describe("Link Folder pointing to an external folder", () => {
  beforeEach(() => {
    if (fs.existsSync(ORIGINAL_FOLDER)) {
      fs.rmSync(ORIGINAL_FOLDER, {
        recursive: true
      });
    }
    if (fs.existsSync(GENERATED_FOLDER)) {
      fs.rmSync(GENERATED_FOLDER, {
        recursive: true
      });
    }
  });

  test("generate", async () => {
    await createFilesAndFolders(ORIGINAL_FOLDER, [
      "[F]file1.json",
      "[F]file2.json",
      "[F]dir1/file1.json"
    ]);

    await fdstructCli(["generate"], __dirname);

    const expectedFiles = [
      "jsons-simple/file1.json",
      "jsons-simple/file2.json",
      "jsons-explicit/file1.json",
      "jsons-explicit/file2.json",
      "jsons-explicit/dir1/file1.json"
    ];

    for (const file of expectedFiles) {
      const exists = fs.existsSync(path.join(GENERATED_FOLDER, file));
      if (!exists) {
        expect.fail(`File ${file} was not generated`);
      }
    }

    const unexpectedFiles = ["jsons-simple/dir1/file1.json"];

    for (const file of unexpectedFiles) {
      const exists = fs.existsSync(path.join(GENERATED_FOLDER, file));
      if (exists) {
        expect.fail(`File ${file} should not have been generated`);
      }
    }
  });
});
