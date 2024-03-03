import * as fs from "fs-extra";
import * as os from "os";
import * as path from "path";
import { SymLinksNotEnabledException } from "./exception/exceptions";

export async function validateSymlinksEnabled() {
  try {
    await verifyCanCreateSymlink();
  } catch (e) {
    if (SymLinksNotEnabledException.isInstance(e)) {
      console.log(`ERROR: ${e.message}`);
    } else {
      console.log(`ERROR: Unable to verify if symlinks are enabled on the system.`);
    }
    console.log(
      `FDstruct CLI makes use of symlinks for most of its features. Please enable symlinks.`
    );
    return false;
  }
  return true;
}

export async function verifyCanCreateSymlink() {
  const tempDir = os.tmpdir();
  const tempFile = path.join(tempDir, "fdstruct-temp.txt");
  const tempSymlink = path.join(tempDir, "fdstruct-temp-symlink.txt");

  await fs.writeFile(tempFile, "This is a dummy file used to verify if symlinks are enabled");
  try {
    await fs.symlink(tempFile, tempSymlink);
  } catch (e) {
    throw new SymLinksNotEnabledException(
      "Unable to create symlink. Please verify if symlinks are enabled on this system."
    );
  }
  if (await fs.exists(tempSymlink)) {
    await fs.unlink(tempSymlink);
    await fs.remove(tempFile);
  }
}
