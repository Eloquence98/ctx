import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { test } from "node:test";
import { scan } from "../src/scanner.js";

test("scan honors the target directory's root .gitignore", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "export-tree-"));

  try {
    await mkdir(path.join(dir, "src"));
    await mkdir(path.join(dir, "ignored"));

    await writeFile(path.join(dir, ".gitignore"), "ignored/\n");

    await writeFile(
      path.join(dir, "src", "included.ts"),
      "export const included = true;",
    );

    await writeFile(
      path.join(dir, "ignored", "excluded.ts"),
      "export const excluded = true;",
    );

    const files = await scan(dir);

    assert.deepEqual(files, [path.join(dir, "src", "included.ts")]);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
