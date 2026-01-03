import fs from "fs/promises";
import path from "path";
import { getRoutes } from "../scanner.js";
import type { FileExports } from "../types.js";
import type { Adapter, AdapterContext } from "./types.js";

export const nextjsAdapter: Adapter = {
  name: "nextjs",

  async detect(dir: string): Promise<boolean> {
    const configFiles = ["next.config.js", "next.config.mjs", "next.config.ts"];

    for (const file of configFiles) {
      try {
        await fs.access(path.join(dir, file));
        return true;
      } catch {
        continue;
      }
    }

    // Check package.json for next dependency
    try {
      const pkg = await fs.readFile(path.join(dir, "package.json"), "utf-8");
      const parsed = JSON.parse(pkg);
      const deps = { ...parsed.dependencies, ...parsed.devDependencies };
      return "next" in deps;
    } catch {
      return false;
    }
  },

  async analyze(dir: string, files: FileExports[]): Promise<AdapterContext> {
    const sections = new Map<string, FileExports[]>();

    // Get routes
    let routes: string[] = [];
    const appDir = await findAppDirectory(dir);
    if (appDir) {
      routes = await getRoutes(appDir);
    }

    // Group by known Next.js folders
    const folderMappings: Record<string, string[]> = {
      Features: ["features", "modules", "domains"],
      Components: ["components"],
      Hooks: ["hooks"],
      Lib: ["lib", "utils", "helpers", "services"],
      API: ["api"],
    };

    for (const file of files) {
      const relativePath = path.relative(dir, file.filePath);
      const parts = relativePath.split(path.sep);

      let matched = false;

      for (const [sectionName, folders] of Object.entries(folderMappings)) {
        const folderIndex = parts.findIndex((p) => folders.includes(p));

        if (folderIndex !== -1) {
          const subParts = parts.slice(folderIndex + 1);

          if (subParts.length >= 1) {
            // Use subfolder name if exists, otherwise use section name
            const subFolder = subParts.length > 1 ? subParts[0] : "_direct";
            const key =
              subFolder === "_direct"
                ? sectionName
                : `${sectionName}/${subParts[0]}`;

            if (!sections.has(key)) {
              sections.set(key, []);
            }
            sections.get(key)!.push(file);
            matched = true;
            break;
          }
        }
      }

      // If no match, group by top folder
      if (!matched) {
        const folder = parts.length > 1 ? parts[0] : "_root";
        const key = `Other/${folder}`;

        if (!sections.has(key)) {
          sections.set(key, []);
        }
        sections.get(key)!.push(file);
      }
    }

    return {
      projectType: "Next.js",
      sections,
      routes,
    };
  },
};

async function findAppDirectory(basePath: string): Promise<string | null> {
  const possiblePaths = [
    path.join(basePath, "app"),
    path.join(basePath, "src", "app"),
    path.join(basePath, "src/app"),
  ];

  for (const p of possiblePaths) {
    try {
      const stat = await fs.stat(p);
      if (stat.isDirectory()) {
        return p;
      }
    } catch {
      continue;
    }
  }

  return null;
}
