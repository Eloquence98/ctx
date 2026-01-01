import fs from "fs/promises";
import path from "path";
import { defaultConfig } from "./config.js";
import type { ScanOptions } from "./types.js";

export async function scanDirectory(
  dir: string,
  options: Partial<ScanOptions> = {}
): Promise<string[]> {
  const config = { ...defaultConfig, ...options };
  const files: string[] = [];

  async function walk(currentDir: string, depth: number = 0) {
    if (depth > config.maxDepth) return;

    let entries;
    try {
      entries = await fs.readdir(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      // Check ignore patterns
      const shouldIgnore = config.ignore.some((pattern) => {
        if (pattern.includes("*")) {
          const regex = new RegExp(
            pattern.replace(/\./g, "\\.").replace(/\*/g, ".*")
          );
          return regex.test(entry.name);
        }
        return entry.name === pattern;
      });

      if (shouldIgnore) continue;

      if (entry.isDirectory()) {
        await walk(fullPath, depth + 1);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (config.extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }

  await walk(dir);
  return files;
}

export async function getRoutes(appDir: string): Promise<string[]> {
  const routes: string[] = [];

  async function walkRoutes(dir: string, indent: string = "") {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    // Sort: groups first (parentheses), then regular folders
    const sorted = entries
      .filter((e) => e.isDirectory())
      .filter((e) => !e.name.startsWith("_"))
      .sort((a, b) => {
        const aIsGroup = a.name.startsWith("(");
        const bIsGroup = b.name.startsWith("(");
        if (aIsGroup && !bIsGroup) return -1;
        if (!aIsGroup && bIsGroup) return 1;
        return a.name.localeCompare(b.name);
      });

    for (const entry of sorted) {
      routes.push(`${indent}${entry.name}`);
      await walkRoutes(path.join(dir, entry.name), indent + "  ");
    }
  }

  await walkRoutes(appDir);
  return routes;
}
