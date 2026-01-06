# ctx

Dump a truthful structural index of a codebase.

No analysis. No opinions. No guessing.

ctx scans a directory and prints a map of folders, files, and trivially detectable exported symbols. It tells you exactly what exists nothing more, nothing less.

## ⚡️ Quick Start

No installation required. Run it directly with npx:

```bash
npx @eloquence98/ctx ./path-to-project
```

## 📖 What it does

ctx provides a high-level map of a project. It identifies:

- 📂 Folders
- 📄 Files
- ➡️ Exported Symbols (when trivially detectable; ignores re-exports, computed exports, and unusual formatting)

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

## 🧠 Why this exists

When working with LLMs, new contributors, or legacy codebases, you don’t always need the content of the files immediately; you need to understand the topology of the project first.

ctx gives you that map.

1.  Copy the output.
2.  Paste it into an LLM context window.
3.  Ask informed questions about the architecture before dumping raw code.

## 🚫 What it does NOT do

ctx is intentionally dumb. That is why it is reliable.

It does not:

- ❌ Interpret architecture or infer domains
- ❌ Explain code intent.
- ❌ Refactor or execute code.
- ❌ Read node_modules or .git folders.
- ❌ Read environment variables
- ❌ Parse complex exports (re-exports, barrel files, computed names)

See [LIMITATIONS.md](https://github.com/Eloquence98/ctx/blob/main/limitation.md) for detailed edge cases.

## ⚙️ Configuration

No configuration required.

ctx automatically ignores:

- `node_modules`
- `.git`
- Build outputs (`dist`, `build`, etc.)
- Environment files (`.env`)
- Test files (`.test`., `.spec`.)

Only `.ts`, `.tsx`, `.js`, `.jsx` files are scanned.

## 💡 Philosophy

Don’t explain the code. Show the codebase as it exists.

ctx is intentionally shallow: it parses only what can be reliably read from source text.

## ⚡️ Install (optional)

```bash
npm install -g @eloquence98/ctx
ctx ./src
```

## License

[MIT ](https://choosealicense.com/licenses/mit/)
