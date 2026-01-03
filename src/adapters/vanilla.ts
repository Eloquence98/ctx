import path from "path";
import type { FileExports } from "../types.js";
import type { Adapter, AdapterContext } from "./types.js";

export const vanillaAdapter: Adapter = {
  name: "vanilla",

  async detect(): Promise<boolean> {
    // Always returns true - this is the fallback
    return true;
  },

  async analyze(dir: string, files: FileExports[]): Promise<AdapterContext> {
    const sections = new Map<string, FileExports[]>();

    for (const file of files) {
      const relativePath = path.relative(dir, file.filePath);
      const parts = relativePath.split(path.sep);

      const folder = parts.length > 1 ? parts[0] : "_root";

      if (!sections.has(folder)) {
        sections.set(folder, []);
      }
      sections.get(folder)!.push(file);
    }

    return {
      projectType: "JavaScript/TypeScript",
      sections,
    };
  },
};
