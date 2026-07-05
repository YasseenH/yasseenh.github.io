// Postbuild step: computes sha256 hashes for every inline <script> in the
// static build and injects a Content-Security-Policy meta tag using them.
// Runs after `astro build` so hashes always match the actual output —
// nothing to keep in sync by hand.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(full) : entry.name.endsWith(".html") ? [full] : [];
    })
  );
  return files.flat();
}

function hashInlineScript(body) {
  return `'sha256-${createHash("sha256").update(body, "utf8").digest("base64")}'`;
}

function collectScriptHashes(html) {
  const hashes = new Set();
  const scriptTagRe = /<script([^>]*)>([\s\S]*?)<\/script>/g;
  let match;
  while ((match = scriptTagRe.exec(html))) {
    const [, attrs, body] = match;
    if (/\bsrc\s*=/.test(attrs)) continue; // external file, no hash needed
    if (/type\s*=\s*["']application\/(ld\+json|json)["']/.test(attrs)) continue; // inert data block
    if (!body.trim()) continue;
    hashes.add(hashInlineScript(body));
  }
  return hashes;
}

const files = await walk(distDir);
const contents = new Map();
const allHashes = new Set();

for (const file of files) {
  const html = await readFile(file, "utf8");
  contents.set(file, html);
  for (const hash of collectScriptHashes(html)) allHashes.add(hash);
}

const csp = [
  "default-src 'self'",
  `script-src 'self' ${[...allHashes].join(" ")}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const metaTag = `<meta http-equiv="Content-Security-Policy" content="${csp}">`;

for (const [file, html] of contents) {
  const updated = html.replace(
    "<!-- csp-placeholder: injected by scripts/inject-csp.mjs at build time -->",
    metaTag
  );
  if (updated === html) {
    throw new Error(`CSP placeholder not found in ${file} — did BaseLayout.astro change?`);
  }
  await writeFile(file, updated, "utf8");
}

console.log(`[inject-csp] Injected CSP with ${allHashes.size} script hash(es) into ${files.length} page(s).`);
