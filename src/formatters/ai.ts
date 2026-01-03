import type { OrganizedContext } from "../types.js";

export function formatAI(ctx: OrganizedContext): string {
  const lines: string[] = ["# Codebase Context", ""];

  if (ctx.routes.length) {
    lines.push("## Routes", ...ctx.routes.map((r) => `- ${r}`), "");
  }

  if (ctx.components.length) {
    lines.push("## Components");
    for (const f of ctx.components) {
      const exp = f.exports.components.join(", ");
      if (exp) {
        lines.push(`- ${f.name}: ${exp}`);
      }
    }
    lines.push("");
  }

  if (ctx.hooks.length) {
    lines.push("## Hooks");
    for (const f of ctx.hooks) {
      const hookFns = f.exports.functions.filter((fn) => fn.startsWith("use"));
      if (hookFns.length) {
        lines.push(`- ${hookFns.join(", ")}`);
      }
    }
    lines.push("");
  }

  if (ctx.utils.length) {
    lines.push("## Utils");
    for (const f of ctx.utils) {
      const exp = [...f.exports.functions, ...f.exports.constants].join(", ");
      if (exp) {
        lines.push(`- ${f.name}: ${exp}`);
      }
    }
    lines.push("");
  }

  if (ctx.other.length) {
    lines.push("## Other");
    for (const f of ctx.other) {
      const exp = [
        ...f.exports.functions,
        ...f.exports.constants,
        ...f.exports.components,
      ].join(", ");
      if (exp) {
        lines.push(`- ${f.name}: ${exp}`);
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}
