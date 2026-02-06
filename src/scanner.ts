import fs from "fs/promises";
import path from "path";

/** Directories and files to ignore during scanning */
const IGNORE = [
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  ".env",
  ".env.local",
  ".env.production",
  "__pycache__",
  ".vscode",
  ".idea",
  "coverage",
];

/** File extensions to include in scan results */
const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

/**
 * Recursively scans a directory for JavaScript/TypeScript files.
 * Ignores node_modules, build outputs, hidden files, and test files.
 *
 * @param dir - The directory path to scan
 * @returns Array of absolute file paths
 *
 * @example
 * const files = await scan("./src");
 * // ["/project/src/index.ts", "/project/src/utils.ts", ...]
 */
export async function scan(dir: string): Promise<string[]> {
  const files: string[] = [];

  async function walk(current: string) {
    let entries;
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (IGNORE.includes(entry.name)) continue;
      if (entry.name.startsWith(".")) continue;
      if (entry.name.includes(".test.")) continue;
      if (entry.name.includes(".spec.")) continue;

      const full = path.join(current, entry.name);

      if (entry.isDirectory()) {
        await walk(full);
      } else if (EXTENSIONS.includes(path.extname(entry.name))) {
        files.push(full);
      }
    }
  }

  await walk(dir);
  return files;
}
