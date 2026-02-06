# ctx

Dump a truthful structural index of a codebase.

No analysis. No opinions. No guessing.

ctx scans a directory and prints a map of folders, files, and trivially detectable exported symbols. It tells you exactly what exists — nothing more, nothing less.

## Quick Start

No installation required. Run it directly with npx:

```bash
npx @eloquence98/ctx ./path-to-project
```

## What It Does

ctx provides a high-level map of a project. It identifies:

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
   └─ styles.css
```

Files whose exports cannot be determined are listed without symbols.

## Supported Export Patterns

#### ES Modules:

`export function`, `export const/let/var`, `export class`, `export type`, `export interface`, `export default function/class`

#### CommonJS:

`exports.name = ...`, `module.exports.name = ...`, `module.exports = { name1, name2 }`, `module.exports = function/class`

## Why This Exists

When working with LLMs, new contributors, or legacy codebases, you don't always need the content of the files immediately, you need to understand the topology of the project first.

ctx gives you that map.

1.  Copy the output.
2.  Paste it into an LLM context window.
3.  Ask informed questions about the architecture before dumping raw code.

## What It Does Not Do

ctx is intentionally shallow. That is why it is reliable.

- Does not interpret architecture or infer domains
- Does not explain code intent
- Does not refactor or execute code
- Does not read `node_modules`, `.git`, or environment files
- Does not parse re-exports, barrel files, or computed names

See [LIMITATIONS.md](https://github.com/Eloquence98/ctx/blob/main/limitation.md) for detailed edge cases.

## Configuration

No configuration required.

ctx automatically ignores:

- `node_modules`, `.git`
- Build outputs (`dist`, `build`, `.next`)
- Environment files (`.env`)
- Test files (`.test`., `.spec`.)
- Hidden files and directories

Only `.ts`, `.tsx`, `.js`, `.jsx` files are scanned. Both ES module and CommonJS exports are detected.

## Install (optional)

```bash
npm install -g @eloquence98/ctx
ctx ./src
```

## Philosophy

Don't explain the code. Show the codebase as it exists.

ctx prefers truthful omission over incorrect inference. If something cannot be determined reliably, it is excluded.

## License

[MIT ](https://choosealicense.com/licenses/mit/)
