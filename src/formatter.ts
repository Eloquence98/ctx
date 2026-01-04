import path from "path";
import type { ParsedFile } from "./types.js";

interface TreeNode {
  name: string;
  exports?: string[];
  children: Map<string, TreeNode>;
}

export function format(files: ParsedFile[], baseDir: string): string {
  // Build tree structure
  const root: TreeNode = { name: path.basename(baseDir), children: new Map() };

  for (const file of files) {
    const rel = path.relative(baseDir, file.path);
    const parts = rel.split(path.sep);

    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;

      if (!current.children.has(part)) {
        current.children.set(part, {
          name: part,
          children: new Map(),
          exports: isFile ? file.exports : undefined,
        });
      } else if (isFile) {
        current.children.get(part)!.exports = file.exports;
      }

      current = current.children.get(part)!;
    }
  }

  // Render tree
  const lines: string[] = [];
  lines.push(root.name + "/");
  renderTree(root, "", lines);

  return lines.join("\n");
}

function renderTree(node: TreeNode, prefix: string, lines: string[]): void {
  const children = [...node.children.values()];

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const isLast = i === children.length - 1;
    const connector = isLast ? "└─ " : "├─ ";
    const extension = isLast ? "   " : "│  ";

    // Is it a file (has exports defined) or folder?
    const isFile = child.exports !== undefined;

    if (isFile) {
      const exportsStr =
        child.exports!.length > 0 ? ` → ${child.exports!.join(", ")}` : "";
      lines.push(prefix + connector + child.name + exportsStr);
    } else {
      lines.push(prefix + connector + child.name + "/");
      renderTree(child, prefix + extension, lines);
    }
  }
}
