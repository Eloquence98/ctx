export interface ParsedFile {
  path: string;
  name: string;
  exports: {
    functions: string[];
    constants: string[];
    types: string[];
    components: string[];
  };
}

export interface OrganizedContext {
  routes: string[];
  components: ParsedFile[];
  hooks: ParsedFile[];
  utils: ParsedFile[];
  other: ParsedFile[];
}
