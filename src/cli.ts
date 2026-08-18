#!/usr/bin/env node

/**
 * CLI entry point for export-tree.
 * Scans a directory, parses exports, and prints a formatted tree.
 *
 * @example
 * npx export-tree ./src
 */

import path from "path";
import { format } from "./formatter.js";
import { parse } from "./parser.js";
import { isDisplayOnlyFile, scan } from "./scanner.js";

const args = process.argv.slice(2);
const targetPath = args[0] || ".";

/**
 * Main CLI execution flow.
 * Orchestrates scanning → parsing → formatting.
 */
async function main() {
  const dir = path.resolve(process.cwd(), targetPath);

  const files = await scan(dir);

  if (files.length === 0) {
    console.log("No files found.");
    process.exit(1);
  }

  const parsed = await Promise.all(
    files.map((file) =>
      isDisplayOnlyFile(path.basename(file))
        ? {
            path: file,
            name: path.basename(file),
            exports: [],
          }
        : parse(file),
    ),
  );

  console.log(format(parsed, dir));
}

main().catch(console.error);
