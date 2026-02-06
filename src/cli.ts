#!/usr/bin/env node

/**
 * CLI entry point for ctx.
 * Scans a directory, parses exports, and prints a formatted tree.
 *
 * @example
 * npx ctx ./src
 */

import path from "path";
import { format } from "./formatter.js";
import { parse } from "./parser.js";
import { scan } from "./scanner.js";

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

  const parsed = await Promise.all(files.map(parse));

  console.log(format(parsed, dir));
}

main().catch(console.error);
