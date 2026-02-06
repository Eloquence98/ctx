# DOCUMENTATION.md (Developer-Focused)

## Overview

This repository provides a lightweight CLI tool to scan, parse, and visualize exported symbols from JavaScript/TypeScript projects.
It is designed as a developer tool, not for production runtime logic. Its purpose is to provide static insight into your codebase, primarily for refactoring, indexing, or tooling workflows.

---

## /src/cli

**Purpose:**
Entry point for the CLI. Orchestrates scanning, parsing, and formatting of the target directory.

**How it works:**

- Resolves the target directory from CLI arguments (default `.`).
- Calls `scan()` to recursively find files.
- Calls `parse()` on each file to extract exported symbols.
- Calls `format()` to build a hierarchical tree and prints it.

**Why it exists:**
Keeps CLI logic separate from scanning/parsing/formatting. Provides single orchestration point.

**Known limitations / edge cases:**

- Only accepts one directory argument.
- Errors are logged to console but not deeply handled.
- Exits if no files are found.

---

## /src/scanner

**Purpose:**
Recursively scans a directory for JavaScript/TypeScript files and ignores unnecessary directories and test files.

**How it works:**

- `scan(dir: string)` returns an array of file paths.
- Uses `walk(current: string)` internally to recursively traverse directories.
- Uses `{ withFileTypes: true }` with `fs.readdir` so each entry can call `.isDirectory()`.
- Skips directories and files listed in `IGNORE` (e.g., `node_modules`, `.git`) and test files (`.test.`, `.spec.`).
- Collects files with extensions listed in `EXTENSIONS` (`.ts`, `.tsx`, `.js`, `.jsx`).

**Why it exists:**
Centralizes file discovery in one place; avoids reimplementing scanning logic.

**Known limitations / edge cases:**

- Does not follow symlinks.
- Deeply nested directories could hit stack limits.
- Only scans files with listed extensions; other valid JS/TS extensions are ignored.

---

## /src/parser

**Purpose:**
Extracts exported symbols from a given file. Supports both ES modules and CommonJS exports.

**How it works:**

1. Reads file content as UTF-8 string.
2. Strips comments using `stripComments()` to avoid false positives from commented-out code.
3. Regex matches for ES module exports:
   - `export function Name` (with optional `async`)
   - `export const/let/var Name`
   - `export type/interface Name`
   - `export class Name`
   - `export default function/class Name`
4. Regex matches for CommonJS exports:
   - `module.exports.name = ...`
   - `exports.name = ...`
   - `module.exports = { name1, name2: value }`
   - `module.exports = function name() {}`
   - `module.exports = class Name {}`
   - `module.exports = Identifier`
5. Deduplicates exports using `Set`.
6. Returns `{ path, name, exports[] }`.

**Helper functions:**

- `stripComments(code)` — Removes single-line (`//`) and multi-line (`/* */`) comments while preserving string literals.
- `parseExportsObject(content, startIdx)` — Parses `module.exports = { ... }` object literals, tracking bracket depth to handle nested structures.

**Why it exists:**
Separates symbol extraction from scanning or formatting. Provides structured data for tree visualization or tooling.

**Known limitations / edge cases:**

Does not parse:

- Re-exports: `export { foo } from './bar'`
- Computed exports: `export const [foo] = ...`
- Barrel files: `export * from './module'`
- Dynamic CommonJS: `module.exports[key] = value`
- Indirect CommonJS: `module.exports = require('./other')`

Regex-based; unusual formatting can break detection.

---

## /src/formatter

**Purpose:**
Builds a directory tree of files and exports, renders as a string for console output.

**How it works:**

- Builds `TreeNode` objects representing files/directories.
- Recursively populates `children: Map<string, TreeNode>` to represent hierarchy.
- Renders tree using `renderTree()` with connectors (`├─`, `└─`).
- Files with exports display the exported symbols (e.g., `math.ts → add, multiply`).

**Why it exists:**
Separates presentation from scanning and parsing. Allows CLI to display human-readable file/export hierarchy.

**Known limitations / edge cases:**

- Only works with parsed files (does not analyze imports/dependencies).
- Very large directories may produce long outputs.
- Assumes POSIX-style path separator for tree display.

---

## /src/types

**Purpose:**
Defines TypeScript types for structured file data.

**Types:**

- `ParsedFile` — Represents a parsed source file with path, name, and exports array.
- `FolderContent` — Represents a folder and its parsed files.

**Why it exists:**
Ensures consistent typing for `ParsedFile` and tree structures. Supports type safety across parser/formatter functions.

**Known limitations:**

- Only defines minimal structure, no runtime checks.

---

## General Notes

- All modules are asynchronous using `async/await` for clean flow.
- This tool is intentionally lightweight: regex parsing instead of AST for speed and simplicity.
- Comments are stripped before parsing to prevent false positives from commented-out code.
- Supports both ES modules and CommonJS export patterns.
- Intended for developer understanding and project indexing, not production validation or code execution.
