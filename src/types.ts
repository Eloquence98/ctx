/**
 * Represents a parsed source file with its exported symbols.
 */
export interface ParsedFile {
  /** Absolute path to the file */
  path: string;
  /** Base filename (e.g., "parser.ts") */
  name: string;
  /** List of exported symbol names */
  exports: string[];
}

/**
 * Represents a folder and its parsed files.
 */
export interface FolderContent {
  /** Folder path */
  folder: string;
  /** Parsed files within this folder */
  files: ParsedFile[];
}
