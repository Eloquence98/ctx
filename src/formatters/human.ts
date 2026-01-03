import type { OrganizedContext } from "../types.js";

export function formatHuman(ctx: OrganizedContext): string {
  const lines: string[] = [
    "╭─────────────────────────────────────╮",
    "│         CODEBASE OVERVIEW           │",
    "╰─────────────────────────────────────╯",
    "",
  ];

  if (ctx.routes.length) {
    lines.push("📍 ROUTES", "");
    for (const r of ctx.routes) {
      lines.push(`   ${r}`);
    }
    lines.push("");
  }

  if (ctx.components.length) {
    lines.push(`🧩 COMPONENTS (${ctx.components.length} files)`, "");
    for (const f of ctx.components.slice(0, 10)) {
      if (f.exports.components.length) {
        lines.push(`   ${f.name}`);
        for (const c of f.exports.components.slice(0, 3)) {
          lines.push(`      └─ ${c}`);
        }
      }
    }
    if (ctx.components.length > 10) {
      lines.push(`   ... and ${ctx.components.length - 10} more`);
    }
    lines.push("");
  }

  if (ctx.hooks.length) {
    const allHooks = ctx.hooks.flatMap((f) =>
      f.exports.functions.filter((fn) => fn.startsWith("use"))
    );

    if (allHooks.length) {
      lines.push(`🪝 HOOKS (${allHooks.length})`, "");
      for (const hook of allHooks) {
        lines.push(`   • ${hook}()`);
      }
      lines.push("");
    }
  }

  if (ctx.utils.length) {
    lines.push(`🔧 UTILITIES`, "");
    for (const f of ctx.utils.slice(0, 10)) {
      if (f.exports.functions.length) {
        lines.push(`   ${f.name}`);
        for (const fn of f.exports.functions.slice(0, 3)) {
          lines.push(`      • ${fn}()`);
        }
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}
