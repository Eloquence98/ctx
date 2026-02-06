# Limitations

ctx is intentionally shallow. These limitations are by design.

## Export detection limitations

ctx only detects exports that match simple, static patterns via regex.

### ES Module exports detected

- `export function name`
- `export async function name`
- `export const/let/var name`
- `export class Name`
- `export type Name`
- `export interface Name`
- `export default function Name`
- `export default class Name`

### CommonJS exports detected

- `exports.name = ...`
- `module.exports.name = ...`
- `module.exports = { name1, name2: value }`
- `module.exports = function name() {}`
- `module.exports = async function name() {}`
- `module.exports = class Name {}`
- `module.exports = Identifier`

### Not detected

- Re-exports: `export { foo } from './bar'`
- Star exports: `export * from './module'`
- Renamed exports: `export { foo as bar }`
- Default exports without a name: `export default () => {}`
- Variable exports with destructuring: `export const { a, b } = obj`
- Multi-line or formatted exports that break regex assumptions
- Dynamic CommonJS: `module.exports[key] = value`
- Indirect CommonJS: `module.exports = require('./other')`
- Anything generated dynamically

If an export is not trivially readable from source text, ctx ignores it.

## File and directory scanning limitations

- Only files with extensions `.ts`, `.tsx`, `.js`, `.jsx` are scanned
- Symlinks are not followed
- Deep directory trees may be slow or hit recursion limits
- Hidden files and directories (starting with `.`) are skipped
- Ignored directories include: `node_modules`, `.git`, `dist`, `build`, `.next`, env files, editor folders, `coverage`, etc.
- Test files (`.test.*`, `.spec.*`) are ignored

## Structural limitations

- ctx does not understand imports or dependencies
- ctx does not infer architecture, ownership, or intent
- ctx does not validate correctness
- ctx does not execute code
- Output order depends on filesystem traversal

## Philosophy

ctx prefers truthful omission over incorrect inference.

If something cannot be determined reliably, it is excluded.
