import fs from "fs/promises";
import path from "path";

const IGNORE = ["node_modules", ".git", "dist", ".next", "build", "__tests__"];
const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

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

      const full = path.join(current, entry.name);

      if (entry.isDirectory()) {
        await walk(full);
      } else if (EXTENSIONS.includes(path.extname(entry.name))) {
        if (!entry.name.includes(".test.") && !entry.name.includes(".spec.")) {
          files.push(full);
        }
      }
    }
  }

  await walk(dir);
  return files;
}
