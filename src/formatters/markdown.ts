import type { FileExports } from "../types.js";
import type { AdapterContext } from "../adapters/types.js";

export function formatMarkdown(data: AdapterContext): string {
  let output = "";

  // Project type header
  output += `📦 Project: ${data.projectType}\n\n`;

  // Routes section (if exists)
  if (data.routes && data.routes.length > 0) {
    output += `=== ROUTES ===\n\n`;
    for (const route of data.routes) {
      output += `${route}\n`;
    }
    output += "\n";
  }

  // All sections
  for (const [sectionName, files] of data.sections) {
    if (sectionName === "_root") continue;
    if (files.length === 0) continue;

    // Check if any file has exports
    const hasExports = files.some(
      (f) =>
        f.functions.length > 0 ||
        f.constants.length > 0 ||
        f.types.length > 0 ||
        f.interfaces.length > 0 ||
        f.classes.length > 0
    );

    if (!hasExports) continue;

    output += `=== ${sectionName.toUpperCase()} ===\n\n`;

    for (const file of files) {
      output += formatFile(file);
    }

    output += "\n";
  }

  // Root files last
  const rootFiles = data.sections.get("_root");
  if (rootFiles && rootFiles.length > 0) {
    const hasRootExports = rootFiles.some(
      (f) =>
        f.functions.length > 0 ||
        f.constants.length > 0 ||
        f.types.length > 0 ||
        f.interfaces.length > 0 ||
        f.classes.length > 0
    );

    if (hasRootExports) {
      output += `=== ROOT FILES ===\n\n`;
      for (const file of rootFiles) {
        output += formatFile(file);
      }
      output += "\n";
    }
  }

  output += `=== DONE ===\n`;
  return output;
}

function formatFile(file: FileExports): string {
  const hasExports =
    file.functions.length > 0 ||
    file.constants.length > 0 ||
    file.types.length > 0 ||
    file.interfaces.length > 0 ||
    file.classes.length > 0;

  if (!hasExports) return "";

  let output = `${file.fileName}\n`;

  for (const fn of file.functions) {
    output += `• function: ${fn}\n`;
  }
  for (const constant of file.constants) {
    output += `• constant: ${constant}\n`;
  }
  for (const type of file.types) {
    output += `• type: ${type}\n`;
  }
  for (const iface of file.interfaces) {
    output += `• interface: ${iface}\n`;
  }
  for (const cls of file.classes) {
    output += `• class: ${cls}\n`;
  }

  return output;
}
