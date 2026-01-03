# ctx

Scan your codebase. Get a clean summary. Paste it to AI.

## Usage

```bash
# Scan current directory
ctx .
```

```bash
# Scan specific folder
ctx ./src
```

```bash
# Human-readable output
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
