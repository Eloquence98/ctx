import path from "path";
import type { ParsedFile } from "./types.js";

/**
 * Internal tree node for building directory structure.
 */
interface TreeNode {
  /** Directory or file name */
  name: string;
  /** Export names (only for files) */
  exports?: string[];
  /** Child nodes (subdirectories and files) */
  children: Map<string, TreeNode>;
}

/**
 * Formats parsed files into a tree-style string representation.
 *
 * @param files - Array of parsed files
 * @param baseDir - Root directory path for relative path calculation
 * @returns Formatted tree string
 *
 * @example
 * const output = format(parsedFiles, "/project/src");
 * // src/
 * // ├─ index.ts → main
 * // └─ utils.ts → format, parse
 */
export function format(files: ParsedFile[], baseDir: string): string {
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

  const lines: string[] = [];
  lines.push(root.name + "/");
  renderTree(root, "", lines);

  return lines.join("\n");
}

/**
 * Recursively renders tree nodes into formatted lines.
 *
 * @param node - Current tree node
 * @param prefix - Indentation prefix for current depth
 * @param lines - Output array to append lines to
 */
function renderTree(node: TreeNode, prefix: string, lines: string[]): void {
  const children = [...node.children.values()];

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const isLast = i === children.length - 1;
    const connector = isLast ? "└─ " : "├─ ";
    const extension = isLast ? "   " : "│  ";

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
