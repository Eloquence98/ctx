import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import assert from "node:assert/strict";
import { test } from "node:test";
import os from "os";
import path from "path";
import { isDisplayOnlyFile, scan } from "../src/scanner.js";

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

test("display-only project files are recognized", () => {
  assert.equal(isDisplayOnlyFile("package.json"), true);
  assert.equal(isDisplayOnlyFile("tsconfig.json"), true);
  assert.equal(isDisplayOnlyFile("README.md"), true);
  assert.equal(isDisplayOnlyFile("vite.config.ts"), true);
  assert.equal(isDisplayOnlyFile("src.ts"), false);
  assert.equal(isDisplayOnlyFile("data.json"), false);
});
