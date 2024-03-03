import * as path from "path";
import * as fs from "fs-extra";
import { describe, expect, test, beforeEach } from "vitest";
import { fdstructCliForWatch } from "../util/run-cli";
import { Wait, VerifyExpectedFiles } from "../util/watch-util";

const GENERATED_FOLDERS = {
  TEST_FOLDER: path.join(__dirname, "test-folder"),
  TEST_FOLDER_2: path.join(__dirname, "test-folder-2"),
  TEST_FOLDER_3: path.join(__dirname, "test-folder-3")
};

export const FDSTRUCT_FILES = {
  V0: path.join(__dirname, "fdstruct.yml"),
  V1: path.join(__dirname, "fdstruct-v1.yml"),
  V2: path.join(__dirname, "fdstruct-v2.yml"),
  V3: path.join(__dirname, "fdstruct-v3.yml"),
  V4: path.join(__dirname, "fdstruct-v4.yml")
};

describe("Watch Simple Files and Folders", () => {
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
    await SwitchToVersion(FDSTRUCT_FILES.V1);
    const { cliExit, killCli } = fdstructCliForWatch(["watch"], __dirname);

    try {
      await Wait(250);
      await VerifyExpectedFiles(__dirname, [
        "test-folder/file1.txt",
        "test-folder/file2.txt",
        "test-folder/file3.txt"
      ]);

      await SwitchToVersion(FDSTRUCT_FILES.V2);
      await Wait(250);
      await VerifyExpectedFiles(__dirname, [
        "test-folder/file1.txt",
        "test-folder/file2.txt",
        "test-folder/file3.txt",
        "test-folder-2/file4.txt"
      ]);
      await Wait(250);

      await SwitchToVersion(FDSTRUCT_FILES.V3);
      await Wait(250);
      await VerifyExpectedFiles(__dirname, [
        "test-folder/file1.txt",
        "test-folder/file2.txt",
        "test-folder/file3.txt",
        "test-folder-3/file4.txt"
      ]);
      await Wait(250);

      await SwitchToVersion(FDSTRUCT_FILES.V4);
      await Wait(250);
      await VerifyExpectedFiles(__dirname, [
        "test-folder/file2.txt",
        "test-folder/file3.txt",
        "test-folder/new-file.txt",
        "test-folder-3/file4.txt"
      ]);

      killCli();
    } catch (e) {
      try {
        const { stdout, stderr } = await cliExit;
        console.log("STDOUT\n");
        console.log(stdout);
        console.log("STDERR\n");
        console.log(stderr);
      } catch (cliError) {
        expect.fail(JSON.stringify(cliError));
      }
      expect.fail(JSON.stringify(e));
    }
  });
});

export async function SwitchToVersion(version: string) {
  const content = await fs.readFile(version, "utf-8");
  fs.writeFileSync(FDSTRUCT_FILES.V0, content);
}
