import type { FileExports } from "../types.js";

export interface AdapterContext {
  projectType: string;
  sections: Map<string, FileExports[]>;
  routes?: string[];
}

export interface Adapter {
  name: string;
  detect: (dir: string) => Promise<boolean>;
  analyze: (dir: string, files: FileExports[]) => Promise<AdapterContext>;
}
