#!/usr/bin/env node

import { program } from "commander";
import fs from "fs/promises";
import path from "path";
import { getAdapter } from "./adapters/index.js";
import { detectProject, getProjectLabel } from "./detectors/index.js";
import { formatAIOptimized } from "./formatters/ai-optimized.js";
import { formatHuman } from "./formatters/human.js";
import { formatRaw } from "./formatters/raw.js";
import { parseFile } from "./parser.js";
import { scanDirectory } from "./scanner.js";

program
  .name("ctx")
  .description("Generate AI-ready context from your codebase")
  .version("0.1.5")
  .argument("[path]", "Path to scan", ".")
  .option("--human", "Human-readable output for onboarding")
  .option("--raw", "Verbose output with all details")
  .option("-o, --output <format>", "Output format: json", "")
  .action(async (targetPath: string, options) => {
    const absolutePath = path.resolve(process.cwd(), targetPath);

    const projectRoot = await findProjectRoot(absolutePath);
    const projectType = await detectProject(projectRoot);
    const adapter = getAdapter(projectType);

    // Only show scanning message for human/raw modes
    if (options.human || options.raw) {
      console.log(`\n📁 Scanning ${absolutePath}...`);
      console.log(`📦 Detected: ${getProjectLabel(projectType)}\n`);
    }

    try {
      const files = await scanDirectory(absolutePath);

      if (files.length === 0) {
        console.log("No files found. Check your path.");
        process.exit(1);
      }

      const parsedFiles = await Promise.all(
        files.map((file) => parseFile(file))
      );

      const context = await adapter.analyze(absolutePath, parsedFiles);

      // Output based on flags
      if (options.output === "json") {
        console.log(JSON.stringify(contextToJSON(context), null, 2));
      } else if (options.raw) {
        console.log(formatRaw(context));
      } else if (options.human) {
        console.log(formatHuman(context));
      } else {
        // Default: AI-optimized
        console.log(formatAIOptimized(context));
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
