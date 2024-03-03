import { InvalidArgumentError as FDstructArgumentException } from "commander";

export { FDstructArgumentException };

export class FDstructException extends Error {
  constructor(message) {
    super();
    this.message = `FDstructException: ${message}`;
  }
}

export class SymLinksNotEnabledException extends Error {
  public type: string = "SymLinksNotEnabledException";
  constructor(message) {
    super();
    this.message = `FDstructException: ${message}`;
  }

  public static isInstance(e: any): e is SymLinksNotEnabledException {
    return e.type === "SymLinksNotEnabledException" && e instanceof Error;
  }
}
