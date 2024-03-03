import * as path from "path";
import { spawn } from "child_process";
import * as fs from "fs-extra";
import { expect } from "vitest";

const cliPath = path.join(__dirname, "..", "..", "dist", "fdstruct.js");

export const fdstructCli = (args: string[], workingDirectory: string = ".") => {
  if (!fs.existsSync(cliPath)) {
    expect.fail(`CLI not found at ${cliPath}`);
  }

  const childProcess = spawn("node", [cliPath, ...args], { cwd: workingDirectory });

  const stdoutChunks: Buffer[] = [];
  const stderrChunks: Buffer[] = [];

  childProcess.stdout.on("data", chunk => {
    stdoutChunks.push(chunk);
  });

  childProcess.stderr.on("data", chunk => {
    stderrChunks.push(chunk);
  });

  childProcess.on("error", error => {
    stderrChunks.push(Buffer.from(JSON.stringify(error)));
  });

  return new Promise<{ stderr: string; stdout: string; code: number | null }>((resolve, reject) => {
    setTimeout(() => reject("Timed out"), 50000);
    childProcess.on("exit", code => {
      const stdout = Buffer.concat(stdoutChunks)
        .toString()
        .trim();
      const stderr = Buffer.concat(stderrChunks)
        .toString()
        .trim();

      // TODO: Remove this
      // In order to do that, need to figure out how to block on IO ops, whilst still using async/await
      setTimeout(() => resolve({ stderr, stdout, code }), 2500);
    });
  });
};

export const fdstructCliForWatch = (args: string[], workingDirectory: string = ".") => {
  if (!fs.existsSync(cliPath)) {
    expect.fail(`CLI not found at ${cliPath}`);
  }

  const childProcess = spawn("node", [cliPath, ...args], { cwd: workingDirectory });

  const stdoutChunks: Buffer[] = [];
  const stderrChunks: Buffer[] = [];

  childProcess.stdout.on("data", chunk => {
    stdoutChunks.push(chunk);
  });

  childProcess.stderr.on("data", chunk => {
    stderrChunks.push(chunk);
  });

  childProcess.on("error", error => {
    stderrChunks.push(Buffer.from(JSON.stringify(error)));
  });

  const cliExit = new Promise<{ stderr: string; stdout: string; code: number | null }>(
    (resolve, reject) => {
      setTimeout(() => reject("Timed out"), 50000);
      childProcess.on("exit", code => {
        const stdout = Buffer.concat(stdoutChunks)
          .toString()
          .trim();
        const stderr = Buffer.concat(stderrChunks)
          .toString()
          .trim();

        // TODO: Remove this
        // In order to do that, need to figure out how to block on IO ops, whilst still using async/await
        setTimeout(() => resolve({ stderr, stdout, code }), 2500);
      });
    }
  );

  return {
    cliExit,
    killCli: () => {
      console.log("Killing child process");
      childProcess.kill("SIGKILL");
    }
  };
};
