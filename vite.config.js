import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ejs from "ejs";

const root = dirname(fileURLToPath(import.meta.url));
const TEMPLATES = resolve(root, "src/templates");

/** Сторінки проєкту (multi-page build). Нові сторінки додаємо по мірі готовності. */
const PAGES = {
  home: "index.html",
};

/**
 * Дані для шаблонів читаються щоразу заново,
 * щоб зміни в db.json / словнику одразу з'являлися в dev-режимі.
 */
function templateData() {
  const db = JSON.parse(readFileSync(resolve(root, "api/db.json"), "utf8"));
  const en = JSON.parse(readFileSync(resolve(root, "src/i18n/en.json"), "utf8"));

  const categories = db.t7_categories;
  const tools = db.t7_tools.map((tool) => ({
    ...tool,
    category: categories.find((c) => c.id === tool.categoryId),
    snippets: db.t7_snippets.filter((s) => s.toolId === tool.id),
  }));

  /** t('nav.home') → англійський текст зі словника (ключ дублюється в data-i18n) */
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
    toolUrl: (tool) => `tool.html?tool=${tool.slug}`,
  };
}

/**
 * EJS як серверний (build-time) шаблонізатор: шапка, підвал, картки
 * підключаються через <%- include('partials/...') %> прямо в HTML-сторінках.
 */
function ejsPages() {
  return {
    name: "devtools-ejs-pages",
    transformIndexHtml: {
      order: "pre",
      handler(html, ctx) {
        const page = Object.keys(PAGES).find((key) => ctx.filename.endsWith(PAGES[key])) || "home";
        return ejs.render(html, { ...templateData(), page }, {
          filename: ctx.filename,
          views: [TEMPLATES],
        });
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
  // відносні шляхи — сайт працює і з кореня домену, і з підпапки GitHub Pages
  base: "./",
  root: ".",
  plugins: [ejsPages()],
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
