import { readFile, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import { test } from "node:test";
import assert from "node:assert/strict";

test("all built pages have valid local links, assets, and executable script hashes", async () => {
  for (const route of ["", "about/", "contact/", "experience/", "projects/"]) {
    const html = await readFile(
      new URL(`../dist/${route}index.html`, import.meta.url),
      "utf8",
    );
    for (const [, url] of html.matchAll(
      /(?:href|src|component-url|renderer-url)="(\/[^"#?]*)[^"]*"/g,
    )) {
      if (url.startsWith("//")) continue;
      const target = /\.[a-z\d]+$/i.test(url)
        ? url.slice(1)
        : `${url.replace(/^\/+|\/+$/g, "")}/index.html`;
      await access(new URL(`../dist/${target}`, import.meta.url));
    }
    const policy = html.match(
      /http-equiv="Content-Security-Policy" content="([^"]+)"/,
    )?.[1];
    assert.ok(policy, `${route} must include the build CSP`);
    for (const [, attrs, body] of html.matchAll(
      /<script([^>]*)>([\s\S]*?)<\/script>/g,
    )) {
      if (/\bsrc=|application\/(ld\+json|json)/.test(attrs) || !body.trim())
        continue;
      const hash = createHash("sha256").update(body).digest("base64");
      assert.ok(
        policy.includes(`'sha256-${hash}'`),
        `${route} must allow its own inline scripts`,
      );
    }
  }
});

test("production uses one background without the demo switch", async () => {
  const html = await readFile(
    new URL("../dist/index.html", import.meta.url),
    "utf8",
  );
  assert.equal([...html.matchAll(/data-effect="ripple"/g)].length, 1);
  assert.doesNotMatch(html, /data-effect="dots"|background-switcher/);
});

test("built homepage keeps its headline and portrait visible before hydration", async () => {
  const html = await readFile(
    new URL("../dist/index.html", import.meta.url),
    "utf8",
  );
  let checked = 0;
  for (const [, component, body] of html.matchAll(
    /<astro-island[^>]*component-url="([^"]+)"[^>]*>([\s\S]*?)<\/astro-island>/g,
  )) {
    if (!/Reveal|FloatingPhoto/.test(component) || !/<h1\b|<img\b/.test(body))
      continue;
    for (const [, style] of body.matchAll(/\bstyle="([^"]*)"/g)) {
      assert.doesNotMatch(
        style,
        /(?:^|;)\s*opacity\s*:\s*0(?:;|$)/,
        `${component} must not depend on JavaScript to become visible`,
      );
    }
    checked++;
  }
  assert.equal(checked, 2, "check both the hero headline and portrait");
});
