import type { ProjectType } from "../detectors/index.js";
import { expressAdapter } from "./express.js";
import { nextjsAdapter } from "./nextjs.js";
import type { Adapter } from "./types.js";
import { vanillaAdapter } from "./vanilla.js";

const adapters: Record<string, Adapter> = {
  nextjs: nextjsAdapter,
  react: vanillaAdapter,
  express: expressAdapter,
  nestjs: expressAdapter, // Similar structure
  vue: vanillaAdapter,
  sveltekit: vanillaAdapter,
  node: vanillaAdapter,
  vanilla: vanillaAdapter,
};

export function getAdapter(projectType: ProjectType): Adapter {
  return adapters[projectType] || vanillaAdapter;
}

export type { Adapter, AdapterContext } from "./types.js";
