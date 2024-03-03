import { expect, test } from "vitest";
import { fdstructCli } from "../util/run-cli";

test("help command", async t => {
  const { stdout, stderr } = await fdstructCli(["--help"]);
  // expect(stdout).toEqual("");
  // expect(stderr).toEqual("");

  const expectedTokens = [
    "Display help for commands.",
    "A CLI tool for generating folder structures.",
    "generate [options]",
    "scan [options]"
  ];

  for (const token of expectedTokens) {
    expect(stdout).to.include(token, `Help message did not contain token ${token}`);
  }
});
