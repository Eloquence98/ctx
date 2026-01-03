# ctx

Scan your codebase. Get a clean summary. Paste it to AI.

## Usage

```bash
npx @eloquence98/ctx ./src
```

```bash
# Human-readable output
npx @eloquence98/ctx ./src --human
```

## Install (optional)

```bash
npm install -g @eloquence98/ctx

# Then just use
ctx ./src
ctx ./src --human
```

## Output Example

```bash
# Codebase Context

## Routes
- /admin
- /admin/orders
- /client/[slug]/orders

## Components
- navbar.tsx: Navbar
- sidebar.tsx: Sidebar

## Hooks
- useAuth
- useFetch

## Utils
- utils.ts: cn, formatDate
```

## That's It

Copy. Paste to ChatGPT/Claude. Done.

## License

MIT
