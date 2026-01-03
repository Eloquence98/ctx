import fs from "fs/promises";
import path from "path";
import type { FileExports } from "../types.js";
import type { Adapter, AdapterContext } from "./types.js";

export const expressAdapter: Adapter = {
  name: "express",

  async detect(dir: string): Promise<boolean> {
    try {
      const pkg = await fs.readFile(path.join(dir, "package.json"), "utf-8");
      const parsed = JSON.parse(pkg);
      const deps = { ...parsed.dependencies, ...parsed.devDependencies };
      return (
        "express" in deps ||
        "fastify" in deps ||
        "koa" in deps ||
        "hono" in deps
      );
    } catch {
      return false;
    }
  },

  async analyze(dir: string, files: FileExports[]): Promise<AdapterContext> {
    const sections = new Map<string, FileExports[]>();

    const folderMappings: Record<string, string[]> = {
      Routes: ["routes", "routers", "api"],
      Controllers: ["controllers", "handlers"],
      Services: ["services"],
      Models: ["models", "entities", "schemas"],
      Middleware: ["middleware", "middlewares"],
      Utils: ["utils", "helpers", "lib"],
      Config: ["config", "configs"],
    };

    for (const file of files) {
      const relativePath = path.relative(dir, file.filePath);
      const parts = relativePath.split(path.sep);

      let matched = false;

      for (const [sectionName, folders] of Object.entries(folderMappings)) {
        const folderIndex = parts.findIndex((p) =>
          folders.includes(p.toLowerCase())
        );

        if (folderIndex !== -1) {
          if (!sections.has(sectionName)) {
            sections.set(sectionName, []);
          }
          sections.get(sectionName)!.push(file);
          matched = true;
          break;
        }
      }

      if (!matched) {
        const folder = parts.length > 1 ? parts[0] : "_root";
        if (!sections.has(folder)) {
          sections.set(folder, []);
        }
        sections.get(folder)!.push(file);
      }
    }

    return {
      projectType: "Express/Fastify",
      sections,
    };
  },
};
