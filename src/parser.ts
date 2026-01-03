import fs from "fs/promises";
import path from "path";
import type { ParsedFile } from "./types.js";

export async function parse(filePath: string): Promise<ParsedFile> {
  const content = await fs.readFile(filePath, "utf-8");
  const name = path.basename(filePath);

  const functions: string[] = [];
  const constants: string[] = [];
  const types: string[] = [];
  const components: string[] = [];

  // Export function
  for (const match of content.matchAll(
    /export\s+(?:async\s+)?function\s+(\w+)/g
  )) {
    const fn = match[1];
    isPascalCase(fn) ? components.push(fn) : functions.push(fn);
  }

  // Export const
  for (const match of content.matchAll(/export\s+const\s+(\w+)\s*=/g)) {
    const n = match[1];
    if (isPascalCase(n)) {
      components.push(n);
    } else if (n.startsWith("use")) {
      functions.push(n);
    } else {
      constants.push(n);
    }
  }

  // Types & interfaces
  for (const match of content.matchAll(
    /export\s+(?:type|interface)\s+(\w+)/g
  )) {
    types.push(match[1]);
  }

  return {
    path: filePath,
    name,
    exports: { functions, constants, types, components },
  };
}

function isPascalCase(str: string): boolean {
  return /^[A-Z][a-zA-Z0-9]*$/.test(str);
}
