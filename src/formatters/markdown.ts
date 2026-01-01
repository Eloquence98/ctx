import path from "path";
import type { FileExports, ProjectContext } from "../types.js";

export function formatMarkdown(data: ProjectContext, basePath: string): string {
  let output = "";

  // Routes section
  if (data.routes.length > 0) {
    output += `=== ROUTES (src/app) ===\n\n`;
    for (const route of data.routes) {
      output += `${route}\n`;
    }
    output += "\n";
  }

  // Features section
  if (data.features.size > 0) {
    output += `=== FEATURES ===\n\n`;
    output += formatFolderGroup(data.features);
  }

  // Components section
  if (data.components.size > 0) {
    output += `=== COMPONENTS ===\n\n`;
    output += formatFolderGroup(data.components);
  }

  // Hooks section
  if (data.hooks.length > 0) {
    output += `=== HOOKS ===\n\n`;
    for (const file of data.hooks) {
      output += formatSingleFile(file);
    }
    output += "\n";
  }

  // Lib section
  if (data.lib.size > 0) {
    output += `=== LIB ===\n\n`;
    output += formatFolderGroup(data.lib);
  }

  output += `=== DONE ===\n`;
  return output;
}

function formatFolderGroup(folders: Map<string, FileExports[]>): string {
  let output = "";

  for (const [folderName, files] of folders) {
    output += `${folderName}/\n`;

    for (const file of files) {
      output += formatSingleFile(file);
    }
    output += "\n";
  }

  return output;
}

function formatSingleFile(file: FileExports): string {
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
