#!/usr/bin/env node

import path from "path";
import { scan } from "./scanner.js";
import { parse } from "./parser.js";
import { organize } from "./organizer.js";
import { formatAI } from "./formatters/ai.js";
import { formatHuman } from "./formatters/human.js";

const args = process.argv.slice(2);
const targetPath = args.find((a) => !a.startsWith("-")) || ".";
const humanMode = args.includes("--human");

async function main() {
  const dir = path.resolve(process.cwd(), targetPath);

  // 1. Scan
  const files = await scan(dir);

  if (files.length === 0) {
    console.log("No files found.");
    process.exit(1);
  }

  // 2. Parse
  const parsed = await Promise.all(files.map(parse));

  // 3. Organize
  const context = await organize(parsed, dir);

  // 4. Format
  const output = humanMode ? formatHuman(context) : formatAI(context);

  console.log(output);
}

main().catch(console.error);
