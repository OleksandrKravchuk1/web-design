# Dev Tools Showcase — мікроутиліти для розробників

Курсовий проєкт з дисципліни «Веб-технології та веб-дизайн» (КПІ ім. Ігоря Сікорського, ННІ ПСА).
Тема **№ 7 — Dev Tools Showcase**. Сторінки: **Home**, **Tools list**, **Tool details (демо)**, **About**.
Дані: `tools`, `categories`, `snippets` (`api/db.json`, префікс `t7_`).

Основа — стартовий шаблон курсу [web-template-2025](https://github.com/MarkovDmitriy/web-template-2025).
Збірка — **Vite** (Webpack-частину шаблону прибрано, щоб не підтримувати дві збірки).

## Запуск

```bash
npm install
npm run dev        # Vite (http://localhost:5173) + json-server (http://localhost:5174)
npm run build      # lint → перевірка шаблонів → vite build → валідація HTML і посилань
npm run preview    # перегляд зібраного dist/
```

Preview публікується на GitHub Pages workflow-ом `.github/workflows/deploy.yml`
(Settings → Pages → Source: **GitHub Actions**).

## Структура

```
index.html  tools.html  tool.html  about.html   # 4 сторінки (HTML + EJS-включення)
src/
  templates/partials/   # EJS: head, header, footer, tool-card, breadcrumbs, picture
  i18n/en.json uk.json  # словники; EJS бере англійський текст з en.json під час збірки
  data/site.json        # назва, версія, посилання на репозиторій
  js/main.js            # ЛР2: лише i18n; ЛР4: каталог, фільтри, API
  js/core/i18n.js       # застосування data-i18n / data-i18n-attr
  js/api/               # axios + ендпоінти теми 7 (для ЛР4)
  styles/               # SCSS 7-1 з шаблону — підключається в ЛР3
public/images/          # адаптивні зображення (webp + jpg, кілька ширин)
api/db.json             # json-server; t7_tools / t7_categories / t7_snippets розширено під дизайн
scripts/                # перевірки збірки + генерація зображень
```

---

## ЛР 2 — HTML-розмітка та семантика

Стилів немає навмисно: розмітка готова до ЛР3 — класи за **BEM** з префіксом `dt-`
(`dt-tool-card__title`, `dt-button--accent`), **жодних інлайнових стилів** (перевіряється скриптом під час збірки).

### Обов'язкова частина (6 балів)

| Вимога | Де виконано |
| --- | --- |
| Семантичні теги | `header`, `nav` (головна, хлібні крихти, пагінація, підвал, мова), `main`, `section`, `article` (картки, принципи, сторінка інструменту), `aside` (фільтри, шпаргалка, приватність, схожі інструменти, CTA), `footer` (сторінки й карток), а також `figure/figcaption`, `dl`, `time`, `data`, `kbd`, `output`, `details/summary`, `dialog` |
| Таблиці | `tool.html` — клавіатурні скорочення; `about.html` — бенчмарки (`caption`, `th scope`) |
| Форми | пошук у hero і Quick Find (`role="search"`), фільтри каталогу (`fieldset/legend`, radio, select, checkbox), робоча область JSON (`textarea`, `input type=file`, `output`), форма «Suggest a micro-tool» (валідація `required`, `autocomplete`, `aria-describedby`) |
| `picture` + `srcset` | усі ключові зображення: webp + jpg запасний варіант, `sizes`; hero / preview — **art direction** (окремий кадр для `max-width: 767px`); `width`/`height` проти CLS, `loading="lazy"` |
| `alt` і `aria-label` | змістовні `alt` у скріншотів; обкладинки карток декоративні (`alt=""` — назва вже є в заголовку картки, за WCAG H67); `aria-label`/`aria-labelledby` для навігацій і кнопок, `aria-current="page"`, `aria-describedby` для кнопок Launch, `aria-pressed`, `aria-keyshortcuts` |
| Навігація відносними посиланнями | `./index.html`, `./tools.html`, `./tool.html?tool=…`, `./about.html`; зображення `images/…`; Vite `base: './'` — сайт працює і з підпапки GitHub Pages. Скрипт `scripts/check-dist.js` перевіряє, що **всі** відносні посилання й `srcset` ведуть на існуючі файли |

### Додаткова частина (до 10 балів)

- **Шаблонізатор EJS** (`vite.config.js` → плагін `devtools-ejs-pages`). Шапка, підвал, картка інструменту,
  хлібні крихти й `<picture>` — це партіали в `src/templates/partials`. Картки рендеряться з `api/db.json`,
  тобто з тих самих даних, які в ЛР4 віддаватиме json-server.
- **Мікророзмітка schema.org**: `SoftwareApplication` (картки й сторінка інструменту: name, description,
  applicationCategory, operatingSystem, softwareVersion, offers, author, license, screenshot, datePublished),
  `ItemList` (каталог), `BreadcrumbList`, `FAQPage` (About).

### Бонус (до 12 балів) — підготовка до i18n

- Увесь текст інтерфейсу позначено `data-i18n="ключ"`, атрибути — `data-i18n-attr="placeholder:ключ|aria-label:ключ"`.
- Англійський текст береться з `src/i18n/en.json` під час збірки (єдине джерело правди; неіснуючий ключ ламає збірку).
- `src/i18n/uk.json` + `src/js/core/i18n.js` — перемикач EN / UK у підвалі (`?lang=uk`, вибір запам'ятовується).
  Без JavaScript сторінки повністю працюють англійською.

### Доступність (додаткові бали)

Skip-link, один `h1` на сторінку і послідовні рівні заголовків, `label` для кожного поля,
Quick Find відкривається через Popover API (`popovertarget`) — працює з клавіатури без жодного JS.

### Автоматичні перевірки (`npm run build`)

1. ESLint (конфіг перенесено на flat config ESLint 9 — `.eslintrc.cjs` шаблону ESLint 9 більше не читає).
2. `scripts/check-src.js` — немає `style=` / `<style>`, словники EN/UK мають однакові ключі.
3. `vite build`.
4. `html-validate` (рекомендований набір правил) для всіх сторінок `dist/`.
5. `scripts/check-dist.js` — битих посилань і зображень немає, усі `data-i18n` ключі існують.

---

## Наступні роботи

- **ЛР3** — SCSS 7-1 у `src/styles`, міксини/функції, брейкпоінти 360–390 / 768 / ≥1280.
- **ЛР4** — `src/js/api` + json-server `/topic7/*`: фільтри, пошук, сортування, пагінація, форми, localStorage.
