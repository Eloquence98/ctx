import type { ScanOptions } from "./types.js";

export const defaultConfig: ScanOptions = {
  entry: "./src",
  extensions: [".ts", ".tsx", ".js", ".jsx"],
  ignore: [
    "node_modules",
    ".git",
    ".directory",
    "dist",
    "build",
    ".next",
    "*.test.*",
    "*.spec.*",
    "__tests__",
    "*.d.ts",
    ".DS_Store",
  ],
  maxDepth: 10,
};

export const folderCategories = {
  routes: ["app", "pages"],
  features: ["features", "modules", "domains"],
  hooks: ["hooks"],
  lib: ["lib", "utils", "helpers", "services"],
  components: ["components", "ui"],
};
