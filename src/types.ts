export interface ParsedFile {
  path: string;
  name: string;
  exports: string[];
}

export interface FolderContent {
  folder: string;
  files: ParsedFile[];
}
