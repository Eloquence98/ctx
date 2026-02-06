import fs from "fs/promises";
import path from "path";
import type { ParsedFile } from "./types.js";

/**
 * Parses a source file and extracts exported symbol names.
 * Supports both ES modules and CommonJS exports.
 *
 * @param filePath - Absolute path to the file
 * @returns Parsed file object with export names
 *
 * @example
 * const result = await parse("./src/utils.ts");
 * // { path: "./src/utils.ts", name: "utils.ts", exports: ["format", "parse"] }
 */
export async function parse(filePath: string): Promise<ParsedFile> {
  let content = await fs.readFile(filePath, "utf-8");
  const name = path.basename(filePath);
  const exports: string[] = [];

  // Remove comments to avoid false positives from commented-out code
  content = stripComments(content);

  // === ES Module Exports ===

  // export function Name
  for (const match of content.matchAll(
    /export\s+(?:async\s+)?function\s+(\w+)/g,
  )) {
    exports.push(match[1]);
  }

  // export const/let/var Name
  for (const match of content.matchAll(/export\s+(?:const|let|var)\s+(\w+)/g)) {
    exports.push(match[1]);
  }

  // export type/interface Name
  for (const match of content.matchAll(
    /export\s+(?:type|interface)\s+(\w+)/g,
  )) {
    exports.push(match[1]);
  }

  // export class Name
  for (const match of content.matchAll(/export\s+class\s+(\w+)/g)) {
    exports.push(match[1]);
  }

  // export default function Name / class Name
  for (const match of content.matchAll(
    /export\s+default\s+(?:function|class)\s+(\w+)/g,
  )) {
    exports.push(match[1]);
  }

  // === CommonJS Exports ===

  // module.exports.name = ...
  for (const match of content.matchAll(/module\.exports\.(\w+)\s*=/g)) {
    exports.push(match[1]);
  }

  // exports.name = ... (but not module.exports.name)
  for (const match of content.matchAll(/(?<!module\.)exports\.(\w+)\s*=/g)) {
    exports.push(match[1]);
  }

  // module.exports = { name1, name2: value, ... }
  for (const match of content.matchAll(/module\.exports\s*=\s*\{/g)) {
    const startIdx = match.index! + match[0].length;
    const objectExports = parseExportsObject(content, startIdx);
    exports.push(...objectExports);
  }

  // module.exports = function name() {} or async function name() {}
  for (const match of content.matchAll(
    /module\.exports\s*=\s*(?:async\s+)?function\s+(\w+)/g,
  )) {
    exports.push(match[1]);
  }

  // module.exports = class Name {}
  for (const match of content.matchAll(
    /module\.exports\s*=\s*class\s+(\w+)/g,
  )) {
    exports.push(match[1]);
  }

  // module.exports = Identifier (e.g., module.exports = MyClass;)
  for (const match of content.matchAll(
    /module\.exports\s*=\s*([A-Z]\w*)\s*;?\s*$/gm,
  )) {
    exports.push(match[1]);
  }

  return { path: filePath, name, exports: [...new Set(exports)] };
}

/**
 * Removes single-line (//) and multi-line (/* *\/) comments from source code.
 * Preserves string literals to avoid breaking code structure.
 *
 * @param code - Raw source code
 * @returns Code with comments removed
 */
function stripComments(code: string): string {
  let result = "";
  let i = 0;

  while (i < code.length) {
    // Handle string literals - don't strip inside strings
    if (code[i] === '"' || code[i] === "'" || code[i] === "`") {
      const quote = code[i];
      result += code[i++];
      while (i < code.length && code[i] !== quote) {
        if (code[i] === "\\") {
          result += code[i++];
        }
        if (i < code.length) {
          result += code[i++];
        }
      }
      if (i < code.length) {
        result += code[i++];
      }
    }
    // Single-line comment
    else if (code[i] === "/" && code[i + 1] === "/") {
      while (i < code.length && code[i] !== "\n") {
        i++;
      }
    }
    // Multi-line comment
    else if (code[i] === "/" && code[i + 1] === "*") {
      i += 2;
      while (i < code.length && !(code[i] === "*" && code[i + 1] === "/")) {
        i++;
      }
      i += 2;
    }
    // Regular character
    else {
      result += code[i++];
    }
  }

  return result;
}

/**
 * Parses a CommonJS exports object literal and extracts property names.
 * Handles nested objects/arrays by tracking bracket depth.
 *
 * @param content - Source code content
 * @param startIdx - Index where the object literal begins (after opening brace)
 * @returns Array of exported property names
 *
 * @example
 * // For: module.exports = { foo, bar: value }
 * parseExportsObject(content, indexAfterBrace);
 * // Returns: ["foo", "bar"]
 */
function parseExportsObject(content: string, startIdx: number): string[] {
  const exports: string[] = [];
  let depth = 0;
  let i = startIdx;
  let token = "";
  let afterColon = false;

  const keywords = new Set([
    "function",
    "async",
    "class",
    "return",
    "const",
    "let",
    "var",
    "true",
    "false",
    "null",
    "undefined",
    "new",
    "require",
    "await",
  ]);

  while (i < content.length) {
    const char = content[i];

    if (char === "{" || char === "[" || char === "(") {
      depth++;
      token = "";
    } else if (char === "}") {
      if (depth === 0) {
        if (token && !afterColon && !keywords.has(token)) {
          exports.push(token);
        }
        break;
      }
      depth--;
      token = "";
    } else if (char === "]" || char === ")") {
      depth--;
      token = "";
    } else if (depth === 0) {
      if (/[a-zA-Z_$]/.test(char)) {
        token += char;
      } else if (/[0-9]/.test(char) && token) {
        token += char;
      } else if (char === ":") {
        if (token && !keywords.has(token)) {
          exports.push(token);
        }
        token = "";
        afterColon = true;
      } else if (char === ",") {
        if (token && !afterColon && !keywords.has(token)) {
          exports.push(token);
        }
        token = "";
        afterColon = false;
      } else if (/\s/.test(char)) {
        // continue
      } else {
        token = "";
      }
    }

    i++;
  }

  return exports;
}
