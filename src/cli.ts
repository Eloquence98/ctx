#!/usr/bin/env node

import { program } from "commander";
import path from "path";
import fs from "fs/promises";
import { scanDirectory, getRoutes } from "./scanner.js";
import { parseFile } from "./parser.js";
import { formatMarkdown } from "./formatters/index.js";
import type { FileExports, ProjectContext } from "./types.js";
import { detectProject, getProjectLabel } from "./detectors/index.js";

program
  .name("ctx")
  .description("Generate AI-ready context from your codebase")
  .version("0.1.4")
  .argument("[path]", "Path to scan", "./src")
  .option("-o, --output <format>", "Output format: md, json", "md")
  .option("--ai", "Output in AI-optimized compact format")
  .action(async (targetPath: string, options) => {
    const absolutePath = path.resolve(process.cwd(), targetPath);

    // Detect project type
    const projectRoot = await findProjectRoot(absolutePath);
    const projectType = await detectProject(projectRoot);

    console.log(`\n📁 Scanning ${absolutePath}...\n`);
    console.log(`📦 Detected: ${getProjectLabel(projectType)}\n`);

    try {
      // Scan all files
      const files = await scanDirectory(absolutePath);

      if (files.length === 0) {
        console.log("No files found. Check your path.");
        process.exit(1);
      }

      // Parse all files
      const parsedFiles = await Promise.all(
        files.map((file) => parseFile(file))
      );

      // Get routes - try to find app directory
      let routes: string[] = [];
      const appDir = await findAppDirectory(absolutePath);
      if (appDir) {
        routes = await getRoutes(appDir);
      }

      // Build context
      const context: ProjectContext = {
        routes,
        features: groupByFolder(parsedFiles, absolutePath, "features"),
        hooks: getHooks(parsedFiles),
        lib: groupByFolder(parsedFiles, absolutePath, "lib"),
        components: groupByFolder(parsedFiles, absolutePath, "components"),
      };

      // Output
      if (options.ai) {
        const { formatAI } = await import("./formatters/ai.js");
        console.log(formatAI(context, absolutePath));
      } else if (options.output === "json") {
        console.log(JSON.stringify(contextToJSON(context), null, 2));
      } else {
        console.log(formatMarkdown(context, absolutePath));
      }
    } catch (error) {
      console.error("Error:", error);
      process.exit(1);
    }
  });

async function findProjectRoot(startDir: string): Promise<string> {
  let current = startDir;

  while (current !== path.dirname(current)) {
    try {
      await fs.access(path.join(current, "package.json"));
      return current;
    } catch {
      current = path.dirname(current);
    }
  }

  return startDir;
}

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
      // try next
    }
  }

  return null;
}

function groupByFolder(
  files: FileExports[],
  basePath: string,
  folderName: string
): Map<string, FileExports[]> {
  const grouped = new Map<string, FileExports[]>();

  for (const file of files) {
    const relativePath = path.relative(basePath, file.filePath);
    const parts = relativePath.split(path.sep);

    const folderIndex = parts.indexOf(folderName);

    if (folderIndex === -1) continue;

    const remainingParts = parts.slice(folderIndex + 1);

    // Need at least 2 parts: subfolder + filename
    if (remainingParts.length < 2) continue;

    const subFolder = remainingParts[0];

    if (!grouped.has(subFolder)) {
      grouped.set(subFolder, []);
    }
    grouped.get(subFolder)!.push(file);
  }

  return grouped;
}

function getHooks(files: FileExports[]): FileExports[] {
  return files.filter(
    (f) =>
      f.filePath.includes("/hooks/") ||
      f.filePath.includes("\\hooks\\") ||
      f.fileName.startsWith("use-") ||
      f.fileName.startsWith("use.")
  );
}

function contextToJSON(context: ProjectContext): object {
  return {
    routes: context.routes,
    features: Object.fromEntries(context.features),
    hooks: context.hooks,
    lib: Object.fromEntries(context.lib),
    components: Object.fromEntries(context.components),
  };
}

program.parse();
