# ctx

Generate AI-ready context from your codebase in seconds.

`ctx` scans a project directory and produces a clean, structured overview of folders and exported symbols. The output is designed to be pasted directly into AI tools to give them accurate context about your codebase.

---

## Why ctx

AI assistants do not understand your project unless you explain it.

Without ctx, you usually have to:
- Manually copy files
- Describe folder structure
- Explain what exists and how things connect

`ctx` automates this by generating a concise snapshot of your project with a single command.

---

## What It Does

- Recursively scans a directory
- Detects common project conventions
- Extracts exported symbols
- Produces readable, AI-friendly output
- Requires zero configuration

---

## Installation

### No install (recommended)
```bash
npx ctx ./src
```

### Global install
```bash
npm install -g ctx
```

### Local install (dev dependency)
```bash
npm install --save-dev ctx
```

---

## Usage

### Scan a directory
```bash
ctx ./src
```

### Scan current directory
```bash
ctx .
```

### Output as JSON
```bash
ctx ./src -o json
```

### Write output to a file
```bash
ctx ./src > CONTEXT.md
```

---

## What Gets Extracted

### Code Symbols
- Functions
- Constants
- Types
- Interfaces

### Project Structure
- Routes (App Router / Pages Router)
- Features or modules
- Components
- Hooks
- Utilities and libraries

Detection is convention-based and works with most modern JavaScript and TypeScript projects.

---

## Use Cases

- Providing context to ChatGPT, Claude, or Copilot
- Generating architecture documentation
- Onboarding new team members
- Understanding unfamiliar codebases
- Preparing projects for AI-assisted refactors

---

## Output Philosophy

The output is:
- Minimal
- Structured
- Human-readable
- Optimized for AI comprehension

Only high-signal information is included.

---

## Roadmap

- Clipboard support (`--copy`)
- Config file support
- VS Code extension
- Watch mode

---

## License

MIT
