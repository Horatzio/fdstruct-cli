import { NodeVisitor } from "./node-visitor";

export interface TopLevelFolderStructure {
  folders: FolderNode[];
  // variables: Record<string, string>;
}

export abstract class FDStructNode {
  public name: string;
  public parentPath: string;

  public get path(): string {
    return `${this.parentPath}/${this.name}`;
  }

  public constructor(name: string, path: string) {
    this.name = name;
    this.parentPath = path;
  }

  public abstract accept(visitor: NodeVisitor): void;
  public abstract isEqual(node: FDStructNode): boolean;
}

export class FileNode extends FDStructNode {
  public constructor(name: string, path: string) {
    super(name, path);
  }

  public accept(visitor: NodeVisitor): void {
    visitor.visitFile(this);
  }

  public isEqual(node: FDStructNode): boolean {
    return node instanceof FileNode && node.name === this.name && node.path === this.path;
  }
}

export class LinkNode extends FDStructNode {
  public target: string;

  public constructor(name: string, path: string, target: string) {
    super(name, path);
    this.target = target;
  }

  public accept(visitor: NodeVisitor): void {
    visitor.visitLinkEntry(this);
  }

  public isEqual(node: FDStructNode): boolean {
    return (
      node instanceof LinkNode &&
      node.name === this.name &&
      node.path === this.path &&
      node.target === this.target
    );
  }
}

export class FolderNode extends FDStructNode {
  public children: FDStructNode[];

  public constructor(name: string, path: string, children: FDStructNode[] = []) {
    super(name, path);
    this.children = children;
  }

  public accept(visitor: NodeVisitor): void {
    visitor.visitFolder(this);
  }

  public isEqual(node: FDStructNode): boolean {
    return node instanceof FolderNode && node.name === this.name && node.path === this.path;
  }

  public static isFolder(node: FDStructNode): node is FolderNode | VirtualFolderNode {
    return node instanceof FolderNode || node instanceof VirtualFolderNode;
  }
}

export class VirtualFolderNode extends FolderNode {
  public target: string;
  public constructor(name: string, path: string, target: string, children: FDStructNode[] = []) {
    super(name, path, children);
    this.target = target;
  }

  public accept(visitor: NodeVisitor): void {
    visitor.visitVirtualFolder(this);
  }

  public isEqual(node: FDStructNode): boolean {
    return (
      node instanceof VirtualFolderNode &&
      node.name === this.name &&
      node.path === this.path &&
      node.target === this.target
    );
  }
}

export class VirtualLinkNode extends FDStructNode {
  public declare parent: VirtualFolderNode;

  public constructor(name: string, path: string, parent: VirtualFolderNode) {
    super(name, path);
    this.parent = parent;
  }

  public accept(visitor: NodeVisitor): void {
    visitor.visitVirtualLink(this);
  }

  public isEqual(node: FDStructNode): boolean {
    return node instanceof VirtualLinkNode && node.name === this.name && node.path === this.path;
  }
}
