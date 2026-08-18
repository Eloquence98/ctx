# export-tree

Zero-config CLI that prints your project's directory tree with every export.
Gitignore-aware, code-files only. Honors the target directory's root `.gitignore`.

> **Migrating from `@eloquence98/ctx`?** This is the same tool, renamed.
> Run `npm uninstall -g @eloquence98/ctx` then `npm i -g export-tree`.

---

## Quick Start

No installation required. Run it directly with npx:

```bash
npx export-tree ./path-to-project
```

## What It Does

export-tree provides a high-level structural map of a project. It identifies:

- Folders
- Files
- Exported symbols (both ES modules and CommonJS, when trivially detectable)

Exports that cannot be statically determined from source text are silently ignored.

## Example Output

```bash
src/
├─ app.tsx → App
├─ utils.ts → formatDate, parseCurrency
└─ components/
   ├─ button.tsx → Button
   ├─ modal.tsx → Modal, ModalProps
```

Files whose exports cannot be determined are listed without symbols.

## Supported Export Patterns

#### ES Modules:

`export function`, `export const/let/var`, `export class`, `export type`, `export interface`, `export default function/class`

#### CommonJS:

`exports.name = ...`, `module.exports.name = ...`, `module.exports = { name1, name2 }`, `module.exports = function/class`

## Why This Exists

When working with LLMs, new contributors, or legacy codebases, you don't always need the content of the files immediately, you need to understand the topology of the project first.

export-tree gives you that map.

1.  Copy the output.
2.  Paste it into an LLM context window.
3.  Ask informed questions about the architecture before dumping raw code.

## What It Does Not Do

export-tree is intentionally shallow. That is why it is reliable.

- Does not interpret architecture or infer domains
- Does not explain code intent
- Does not refactor or execute code
- Does not read `node_modules`, `.git`, or environment files
- Does not parse re-exports, barrel files, or computed names

See [LIMITATIONS.md](https://github.com/Eloquence98/export-tree/blob/main/limitation.md) for detailed edge cases.

## Configuration

No configuration required.

export-tree automatically ignores:

- `node_modules`, `.git`
- Build outputs (`dist`, `build`, `.next`)
- Environment files (`.env`)
- Test files (`.test`., `.spec`.)
- Hidden files and directories
- Rules from the target directory's root `.gitignore`

Source files (`.ts`, `.tsx`, `.js`, `.jsx`) are scanned for exports. Common project and configuration files are included in the tree without export parsing.

Display-only files include `package.json`, `tsconfig.json`, `jsconfig.json`, `README.md`, `LICENSE`, and common `*.config.*` files.

## Install (optional)

```bash
npm i -g export-tree
```

Then run:

```bash
export-tree ./src
# or the shorter alias
etree ./src
```

## Philosophy

Don't explain the code. Show the codebase as it exists.

export-tree prefers truthful omission over incorrect inference.
If something cannot be determined reliably, it is excluded.

## License

[MIT ](https://choosealicense.com/licenses/mit/)
