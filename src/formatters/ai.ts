import type { FileExports, ProjectContext } from "../types.js";

export function formatAI(data: ProjectContext, basePath: string): string {
  const lines: string[] = [];

  lines.push("# Project Context");
  lines.push("");
  lines.push("Use this to understand the codebase structure.");
  lines.push("");

  // Routes
  if (data.routes.length > 0) {
    lines.push("## Routes");
    lines.push("");
    for (const route of data.routes) {
      const depth = route.search(/\S/); // Count leading spaces
      const name = route.trim();
      const prefix = depth > 0 ? "  ".repeat(depth / 2) + "└─ " : "- ";
      lines.push(`${prefix}${name}`);
    }
    lines.push("");
  }

  // Features
  if (data.features.size > 0) {
    lines.push("## Features");
    lines.push("");
    lines.push(formatFolderCompact(data.features));
  }

  // Components
  if (data.components.size > 0) {
    lines.push("## Components");
    lines.push("");
    lines.push(formatFolderCompact(data.components));
  }

  // Hooks
  if (data.hooks.length > 0) {
    lines.push("## Hooks");
    lines.push("");
    for (const hook of data.hooks) {
      const exports = getExportsSummary(hook);
      if (exports) {
        lines.push(`- ${hook.fileName}: ${exports}`);
      }
    }
    lines.push("");
  }

  // Lib
  if (data.lib.size > 0) {
    lines.push("## Lib / Utils");
    lines.push("");
    lines.push(formatFolderCompact(data.lib));
  }

  return lines.join("\n");
}

function formatFolderCompact(folders: Map<string, FileExports[]>): string {
  const lines: string[] = [];

  for (const [folderName, files] of folders) {
    lines.push(`### ${folderName}`);

    for (const file of files) {
      const exports = getExportsSummary(file);
      if (exports) {
        lines.push(`- ${file.fileName}: ${exports}`);
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}

function getExportsSummary(file: FileExports): string {
  const parts: string[] = [];

  if (file.functions.length > 0) {
    const fns = file.functions.map((f) => `${f}()`).join(", ");
    parts.push(fns);
  }

  if (file.constants.length > 0) {
    parts.push(file.constants.join(", "));
  }

  if (file.types.length > 0) {
    const types = file.types.map((t) => `type ${t}`).join(", ");
    parts.push(types);
  }

  if (file.interfaces.length > 0) {
    const ifaces = file.interfaces.map((i) => `interface ${i}`).join(", ");
    parts.push(ifaces);
  }

  return parts.join(" | ");
}
