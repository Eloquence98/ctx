import type { FileExports } from "../types.js";
import type { AdapterContext } from "../adapters/types.js";

export function formatAIOptimized(data: AdapterContext): string {
  const lines: string[] = [];

  lines.push(`# Project Context (${data.projectType})`);
  lines.push("");

  // 1. Routes
  if (data.routes && data.routes.length > 0) {
    const routeGroups = parseRouteGroups(data.routes);

    // Filter out empty shell routes
    const filteredGroups = new Map<string, string[]>();
    for (const [key, value] of routeGroups) {
      if (value.length > 0) {
        filteredGroups.set(key, value);
      }
    }

    lines.push(`## Routes (${filteredGroups.size})`);

    for (const [group, paths] of filteredGroups) {
      // Max 4 routes, no "+N more"
      const displayPaths = paths.slice(0, 4);
      lines.push(`/${group} → ${displayPaths.join(", ")}`);
    }
    lines.push("");
  }

  // 2. Core Domains
  const features = getSectionsByPattern(data.sections, "features");
  if (features.size > 0) {
    lines.push(`## Core Domains (${features.size})`);
    for (const [name, files] of features) {
      lines.push(formatDomainLine(name, files));
    }
    lines.push("");
  }

  // 3. Auth & Session
  const authFiles = getAuthFiles(data.sections);
  if (authFiles.length > 0) {
    lines.push("## Auth & Session");
    lines.push("sign-in, session handling, token management");
    lines.push("");
  }

  // 4. Shared Lib
  const lib = getSectionsByPattern(data.sections, "lib");
  if (lib.size > 0 || data.sections.has("LIB") || data.sections.has("Lib")) {
    lines.push("## Shared Lib");
    lines.push("utils — formatting, helpers");

    const config = getSectionsByPattern(data.sections, "config");
    if (config.size > 0) {
      lines.push("config — api, uploads, pricing");
    }
    lines.push("");
  }

  // 5. Hooks
  const hooks = data.sections.get("HOOKS") || data.sections.get("Hooks");
  if (hooks && hooks.length > 0) {
    const hookNames = hooks
      .flatMap((f) => f.functions)
      .filter((n) => n.startsWith("use"));
    lines.push(`## Hooks (${hookNames.length})`);
    lines.push(hookNames.join(", "));
    lines.push("");
  }

  // 6. UI Layer
  const components = getSectionsByPattern(data.sections, "components");
  if (components.size > 0) {
    const totalComponents = countTotalFiles(components);
    lines.push("## UI Layer");
    const folders = [...components.keys()]
      .map((k) => k.split("/").pop()?.toLowerCase())
      .filter(Boolean);
    const uniqueFolders = [...new Set(folders)];
    lines.push(`~${totalComponents} components (${uniqueFolders.join(", ")})`);
    lines.push("");
  }

  return lines.join("\n");
}

// === Route Parsing ===

function parseRouteGroups(routes: string[]): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  let currentTopLevel = "";
  let currentDynamic = "";

  for (const route of routes) {
    const trimmed = route.trim();

    // Skip group markers like (auth), (website)
    if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
      continue;
    }

    // Calculate depth by counting leading spaces
    const depth = route.search(/\S/);

    // Top-level route
    if (depth === 0) {
      currentTopLevel = trimmed;
      currentDynamic = "";

      if (!groups.has(currentTopLevel)) {
        groups.set(currentTopLevel, []);
      }
    }
    // First-level dynamic segment like [slug]
    else if (depth === 2 && trimmed.startsWith("[") && trimmed.endsWith("]")) {
      currentDynamic = trimmed;
      const dynamicKey = `${currentTopLevel}/${currentDynamic}`;

      if (!groups.has(dynamicKey)) {
        groups.set(dynamicKey, []);
      }
    }
    // Child routes
    else if (depth >= 2) {
      // Skip dynamic segments and technical routes
      if (isSkippableRoute(trimmed)) {
        continue;
      }

      // Add to dynamic group if exists, otherwise to top level
      if (currentDynamic && depth > 2) {
        const dynamicKey = `${currentTopLevel}/${currentDynamic}`;
        const children = groups.get(dynamicKey);
        if (children && !children.includes(trimmed)) {
          children.push(trimmed);
        }
      } else if (currentTopLevel) {
        const children = groups.get(currentTopLevel);
        if (children && !children.includes(trimmed)) {
          children.push(trimmed);
        }
      }
    }
  }

  // Clean up empty groups and dynamic groups with no children
  const cleaned = new Map<string, string[]>();
  for (const [key, value] of groups) {
    // Keep if has children OR is a standalone route
    if (value.length > 0 || !key.includes("/")) {
      cleaned.set(key, value);
    }
  }

  return cleaned;
}

function isSkippableRoute(route: string): boolean {
  const skipPatterns = [
    "[",
    "]",
    "error",
    "sync",
    "verify-email",
    "success",
    "...nextauth",
  ];

  const lower = route.toLowerCase();
  return skipPatterns.some((p) => lower.includes(p));
}

// === Section Helpers ===

function getSectionsByPattern(
  sections: Map<string, FileExports[]>,
  pattern: string
): Map<string, FileExports[]> {
  const result = new Map<string, FileExports[]>();

  for (const [key, value] of sections) {
    if (key.toLowerCase().includes(pattern.toLowerCase())) {
      result.set(key, value);
    }
  }

  return result;
}

function getAuthFiles(sections: Map<string, FileExports[]>): FileExports[] {
  for (const [key, value] of sections) {
    if (key.toLowerCase().includes("auth")) {
      return value;
    }
  }
  return [];
}

function countTotalFiles(sections: Map<string, FileExports[]>): number {
  let count = 0;
  for (const files of sections.values()) {
    count += files.length;
  }
  return count;
}

// === Domain Formatting ===

function formatDomainLine(name: string, files: FileExports[]): string {
  const cleanName = name
    .replace(/features\//i, "")
    .replace(/FEATURES\//i, "")
    .toLowerCase();

  const actionFiles = files.filter(
    (f) => f.fileName.includes("action") || f.fileName.includes("actions")
  );
  const actionCount = actionFiles.reduce(
    (sum, f) => sum + f.functions.length,
    0
  );

  const intent = getIntent(cleanName, files);

  return `${cleanName} — ${intent} (${actionCount} actions)`;
}

function getIntent(domain: string, files: FileExports[]): string {
  const allFunctions = files
    .flatMap((f) => f.functions)
    .join(" ")
    .toLowerCase();

  // Domain-specific intent mapping
  if (domain === "users") {
    return "authenticate, edit profile, manage credentials";
  }

  if (domain === "orders") {
    return "create/edit/cancel";
  }

  if (domain === "estimates") {
    return "create/edit/convert";
  }

  if (domain === "files") {
    return "upload/download";
  }

  // Fallback: derive from function names
  const intents: string[] = [];

  if (allFunctions.includes("create")) intents.push("create");
  if (allFunctions.includes("edit") || allFunctions.includes("update")) {
    intents.push("edit");
  }
  if (allFunctions.includes("delete") || allFunctions.includes("cancel")) {
    intents.push("cancel");
  }

  if (intents.length === 0) return "manage";
  return intents.slice(0, 3).join("/");
}
