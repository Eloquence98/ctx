import type { FileExports } from "../types.js";
import type { AdapterContext } from "../adapters/types.js";

export function formatHuman(data: AdapterContext): string {
  const lines: string[] = [];

  lines.push(`📁 Project: ${data.projectType} App`);
  lines.push("");

  // Routes - ordered: client, admin, api
  if (data.routes && data.routes.length > 0) {
    lines.push("┌─ Routes ─────────────────────────");
    lines.push("│");

    const routeGroups = parseRouteGroups(data.routes);
    const orderedGroups = sortRouteGroups(routeGroups);

    // Filter out empty groups
    const filteredGroups = new Map<string, string[]>();
    for (const [key, value] of orderedGroups) {
      if (value.length > 0) {
        filteredGroups.set(key, value);
      }
    }

    const groupKeys = [...filteredGroups.keys()];
    for (let i = 0; i < groupKeys.length; i++) {
      const group = groupKeys[i];
      const children = filteredGroups.get(group) || [];
      const isLast = i === groupKeys.length - 1;
      const prefix = isLast ? "└──" : "├──";
      const childPrefix = isLast ? "    " : "│   ";
      const icon = getRouteIcon(group);

      const displayGroup = group.split("/")[0];
      lines.push(`${prefix} ${icon} ${capitalizeFirst(displayGroup)}`);

      // Consolidate dynamic segments
      const consolidatedChildren = consolidateRoutes(children);

      // Show max 5 children
      const visibleChildren = consolidatedChildren.slice(0, 5);
      for (const child of visibleChildren) {
        lines.push(`${childPrefix}/${child}`);
      }

      // Remaining as "(other X pages)"
      if (consolidatedChildren.length > 5) {
        const remaining = consolidatedChildren.length - 5;
        const groupName = group.split("/")[0];
        lines.push(`${childPrefix}(${remaining} more ${groupName} pages)`);
      }
    }

    lines.push("");
  }

  // Domains
  const features = getSectionsByPattern(data.sections, "features");
  if (features.size > 0) {
    lines.push("┌─ Domains ────────────────────────");
    lines.push("│");

    const featureNames = [...features.keys()];
    for (let i = 0; i < featureNames.length; i++) {
      const name = featureNames[i];
      const cleanName = name.replace(/features\//i, "").toLowerCase();
      const icon = getDomainIcon(cleanName);
      const isLast = i === featureNames.length - 1;
      const prefix = isLast ? "└──" : "├──";

      lines.push(`${prefix} ${icon} features/${cleanName}`);
    }

    lines.push("");
  }

  // Infrastructure
  lines.push("┌─ Infrastructure ─────────────────");
  lines.push("│");
  lines.push("├── auth / session");
  lines.push("├── shared utils");
  lines.push("└── ui components");
  lines.push("");

  return lines.join("\n");
}

// === Route Parsing ===

function parseRouteGroups(routes: string[]): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  let currentTopLevel = "";
  let currentDynamic = "";

  for (const route of routes) {
    const trimmed = route.trim();

    if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
      continue;
    }

    const depth = route.search(/\S/);

    if (depth === 0) {
      currentTopLevel = trimmed;
      currentDynamic = "";
      if (!groups.has(currentTopLevel)) {
        groups.set(currentTopLevel, []);
      }
    } else if (depth === 2 && trimmed.startsWith("[")) {
      // Dynamic segment at first level - create combined key
      currentDynamic = trimmed;
      const dynamicKey = `${currentTopLevel}/${currentDynamic}`;
      if (!groups.has(dynamicKey)) {
        groups.set(dynamicKey, []);
      }
    } else if (currentTopLevel) {
      if (!isSkippableRoute(trimmed)) {
        // Add to dynamic group if exists
        if (currentDynamic && depth > 2) {
          const dynamicKey = `${currentTopLevel}/${currentDynamic}`;
          const children = groups.get(dynamicKey);
          if (children && !children.includes(trimmed)) {
            children.push(trimmed);
          }
        } else {
          const children = groups.get(currentTopLevel);
          if (children && !children.includes(trimmed)) {
            children.push(trimmed);
          }
        }
      }
    }
  }

  return groups;
}

function isSkippableRoute(route: string): boolean {
  const skip = ["error", "sync", "verify-email", "success", "...nextauth"];
  const lower = route.toLowerCase();
  return skip.some((p) => lower.includes(p));
}

function sortRouteGroups(groups: Map<string, string[]>): Map<string, string[]> {
  const sorted = new Map<string, string[]>();
  const order = ["client", "admin", "api"];

  for (const key of order) {
    for (const [group, children] of groups) {
      if (group.toLowerCase().includes(key)) {
        sorted.set(group, children);
      }
    }
  }

  for (const [group, children] of groups) {
    if (!sorted.has(group)) {
      sorted.set(group, children);
    }
  }

  return sorted;
}

function consolidateRoutes(routes: string[]): string[] {
  const consolidated: string[] = [];
  const seen = new Set<string>();

  for (const route of routes) {
    // Skip dynamic segments
    if (route.startsWith("[") && route.endsWith("]")) {
      continue;
    }

    const baseName = route.toLowerCase();

    if (!seen.has(baseName)) {
      seen.add(baseName);

      // Check if there's a dynamic child
      const hasDynamic = routes.some(
        (r) =>
          r.startsWith("[") && r.toLowerCase().includes(baseName.slice(0, -1))
      );

      if (hasDynamic) {
        consolidated.push(`${route} (list, detail)`);
      } else {
        consolidated.push(route);
      }
    }
  }

  return consolidated;
}

// === Helpers ===

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

function getRouteIcon(group: string): string {
  const lower = group.toLowerCase();
  if (lower.includes("client") || lower.includes("user")) return "👤";
  if (lower.includes("admin")) return "🛠️";
  if (lower.includes("api")) return "🔌";
  if (lower.includes("auth") || lower.includes("login")) return "🔐";
  return "📄";
}

function getDomainIcon(name: string): string {
  if (name.includes("order")) return "📦";
  if (name.includes("estimate")) return "📋";
  if (name.includes("file")) return "📁";
  if (name.includes("user")) return "👤";
  if (name.includes("auth")) return "🔐";
  if (name.includes("payment")) return "💳";
  return "📂";
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
