export interface FileExports {
  filePath: string;
  fileName: string;
  functions: string[];
  constants: string[];
  types: string[];
  interfaces: string[];
  classes: string[];
  defaultExport?: string;
}

export interface ScanOptions {
  entry: string;
  extensions: string[];
  ignore: string[];
  maxDepth: number;
}

export interface ProjectContext {
  routes: string[];
  features: Map<string, FileExports[]>;
  hooks: FileExports[];
  lib: Map<string, FileExports[]>;
  components: Map<string, FileExports[]>;
}
