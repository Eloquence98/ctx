import fs from "fs/promises";
import path from "path";
import type { FileExports } from "./types.js";

export async function parseFile(filePath: string): Promise<FileExports> {
  const content = await fs.readFile(filePath, "utf-8");
  const fileName = path.basename(filePath);

  return {
    filePath,
    fileName,
    functions: extractFunctions(content),
    constants: extractConstants(content),
    types: extractTypes(content),
    interfaces: extractInterfaces(content),
    classes: extractClasses(content),
    defaultExport: extractDefaultExport(content),
  };
}

function extractFunctions(content: string): string[] {
  const functions: string[] = [];

  // export function name
  const funcMatches = content.matchAll(
    /export\s+(?:async\s+)?function\s+(\w+)/g
  );
  for (const match of funcMatches) {
    functions.push(match[1]);
  }

  // export const name = async? (...) => or function(
  const arrowMatches = content.matchAll(
    /export\s+const\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[a-zA-Z_]\w*)\s*(?:=>|\{)/g
  );
  for (const match of arrowMatches) {
    if (!functions.includes(match[1])) {
      functions.push(match[1]);
    }
  }

  return functions;
}

function extractConstants(content: string): string[] {
  const constants: string[] = [];

  // Match export const that are NOT functions
  const lines = content.split("\n");

  for (const line of lines) {
    // export const NAME = value (not a function)
    const match = line.match(
      /export\s+const\s+(\w+)\s*=\s*(?!(?:async\s*)?(?:\(|function|\w+\s*=>))/
    );
    if (match) {
      constants.push(match[1]);
    }

    // Also catch: export const NAME: Type =
    const typedMatch = line.match(
      /export\s+const\s+(\w+)\s*:\s*[^=]+=\s*(?!(?:async\s*)?(?:\(|function|\w+\s*=>))/
    );
    if (typedMatch && !constants.includes(typedMatch[1])) {
      constants.push(typedMatch[1]);
    }
  }

  return constants;
}

function extractTypes(content: string): string[] {
  const matches = content.matchAll(/export\s+type\s+(\w+)/g);
  return [...matches].map((m) => m[1]);
}

function extractInterfaces(content: string): string[] {
  const matches = content.matchAll(/export\s+interface\s+(\w+)/g);
  return [...matches].map((m) => m[1]);
}

function extractClasses(content: string): string[] {
  const matches = content.matchAll(/export\s+(?:default\s+)?class\s+(\w+)/g);
  return [...matches].map((m) => m[1]);
}

function extractDefaultExport(content: string): string | undefined {
  // export default function Name
  const funcMatch = content.match(/export\s+default\s+function\s+(\w+)/);
  if (funcMatch) return funcMatch[1];

  // export default Name
  const simpleMatch = content.match(/export\s+default\s+(\w+)/);
  if (simpleMatch) return simpleMatch[1];

  return undefined;
}
