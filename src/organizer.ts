import path from "path";
import fs from "fs/promises";
import type { ParsedFile, OrganizedContext } from "./types.js";

export async function organize(
  files: ParsedFile[],
  baseDir: string
): Promise<OrganizedContext> {
  const routes = await getRoutes(baseDir);

  const components: ParsedFile[] = [];
  const hooks: ParsedFile[] = [];
  const utils: ParsedFile[] = [];
  const other: ParsedFile[] = [];

  for (const file of files) {
    const rel = file.path.toLowerCase();
    const hasHooks = file.exports.functions.some((fn) => fn.startsWith("use"));

    if (hasHooks || file.name.startsWith("use") || rel.includes("/hooks/")) {
      hooks.push(file);
    } else if (rel.includes("/components/") || rel.includes("/ui/")) {
      components.push(file);
    } else if (
      rel.includes("/lib/") ||
      rel.includes("/utils/") ||
      rel.includes("/helpers/")
    ) {
      utils.push(file);
    } else if (!rel.includes("/app/") && !rel.includes("/pages/")) {
      other.push(file);
    }
  }

  return { routes, components, hooks, utils, other };
}

async function getRoutes(baseDir: string): Promise<string[]> {
  const possibleDirs = [
    path.join(baseDir, "app"),
    path.join(baseDir, "src", "app"),
    path.join(baseDir, "pages"),
    path.join(baseDir, "src", "pages"),
  ];

  for (const dir of possibleDirs) {
    try {
      await fs.access(dir);
      return walkRoutes(dir, "");
    } catch {
      continue;
    }
  }

  return [];
}

async function walkRoutes(dir: string, prefix: string): Promise<string[]> {
  const routes: string[] = [];

  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return routes;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith("_")) continue;
    if (entry.name.startsWith("(")) continue;
    if (entry.name === "api") continue;

    const route = prefix + "/" + entry.name;
    routes.push(route);
    routes.push(...(await walkRoutes(path.join(dir, entry.name), route)));
  }

  return routes;
}
