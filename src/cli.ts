#!/usr/bin/env node

import path from "path";
import { scan } from "./scanner.js";
import { parse } from "./parser.js";
import { format } from "./formatter.js";

const args = process.argv.slice(2);
const targetPath = args[0] || ".";

async function main() {
  const dir = path.resolve(process.cwd(), targetPath);

  // Scan
  const files = await scan(dir);

  if (files.length === 0) {
    console.log("No files found.");
    process.exit(1);
  }

  // Parse
  const parsed = await Promise.all(files.map(parse));

  // Format and print
  console.log(format(parsed, dir));
}

main().catch(console.error);
