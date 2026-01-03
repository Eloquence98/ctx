import fs from "fs/promises";
import path from "path";

export type ProjectType =
  | "nextjs"
  | "react"
  | "express"
  | "nestjs"
  | "vue"
  | "sveltekit"
  | "node"
  | "vanilla";

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

async function readPackageJson(dir: string): Promise<PackageJson | null> {
  try {
    const content = await fs.readFile(path.join(dir, "package.json"), "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function detectProject(dir: string): Promise<ProjectType> {
  const pkg = await readPackageJson(dir);
  const deps = {
    ...pkg?.dependencies,
    ...pkg?.devDependencies,
  };

  // Check config files first (more specific)
  const hasNextConfig =
    (await fileExists(path.join(dir, "next.config.js"))) ||
    (await fileExists(path.join(dir, "next.config.mjs"))) ||
    (await fileExists(path.join(dir, "next.config.ts")));

  if (hasNextConfig || deps["next"]) {
    return "nextjs";
  }

  // NestJS
  if (deps["@nestjs/core"]) {
    return "nestjs";
  }

  // SvelteKit
  if (deps["@sveltejs/kit"]) {
    return "sveltekit";
  }

  // Vue
  if (deps["vue"] || deps["nuxt"]) {
    return "vue";
  }

  // Express
  if (deps["express"] || deps["fastify"] || deps["koa"] || deps["hono"]) {
    return "express";
  }

  // React (without Next.js)
  if (deps["react"] && !deps["next"]) {
    return "react";
  }

  // Node.js project (has package.json but no framework)
  if (pkg) {
    return "node";
  }

  // No package.json
  return "vanilla";
}

export function getProjectLabel(type: ProjectType): string {
  const labels: Record<ProjectType, string> = {
    nextjs: "Next.js",
    react: "React",
    express: "Express/Fastify",
    nestjs: "NestJS",
    vue: "Vue/Nuxt",
    sveltekit: "SvelteKit",
    node: "Node.js",
    vanilla: "JavaScript/TypeScript",
  };
  return labels[type];
}
