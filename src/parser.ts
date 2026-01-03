import fs from "fs/promises";
import path from "path";
import type { FileExports } from "./types.js";

export async function parseFile(filePath: string): Promise<FileExports> {
  const content = await fs.readFile(filePath, "utf-8");
  const fileName = path.basename(filePath);

  return {
    filePath,
    fileName,
    functions: [
      ...extractFunctions(content),
      ...extractCommonJSFunctions(content),
    ],
    constants: [
      ...extractConstants(content),
      ...extractCommonJSConstants(content),
    ],
    types: extractTypes(content),
    interfaces: extractInterfaces(content),
    classes: [...extractClasses(content), ...extractMongooseModels(content)],
    defaultExport: extractDefaultExport(content),
  };
}

// ESM Exports
function extractFunctions(content: string): string[] {
  const functions: string[] = [];

  const funcMatches = content.matchAll(
    /export\s+(?:async\s+)?function\s+(\w+)/g
  );
  for (const match of funcMatches) {
    functions.push(match[1]);
  }

  const arrowMatches = content.matchAll(
    /export\s+const\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[a-zA-Z_]\w*)\s*(?:=>|\{)/g
  );
  for (const match of arrowMatches) {
    if (!functions.includes(match[1])) {
      functions.push(match[1]);
    }
  }

  return functions;
}

function extractConstants(content: string): string[] {
  const constants: string[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const match = line.match(
      /export\s+const\s+(\w+)\s*=\s*(?!(?:async\s*)?(?:\(|function|\w+\s*=>))/
    );
    if (match) {
      constants.push(match[1]);
    }

    const typedMatch = line.match(
      /export\s+const\s+(\w+)\s*:\s*[^=]+=\s*(?!(?:async\s*)?(?:\(|function|\w+\s*=>))/
    );
    if (typedMatch && !constants.includes(typedMatch[1])) {
      constants.push(typedMatch[1]);
    }
  }

  return constants;
}

function extractTypes(content: string): string[] {
  const matches = content.matchAll(/export\s+type\s+(\w+)/g);
  return [...matches].map((m) => m[1]);
}

function extractInterfaces(content: string): string[] {
  const matches = content.matchAll(/export\s+interface\s+(\w+)/g);
  return [...matches].map((m) => m[1]);
}

function extractClasses(content: string): string[] {
  const matches = content.matchAll(/export\s+(?:default\s+)?class\s+(\w+)/g);
  return [...matches].map((m) => m[1]);
}

function extractDefaultExport(content: string): string | undefined {
  const funcMatch = content.match(/export\s+default\s+function\s+(\w+)/);
  if (funcMatch) return funcMatch[1];

  const simpleMatch = content.match(/export\s+default\s+(\w+)/);
  if (simpleMatch) return simpleMatch[1];

  return undefined;
}

// CommonJS Exports
function extractCommonJSFunctions(content: string): string[] {
  const functions: string[] = [];

  // exports.functionName = async (req, res) => { }
  const exportsMatches = content.matchAll(
    /exports\.(\w+)\s*=\s*(?:async\s*)?(?:function|\(|async\s*\()/g
  );
  for (const match of exportsMatches) {
    if (!functions.includes(match[1])) {
      functions.push(match[1]);
    }
  }

  // module.exports.functionName = async (req, res) => { }
  const moduleExportsMatches = content.matchAll(
    /module\.exports\.(\w+)\s*=\s*(?:async\s*)?(?:function|\(|async\s*\()/g
  );
  for (const match of moduleExportsMatches) {
    if (!functions.includes(match[1])) {
      functions.push(match[1]);
    }
  }

  // module.exports = { functionName, anotherFunction }
  const objectExportMatch = content.match(/module\.exports\s*=\s*\{([^}]+)\}/);
  if (objectExportMatch) {
    const names = objectExportMatch[1]
      .split(",")
      .map((s) => s.trim().split(":")[0].trim());
    for (const name of names) {
      if (name && /^\w+$/.test(name) && !functions.includes(name)) {
        functions.push(name);
      }
    }
  }

  return functions;
}

function extractCommonJSConstants(content: string): string[] {
  const constants: string[] = [];

  // exports.CONSTANT_NAME = "value" or = { } (not functions)
  const lines = content.split("\n");
  for (const line of lines) {
    // exports.NAME = "value" or number or object (not function)
    const match = line.match(
      /exports\.(\w+)\s*=\s*(?!(?:async\s*)?(?:function|\(|async\s*\())/
    );
    if (match) {
      // Check it's likely a constant (UPPER_CASE or starts with config/options)
      const name = match[1];
      if (/^[A-Z_]+$/.test(name) || /^(config|options|settings)/i.test(name)) {
        constants.push(name);
      }
    }
  }

  return constants;
}

function extractMongooseModels(content: string): string[] {
  const models: string[] = [];

  // mongoose.model('ModelName', schema)
  const matches = content.matchAll(/mongoose\.model\s*\(\s*['"](\w+)['"]/g);
  for (const match of matches) {
    models.push(match[1]);
  }

  return models;
}
