import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ejs from "ejs";

const root = dirname(fileURLToPath(import.meta.url));
const TEMPLATES = resolve(root, "src/templates");
const ICONS = resolve(root, "node_modules/@material-symbols/svg-400/outlined");

const iconPaths = new Map();

// Inline Material Symbols icon (same set as the ЛР1 mockup), decorative only.
function icon(name, cls = "") {
  if (!iconPaths.has(name)) {
    const svg = readFileSync(resolve(ICONS, `${name}.svg`), "utf8");
    const paths = [...svg.matchAll(/<path d="([^"]+)"/g)].map((match) => match[1]);
    if (paths.length === 0) {
      throw new Error(`[icon] No <path> in ${name}.svg`);
    }
    iconPaths.set(name, paths.join(" "));
  }
  const className = cls ? `dt-icon ${cls}` : "dt-icon";
  return `<svg class="${className}" viewBox="0 -960 960 960" aria-hidden="true" focusable="false"><path d="${iconPaths.get(name)}"/></svg>`;
}

const PAGES = {
  home: "index.html",
  tools: "tools.html",
  tool: "tool.html",
  about: "about.html",
};

function templateData() {
  const db = JSON.parse(readFileSync(resolve(root, "api/db.json"), "utf8"));
  const en = JSON.parse(readFileSync(resolve(root, "src/i18n/en.json"), "utf8"));

  const categories = db.t7_categories;
  const tools = db.t7_tools.map((tool) => ({
    ...tool,
    category: categories.find((c) => c.id === tool.categoryId),
    snippets: db.t7_snippets.filter((s) => s.toolId === tool.id),
  }));

  const t = (key) => {
    const value = key.split(".").reduce((obj, part) => (obj ? obj[part] : undefined), en);
    if (typeof value !== "string") {
      throw new Error(`[i18n] Missing key "${key}" in src/i18n/en.json`);
    }
    return value;
  };

  return {
    site: JSON.parse(readFileSync(resolve(root, "src/data/site.json"), "utf8")),
    tools,
    categories,
    featured: tools.filter((tool) => tool.featured).sort((a, b) => a.featured - b.featured),
    year: new Date().getFullYear(),
    t,
    icon,
    toolUrl: (tool) => `tool.html?tool=${tool.slug}`,
  };
}

function ejsPages() {
  return {
    name: "devtools-ejs-pages",
    transformIndexHtml: {
      order: "pre",
      handler(html, ctx) {
        const page = Object.keys(PAGES).find((key) => ctx.filename.endsWith(PAGES[key])) || "home";
        const rendered = ejs.render(html, { ...templateData(), page }, {
          filename: ctx.filename,
          views: [TEMPLATES],
        });
        return rendered.replace(/[ \t]+(?=\r?\n)/g, "");
      },
    },
    handleHotUpdate({ file, server }) {
      const path = file.replaceAll("\\", "/");
      if (path.endsWith(".ejs") || path.endsWith("db.json") || path.includes("/i18n/")) {
        server.ws.send({ type: "full-reload" });
      }
    },
  };
}

export default defineConfig({
  base: "./",
  root: ".",
  plugins: [ejsPages()],
  css: {
    preprocessorOptions: {
      scss: { api: "modern-compiler" },
    },
  },
  server: { port: 5173, open: true },
  preview: { port: 4173 },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      input: Object.fromEntries(
        Object.entries(PAGES).map(([name, file]) => [name, resolve(root, file)]),
      ),
    },
  },
});
