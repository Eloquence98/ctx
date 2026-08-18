import fs from "fs/promises";
import path from "path";
import ignore, { type Ignore } from "ignore";

/** Directories and files always ignored by export-tree */
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

/** File extensions included in scan results */
const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

/**
 * Loads the target directory's .gitignore rules.
 */
async function loadGitignore(dir: string): Promise<Ignore> {
  const gitignore = ignore();

  try {
    const content = await fs.readFile(path.join(dir, ".gitignore"), "utf-8");

    gitignore.add(content);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  return gitignore;
}

/**
 * Recursively scans a directory for JavaScript/TypeScript files.
 * Applies export-tree's built-in ignores and .gitignore rules.
 *
 * @param dir - The directory path to scan
 * @returns Array of absolute file paths
 */
export async function scan(dir: string): Promise<string[]> {
  const files: string[] = [];
  const gitignore = await loadGitignore(dir);

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
      const relative = path.relative(dir, full).split(path.sep).join("/");

      if (gitignore.ignores(entry.isDirectory() ? `${relative}/` : relative)) {
        continue;
      }

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
