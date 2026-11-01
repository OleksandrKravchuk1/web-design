import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const PARTIALS = "src/templates/partials";
const files = [
  ...readdirSync(".").filter((name) => name.endsWith(".html")),
  ...readdirSync(PARTIALS).map((name) => join(PARTIALS, name)),
];

let errors = 0;

for (const file of files) {
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, index) => {
    if (/\sstyle\s*=/.test(line) || /<style[\s>]/i.test(line)) {
      console.error(`✗ ${file}:${index + 1}: inline styles are not allowed`);
      errors++;
    }
  });
}

const flatten = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([key, value]) =>
    value && typeof value === "object" ? flatten(value, `${prefix}${key}.`) : [`${prefix}${key}`],
  );

const en = new Set(flatten(JSON.parse(readFileSync("src/i18n/en.json", "utf8"))));
const uk = new Set(flatten(JSON.parse(readFileSync("src/i18n/uk.json", "utf8"))));

for (const key of en) {
  if (!uk.has(key)) {
    console.error(`✗ src/i18n/uk.json: missing key "${key}"`);
    errors++;
  }
}
for (const key of uk) {
  if (!en.has(key)) {
    console.error(`✗ src/i18n/en.json: missing key "${key}"`);
    errors++;
  }
}

if (errors > 0) {
  console.error(`\n${errors} problem(s) found`);
  process.exit(1);
}

console.log(`✓ ${files.length} templates without inline styles, ${en.size} i18n keys in sync`);
