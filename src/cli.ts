#!/usr/bin/env node

import { program } from "commander";
import path from "path";
import fs from "fs/promises";
import { scanDirectory } from "./scanner.js";
import { parseFile } from "./parser.js";
import { detectProject, getProjectLabel } from "./detectors/index.js";
import { getAdapter } from "./adapters/index.js";
import { formatMarkdown } from "./formatters/markdown.js";
import { formatAI } from "./formatters/ai.js";

program
  .name("ctx")
  .description("Generate AI-ready context from your codebase")
  .version("0.1.4")
  .argument("[path]", "Path to scan", ".")
  .option("-o, --output <format>", "Output format: md, json", "md")
  .option("--ai", "Output in AI-optimized compact format")
  .action(async (targetPath: string, options) => {
    const absolutePath = path.resolve(process.cwd(), targetPath);

    // Find project root and detect type
    const projectRoot = await findProjectRoot(absolutePath);
    const projectType = await detectProject(projectRoot);
    const adapter = getAdapter(projectType);

    console.log(`\n📁 Scanning ${absolutePath}...`);
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

      // Use adapter to analyze
      const context = await adapter.analyze(absolutePath, parsedFiles);

      // Output
      if (options.output === "json") {
        console.log(JSON.stringify(contextToJSON(context), null, 2));
      } else if (options.ai) {
        console.log(formatAI(context));
      } else {
        console.log(formatMarkdown(context));
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

function contextToJSON(context: any): object {
  return {
    projectType: context.projectType,
    routes: context.routes || [],
    sections: Object.fromEntries(context.sections),
  };
}

program.parse();
