import fs from "fs/promises";
import path from "path";
import type { ParsedFile } from "./types.js";

export async function parse(filePath: string): Promise<ParsedFile> {
  const content = await fs.readFile(filePath, "utf-8");
  const name = path.basename(filePath);
  const exports: string[] = [];

  // export function Name
  for (const match of content.matchAll(
    /export\s+(?:async\s+)?function\s+(\w+)/g
  )) {
    exports.push(match[1]);
  }

  // export const Name
  for (const match of content.matchAll(/export\s+const\s+(\w+)/g)) {
    exports.push(match[1]);
  }

  // export type/interface Name
  for (const match of content.matchAll(
    /export\s+(?:type|interface)\s+(\w+)/g
  )) {
    exports.push(match[1]);
  }

  // export class Name
  for (const match of content.matchAll(/export\s+class\s+(\w+)/g)) {
    exports.push(match[1]);
  }

  // export default function Name / class Name
  for (const match of content.matchAll(
    /export\s+default\s+(?:function|class)\s+(\w+)/g
  )) {
    exports.push(match[1]);
  }

  return { path: filePath, name, exports };
}
