import type { FileExports } from "../types.js";
import type { AdapterContext } from "../adapters/types.js";

export function formatAI(data: AdapterContext): string {
  const lines: string[] = [];

  lines.push(`# ${data.projectType} Project Context`);
  lines.push("");

  // Routes
  if (data.routes && data.routes.length > 0) {
    lines.push("## Routes");
    lines.push("");
    for (const route of data.routes) {
      lines.push(`- ${route}`);
    }
    lines.push("");
  }

  // Sections
  for (const [sectionName, files] of data.sections) {
    if (sectionName === "_root") continue;
    if (files.length === 0) continue;

    lines.push(`## ${sectionName}`);
    lines.push("");

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
    parts.push(file.functions.map((f) => `${f}()`).join(", "));
  }

  if (file.constants.length > 0) {
    parts.push(file.constants.join(", "));
  }

  if (file.types.length > 0) {
    parts.push(file.types.map((t) => `type ${t}`).join(", "));
  }

  if (file.interfaces.length > 0) {
    parts.push(file.interfaces.map((i) => `interface ${i}`).join(", "));
  }

  return parts.join(" | ");
}
