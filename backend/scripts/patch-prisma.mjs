/**
 * Post-generate patch for Prisma 7.x + ESM compatibility.
 *
 * The generated Prisma client imports `*.mjs` runtime files that don't exist.
 * The actual files are CJS `.js` — which Node.js CAN import from ESM via CJS
 * interop (no `"type"` field in @prisma/client means .js = CJS). But .mjs files
 * are forced into ESM mode where `module.exports` breaks.
 *
 * This script patches the generated files to import `.js` instead of `.mjs`.
 * Run after every `prisma generate` (wired into `db:generate` in package.json).
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const generatedDir = join(import.meta.dirname, "..", "src", "generated", "prisma", "internal");

const files = readdirSync(generatedDir).filter((f) => f.endsWith(".ts"));
let patched = false;

for (const file of files) {
  const filePath = join(generatedDir, file);
  let content = readFileSync(filePath, "utf-8");

  // Replace ALL .mjs imports with .js — covers query_compiler_fast, small, wasm-base64 variants
  const updated = content.replace(/\.mjs"/g, '.js"');

  if (updated !== content) {
    writeFileSync(filePath, updated, "utf-8");
    console.log(`✅ Patched ${file} — .mjs → .js`);
    patched = true;
  }
}

if (!patched) {
  console.log("ℹ️  No .mjs imports found — patch already applied or not needed.");
}
