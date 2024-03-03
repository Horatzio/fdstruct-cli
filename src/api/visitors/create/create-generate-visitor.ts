import { AggregateVisitor } from "../aggregate-visitor";
import { CreateVisitor } from "./create-visitor";
import { LinkVisitor } from "./link-visitor";
import { NodeVisitor } from "../../model/node-visitor";
import { VirtualFolderVisitor } from "./virtual-folder-visitor";

export function createGenerateVisitor(): NodeVisitor {
  return new AggregateVisitor([new CreateVisitor(), new LinkVisitor(), new VirtualFolderVisitor()]);
}
