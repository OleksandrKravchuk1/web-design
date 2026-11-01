import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";

const en = JSON.parse(readFileSync("src/i18n/en.json", "utf8"));
const hasKey = (key) => typeof key.split(".").reduce((obj, part) => obj?.[part], en) === "string";

const isExternal = (url) => /^([a-z]+:|\/\/|#|\?)/i.test(url);

const pages = readdirSync(DIST).filter((name) => name.endsWith(".html"));
let errors = 0;
let checked = 0;

for (const page of pages) {
  const html = readFileSync(join(DIST, page), "utf8");

  const urls = [...html.matchAll(/\s(?:href|src)="([^"]*)"/g)].map((match) => match[1]);
  for (const [, srcset] of html.matchAll(/\ssrcset="([^"]*)"/g)) {
    urls.push(...srcset.split(",").map((candidate) => candidate.trim().split(/\s+/)[0]));
  }

  for (const url of urls) {
    if (!url || isExternal(url)) {
      continue;
    }
    checked++;
    const path = decodeURI(url.split(/[?#]/)[0]);
    if (!existsSync(join(DIST, path))) {
      console.error(`✗ ${page}: broken link or image "${url}"`);
      errors++;
    }
  }

  for (const [, key] of html.matchAll(/data-i18n="([^"]+)"/g)) {
    if (!hasKey(key)) {
      console.error(`✗ ${page}: unknown i18n key "${key}"`);
      errors++;
    }
  }
  for (const [, pairs] of html.matchAll(/data-i18n-attr="([^"]+)"/g)) {
    for (const pair of pairs.split("|")) {
      const key = pair.split(":")[1];
      if (!key || !hasKey(key)) {
        console.error(`✗ ${page}: unknown i18n key in data-i18n-attr "${pair}"`);
        errors++;
      }
    }
  }
}

if (errors > 0) {
  console.error(`\n${errors} problem(s) found`);
  process.exit(1);
}

console.log(`✓ ${pages.length} pages, ${checked} relative links/images resolved, i18n keys valid`);
